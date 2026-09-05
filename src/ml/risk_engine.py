import pandas as pd
from pathlib import Path

EVIDENCE_PATH = Path("data/processed/evidence_engine.csv")
CONFIDENCE_PATH = Path("data/processed/confidence_engine.csv")
PEER_PATH = Path("data/processed/mine_context_analysis.csv")
OUTPUT_PATH = Path("data/processed/risk_engine.csv")


# --------------------------------------------------
# 1. Load data
# --------------------------------------------------

evidence = pd.read_csv(EVIDENCE_PATH)
confidence = pd.read_csv(CONFIDENCE_PATH)
peer = pd.read_csv(PEER_PATH)

print("Evidence records:", len(evidence))
print("Confidence records:", len(confidence))
print("Peer context records:", len(peer))


# --------------------------------------------------
# 2. Merge confidence
# --------------------------------------------------

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


# --------------------------------------------------
# 3. Prepare peer context
# --------------------------------------------------

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

# New Excel has 408 records but 404 unique mine names.
# Keep one contextual record per mine.

peer = (
    peer.sort_values(
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


# --------------------------------------------------
# 4. Environmental risk
# --------------------------------------------------

df["Environmental_Risk_Score"] = pd.to_numeric(
    df["Environmental_Risk_Score"],
    errors="coerce"
)


# --------------------------------------------------
# 5. Historical operational risk
# --------------------------------------------------

df["Production_ZScore"] = pd.to_numeric(
    df["Production_ZScore"],
    errors="coerce"
)

df["Historical_Operational_Risk"] = (
    df["Production_ZScore"]
    .abs()
    .div(4)
    .mul(100)
    .clip(0, 100)
)


# --------------------------------------------------
# 6. Peer production context
# --------------------------------------------------

df["Peer_Operational_Risk"] = pd.to_numeric(
    df["Peer_Operational_Risk"],
    errors="coerce"
)

df["Peer_Production_Anomaly"] = (
    pd.to_numeric(
        df["Peer_Production_Anomaly"],
        errors="coerce"
    )
    .fillna(0)
    .astype(int)
)


# --------------------------------------------------
# 7. Operational risk
# --------------------------------------------------
# IMPORTANT:
#
# Peer production is contextual evidence.
# It should NOT replace or directly dominate the
# historical operational risk.
#
# Therefore the main operational risk remains based
# on the historical production signal.

df["Operational_Risk_Score"] = (
    df["Historical_Operational_Risk"]
)


# --------------------------------------------------
# 8. Safety risk
# --------------------------------------------------
# Current accident dataset is state/year level.
# Therefore no mine-level safety risk is assigned.

df["Safety_Risk_Score"] = pd.NA


# --------------------------------------------------
# 9. Evidence availability
# --------------------------------------------------

df["Environmental_Available"] = (
    pd.to_numeric(
        df["Environmental_Available"],
        errors="coerce"
    )
    .fillna(0)
    .astype(int)
)

df["Operational_Available"] = (
    pd.to_numeric(
        df["Operational_Available"],
        errors="coerce"
    )
    .fillna(0)
    .astype(int)
)

df["Safety_Evidence_Available"] = 0


# --------------------------------------------------
# 10. Risk weights
# --------------------------------------------------

ENV_WEIGHT = 0.50
SAFETY_WEIGHT = 0.25
OPERATIONAL_WEIGHT = 0.25


# --------------------------------------------------
# 11. Calculate overall risk
# --------------------------------------------------

def calculate_risk(row):

    weighted_score = 0
    available_weight = 0

    # Environmental evidence
    if (
        row["Environmental_Available"] == 1
        and pd.notna(row["Environmental_Risk_Score"])
    ):
        weighted_score += (
            ENV_WEIGHT
            * row["Environmental_Risk_Score"]
        )
        available_weight += ENV_WEIGHT

    # Operational evidence
    if (
        row["Operational_Available"] == 1
        and pd.notna(row["Operational_Risk_Score"])
    ):
        weighted_score += (
            OPERATIONAL_WEIGHT
            * row["Operational_Risk_Score"]
        )
        available_weight += OPERATIONAL_WEIGHT

    # Safety evidence
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

    return weighted_score / available_weight


df["Overall_Risk_Score"] = df.apply(
    calculate_risk,
    axis=1
)


# --------------------------------------------------
# 12. Risk category
# --------------------------------------------------

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


# --------------------------------------------------
# 13. Risk drivers
# --------------------------------------------------

def identify_drivers(row):

    drivers = []

    env = row["Environmental_Risk_Score"]
    op = row["Operational_Risk_Score"]

    if pd.notna(env) and env >= 60:
        drivers.append("Environmental indicator")

    if pd.notna(op) and op >= 60:
        drivers.append("Operational indicator")

    # Peer anomaly is supporting context only.
    if row["Peer_Production_Anomaly"] == 1:
        drivers.append("Peer production anomaly")

    if not drivers:
        return "No major risk indicator"

    return ", ".join(drivers)


df["Risk_Drivers"] = df.apply(
    identify_drivers,
    axis=1
)


# --------------------------------------------------
# 14. Recommendation
# --------------------------------------------------

def generate_recommendation(row):

    category = row["Risk_Category"]

    if category == "CRITICAL":
        return "Priority Inspection / Further Assessment Required"

    if category == "HIGH":
        return "Further Assessment Required"

    if category == "MEDIUM":
        return "Monitoring and Review Required"

    if category == "LOW":
        return "No Immediate High-Risk Indicator Detected"

    return "Insufficient Evidence for Risk Assessment"


df["AI_Recommendation"] = df.apply(
    generate_recommendation,
    axis=1
)


# --------------------------------------------------
# 15. Explainability context
# --------------------------------------------------

def generate_context_explanation(row):

    if row["Peer_Production_Anomaly"] == 1:

        direction = row["Peer_Production_Direction"]
        mine_type = row["Mine_Type"]

        return (
            f"Production is {direction.lower()} "
            f"compared with the {mine_type} peer group."
        )

    return "No unusual peer-group production pattern detected."


df["Peer_Context_Explanation"] = df.apply(
    generate_context_explanation,
    axis=1
)


# --------------------------------------------------
# 16. Prototype disclaimer
# --------------------------------------------------

df["Risk_Score_Type"] = (
    "Prototype AI risk indicator - "
    "not an official regulatory classification"
)


# --------------------------------------------------
# 17. Save
# --------------------------------------------------

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_PATH,
    index=False
)


# --------------------------------------------------
# 18. Validation
# --------------------------------------------------

print("\nTotal mines:", len(df))

print("\nRisk Categories:")
print(
    df["Risk_Category"]
    .value_counts(dropna=False)
)

print("\nImportant Mines:")

important_mines = [
    "Dipka",
    "Gevra"
]

print(
    df[
        df["Mine Name"].isin(important_mines)
    ][
        [
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
    ].to_string(index=False)
)

if len(df) == len(evidence):
    print("\nPASS: Mine count preserved.")

if (
    df["Overall_Risk_Score"]
    .dropna()
    .between(0, 100)
    .all()
):
    print("PASS: Risk scores are between 0 and 100.")

print("\nSaved to:", OUTPUT_PATH)