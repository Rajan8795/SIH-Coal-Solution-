import pandas as pd
from pathlib import Path


# =========================================================
# PATHS
# =========================================================

EVIDENCE_PATH = Path(
    "data/processed/evidence_engine.csv"
)

CONFIDENCE_PATH = Path(
    "data/processed/confidence_engine.csv"
)

PEER_PATH = Path(
    "data/processed/mine_context_analysis.csv"
)

OUTPUT_PATH = Path(
    "data/processed/risk_engine.csv"
)


# =========================================================
# 1. LOAD DATA
# =========================================================

evidence = pd.read_csv(EVIDENCE_PATH)
confidence = pd.read_csv(CONFIDENCE_PATH)
peer = pd.read_csv(PEER_PATH)

print("Evidence records:", len(evidence))
print("Confidence records:", len(confidence))
print("Peer context records:", len(peer))


# =========================================================
# 2. VALIDATE REQUIRED COLUMNS
# =========================================================

required_evidence = [
    "Mine Name",
    "Environmental_Risk_Score",
    "Environmental_Available",
    "Operational_ZScore",
    "Operational_Available",
    "Safety_Evidence_Available",
    "Evidence_Coverage",
    "Evidence_Status"
]

required_confidence = [
    "Mine Name",
    "Confidence_Score",
    "Confidence_Category"
]

required_peer = [
    "Mine Name",
    "Mine_Type",
    "Peer_Production_ZScore",
    "Peer_Production_Anomaly",
    "Peer_Operational_Risk",
    "Peer_Production_Category",
    "Peer_Production_Direction"
]


for col in required_evidence:
    if col not in evidence.columns:
        raise KeyError(
            f"Missing evidence column: {col}"
        )


for col in required_confidence:
    if col not in confidence.columns:
        raise KeyError(
            f"Missing confidence column: {col}"
        )


for col in required_peer:
    if col not in peer.columns:
        raise KeyError(
            f"Missing peer column: {col}"
        )


# =========================================================
# 3. MERGE CONFIDENCE
# =========================================================

confidence = confidence[
    [
        "Mine Name",
        "Confidence_Score",
        "Confidence_Category"
    ]
].copy()


df = evidence.merge(
    confidence,
    on="Mine Name",
    how="left"
)


# =========================================================
# 4. PREPARE PEER CONTEXT
# =========================================================

peer = peer[
    [
        "Mine Name",
        "Mine_Type",
        "Peer_Production_ZScore",
        "Peer_Production_Anomaly",
        "Peer_Operational_Risk",
        "Peer_Production_Category",
        "Peer_Production_Direction"
    ]
].copy()


# Excel dataset has 408 records but 404 unique mine names.
# Keep one contextual record per mine.

peer = (
    peer
    .sort_values(
        "Peer_Production_ZScore",
        key=lambda x: x.abs(),
        ascending=False
    )
    .drop_duplicates(
        subset=["Mine Name"],
        keep="first"
    )
)


df = df.merge(
    peer,
    on="Mine Name",
    how="left"
)


# =========================================================
# 5. NUMERIC CONVERSION
# =========================================================

numeric_columns = [
    "Environmental_Risk_Score",
    "Environmental_Available",
    "Operational_ZScore",
    "Operational_Available",
    "Safety_Evidence_Available",
    "Evidence_Coverage",
    "Confidence_Score",
    "Peer_Production_ZScore",
    "Peer_Operational_Risk",
    "Peer_Production_Anomaly"
]


for col in numeric_columns:

    if col in df.columns:

        df[col] = pd.to_numeric(
            df[col],
            errors="coerce"
        )


# =========================================================
# 6. HISTORICAL OPERATIONAL RISK
# =========================================================
#
# Production_ZScore was renamed to Operational_ZScore
# in evidence_engine.py.
#
# Therefore risk_engine must use Operational_ZScore.
# =========================================================

df["Historical_Operational_Risk"] = (
    df["Operational_ZScore"]
    .abs()
    .div(4)
    .mul(100)
    .clip(0, 100)
)


# =========================================================
# 7. PEER PRODUCTION CONTEXT
# =========================================================

df["Peer_Production_Anomaly"] = (
    df["Peer_Production_Anomaly"]
    .fillna(0)
    .astype(int)
)

df["Peer_Operational_Risk"] = (
    df["Peer_Operational_Risk"]
    .clip(0, 100)
)


# =========================================================
# 8. OPERATIONAL RISK
# =========================================================
#
# Historical production signal is the primary
# operational risk signal.
#
# Peer production is contextual evidence and does
# not directly dominate the operational risk.
# =========================================================

df["Operational_Risk_Score"] = (
    df["Historical_Operational_Risk"]
)


# =========================================================
# 9. SAFETY RISK
# =========================================================
#
# Current accident data is state/year level.
# It is NOT assigned to individual mines.
# Therefore no mine-level safety risk is calculated.
# =========================================================

df["Safety_Risk_Score"] = pd.NA


# =========================================================
# 10. RISK WEIGHTS
# =========================================================

ENV_WEIGHT = 0.50
SAFETY_WEIGHT = 0.25
OPERATIONAL_WEIGHT = 0.25


# =========================================================
# 11. OVERALL RISK
# =========================================================

def calculate_risk(row):

    weighted_score = 0.0
    available_weight = 0.0

    # Environmental
    if (
        row["Environmental_Available"] == 1
        and pd.notna(row["Environmental_Risk_Score"])
    ):

        weighted_score += (
            ENV_WEIGHT
            * row["Environmental_Risk_Score"]
        )

        available_weight += ENV_WEIGHT


    # Operational
    if (
        row["Operational_Available"] == 1
        and pd.notna(row["Operational_Risk_Score"])
    ):

        weighted_score += (
            OPERATIONAL_WEIGHT
            * row["Operational_Risk_Score"]
        )

        available_weight += OPERATIONAL_WEIGHT


    # Safety
    if (
        row["Safety_Evidence_Available"] == 1
        and pd.notna(row["Safety_Risk_Score"])
    ):

        weighted_score += (
            SAFETY_WEIGHT
            * row["Safety_Risk_Score"]
        )

        available_weight += SAFETY_WEIGHT


    if available_weight == 0:
        return pd.NA


    return (
        weighted_score
        /
        available_weight
    )


df["Overall_Risk_Score"] = df.apply(
    calculate_risk,
    axis=1
)


# =========================================================
# 12. RISK CATEGORY
# =========================================================

def classify_risk(score):

    if pd.isna(score):
        return "Insufficient Evidence"

    if score <= 30:
        return "LOW"

    if score <= 60:
        return "MEDIUM"

    if score <= 80:
        return "HIGH"

    return "CRITICAL"


df["Risk_Category"] = (
    df["Overall_Risk_Score"]
    .apply(classify_risk)
)


# =========================================================
# 13. RISK DRIVERS
# =========================================================

def identify_drivers(row):

    drivers = []

    env = row["Environmental_Risk_Score"]
    op = row["Operational_Risk_Score"]

    if (
        pd.notna(env)
        and env >= 60
    ):
        drivers.append(
            "Environmental indicator"
        )


    if (
        pd.notna(op)
        and op >= 60
    ):
        drivers.append(
            "Operational indicator"
        )


    # Peer anomaly is supporting context only.

    if row["Peer_Production_Anomaly"] == 1:

        drivers.append(
            "Peer production anomaly"
        )


    if not drivers:

        return "No major risk indicator"


    return ", ".join(drivers)


df["Risk_Drivers"] = df.apply(
    identify_drivers,
    axis=1
)


# =========================================================
# 14. RISK RECOMMENDATION
# =========================================================

def generate_recommendation(row):

    category = row["Risk_Category"]


    if category == "CRITICAL":

        return (
            "Priority Inspection / "
            "Further Assessment Required"
        )


    if category == "HIGH":

        return (
            "Further Assessment Required"
        )


    if category == "MEDIUM":

        return (
            "Monitoring and Review Required"
        )


    if category == "LOW":

        return (
            "No Immediate High-Risk "
            "Indicator Detected"
        )


    return (
        "Insufficient Evidence for "
        "Risk Assessment"
    )


df["AI_Recommendation"] = df.apply(
    generate_recommendation,
    axis=1
)


# =========================================================
# 15. PEER CONTEXT EXPLANATION
# =========================================================

def generate_context_explanation(row):

    if row["Peer_Production_Anomaly"] == 1:

        direction = row["Peer_Production_Direction"]

        mine_type = row["Mine_Type"]

        if pd.isna(direction):
            direction = "unusual"

        if pd.isna(mine_type):
            mine_type = "similar"

        return (
            f"Production is {str(direction).lower()} "
            f"compared with the {mine_type} peer group."
        )


    return (
        "No unusual peer-group production "
        "pattern detected."
    )


df["Peer_Context_Explanation"] = df.apply(
    generate_context_explanation,
    axis=1
)


# =========================================================
# 16. PROTOTYPE DISCLAIMER
# =========================================================

df["Risk_Score_Type"] = (
    "Prototype AI risk indicator - "
    "not an official regulatory classification"
)


# =========================================================
# 17. OUTPUT VALIDATION
# =========================================================

print()
print("=" * 70)
print("RISK ENGINE")
print("=" * 70)


print(
    "Total risk records:",
    len(df)
)


print()
print("Risk Categories:")

print(
    df["Risk_Category"]
    .value_counts(
        dropna=False
    )
)


# =========================================================
# 18. IMPORTANT MINE CHECK
# =========================================================

print()
print("=" * 70)
print("IMPORTANT MINE CHECK")
print("=" * 70)


important_mines = [
    "Dipka",
    "Gevra"
]


important = df[
    df["Mine Name"].isin(
        important_mines
    )
]


if len(important) > 0:

    check_columns = [
        "Mine Name",
        "Mine_Type",
        "Environmental_Risk_Score",
        "Historical_Operational_Risk",
        "Peer_Operational_Risk",
        "Operational_Risk_Score",
        "Overall_Risk_Score",
        "Risk_Category",
        "Risk_Drivers",
        "Peer_Context_Explanation",
        "Confidence_Score"
    ]


    print(
        important[
            check_columns
        ].to_string(index=False)
    )

else:

    print(
        "WARNING: Dipka/Gevra not found."
    )


# =========================================================
# 19. VALIDATION
# =========================================================

print()
print("=" * 70)
print("VALIDATION")
print("=" * 70)


if len(df) == len(evidence):

    print(
        "PASS: Mine count preserved."
    )

else:

    print(
        "FAIL: Mine count changed."
    )


valid_scores = (
    df["Overall_Risk_Score"]
    .dropna()
    .between(0, 100)
    .all()
)


if valid_scores:

    print(
        "PASS: Risk scores are between 0 and 100."
    )

else:

    print(
        "FAIL: Invalid risk score detected."
    )


duplicate_count = (
    df["Mine Name"]
    .duplicated()
    .sum()
)


if duplicate_count == 0:

    print(
        "PASS: One risk record per mine."
    )

else:

    print(
        f"FAIL: {duplicate_count} "
        "duplicate mine records."
    )


# =========================================================
# 20. SAVE
# =========================================================

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_PATH,
    index=False
)


print()
print(
    f"Saved to: {OUTPUT_PATH}"
)

print("=" * 70)