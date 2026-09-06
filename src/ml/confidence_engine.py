
import pandas as pd
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

INPUT_PATH = Path(
    "data/processed/evidence_engine.csv"
)

OUTPUT_PATH = Path(
    "data/processed/confidence_engine.csv"
)


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(INPUT_PATH)


# ============================================================
# REQUIRED COLUMNS
# ============================================================

required_columns = [
    "Mine Name",
    "Environmental_Available",
    "Operational_Available",
    "Safety_Evidence_Available",
    "Evidence_Coverage",
    "Evidence_Status"
]

missing_columns = [
    col for col in required_columns
    if col not in df.columns
]

if missing_columns:
    raise KeyError(
        f"Missing columns in evidence_engine.csv: "
        f"{missing_columns}"
    )


# ============================================================
# CLEAN / NUMERIC CONVERSION
# ============================================================

for col in [
    "Environmental_Available",
    "Operational_Available",
    "Safety_Evidence_Available",
    "Evidence_Coverage"
]:
    df[col] = pd.to_numeric(
        df[col],
        errors="coerce"
    )


# ============================================================
# CONFIDENCE COMPONENTS
# ============================================================
#
# Current mine-level evidence domains:
#
# Environmental = 1 if available
# Operational  = 1 if available
# Safety       = 1 only if mine-level safety evidence exists
#
# Current project:
# Safety_Evidence_Available = 0
# because accident data is state/year level.
#
# Therefore confidence is based on the evidence that is
# actually available, not on unavailable datasets.
# ============================================================

df["Environmental_Component"] = (
    df["Environmental_Available"]
)

df["Operational_Component"] = (
    df["Operational_Available"]
)

df["Safety_Component"] = (
    df["Safety_Evidence_Available"]
)


# ============================================================
# AVAILABLE EVIDENCE COUNT
# ============================================================

df["Available_Evidence_Domains"] = (
    df["Environmental_Available"]
    +
    df["Operational_Available"]
    +
    df["Safety_Evidence_Available"]
)


# ============================================================
# CONFIDENCE SCORE
# ============================================================
#
# Important:
#
# We do NOT give unavailable safety evidence a penalty
# by treating it as negative evidence.
#
# Confidence is calculated from domains that actually exist.
#
# Environmental = 50%
# Operational  = 50%
#
# If safety evidence becomes available later, the formula
# can be extended.
# ============================================================

df["Confidence_Score"] = 0.0


# Both environmental + operational
both_available = (
    (df["Environmental_Available"] == 1)
    &
    (df["Operational_Available"] == 1)
)

df.loc[
    both_available,
    "Confidence_Score"
] = 100.0


# Environmental only
environmental_only = (
    (df["Environmental_Available"] == 1)
    &
    (df["Operational_Available"] == 0)
)

df.loc[
    environmental_only,
    "Confidence_Score"
] = 60.0


# Operational only
operational_only = (
    (df["Environmental_Available"] == 0)
    &
    (df["Operational_Available"] == 1)
)

df.loc[
    operational_only,
    "Confidence_Score"
] = 60.0


# No evidence
no_evidence = (
    df["Available_Evidence_Domains"] == 0
)

df.loc[
    no_evidence,
    "Confidence_Score"
] = 0.0


# ============================================================
# CONFIDENCE CATEGORY
# ============================================================

def confidence_category(score):

    if score >= 80:
        return "High"

    if score >= 50:
        return "Moderate"

    if score > 0:
        return "Low"

    return "Insufficient Evidence"


df["Confidence_Category"] = (
    df["Confidence_Score"]
    .apply(confidence_category)
)


# ============================================================
# CONFIDENCE EXPLANATION
# ============================================================

def confidence_explanation(row):

    env = row["Environmental_Available"]
    op = row["Operational_Available"]
    safety = row["Safety_Evidence_Available"]

    if env == 1 and op == 1 and safety == 1:
        return (
            "Environmental, operational and mine-level "
            "safety evidence are available."
        )

    if env == 1 and op == 1:
        return (
            "Environmental and operational evidence are "
            "available; mine-level safety evidence is "
            "not available."
        )

    if env == 1:
        return (
            "Only environmental evidence is available; "
            "operational and mine-level safety evidence "
            "are unavailable."
        )

    if op == 1:
        return (
            "Only operational evidence is available; "
            "environmental and mine-level safety evidence "
            "are unavailable."
        )

    return (
        "No mine-level evidence is available for "
        "risk assessment."
    )


df["Confidence_Explanation"] = df.apply(
    confidence_explanation,
    axis=1
)


# ============================================================
# DATA LIMITATION
# ============================================================

df["Assessment_Limitation"] = (
    "Confidence reflects available mine-level evidence "
    "only. Current accident data is state/year level and "
    "is not assigned to individual mines."
)


# ============================================================
# VALIDATION
# ============================================================

print()
print("=" * 70)
print("ASSESSMENT CONFIDENCE ENGINE")
print("=" * 70)

print(
    f"Total mines: {len(df)}"
)

print()
print("Confidence Category:")
print(
    df["Confidence_Category"]
    .value_counts()
)


print()
print("=" * 70)
print("IMPORTANT MINE CHECK")
print("=" * 70)

important_mines = df[
    df["Mine Name"].isin(
        ["Dipka", "Gevra"]
    )
]

check_columns = [
    "Mine Name",
    "Evidence_Status",
    "Environmental_Available",
    "Operational_Available",
    "Safety_Evidence_Available",
    "Evidence_Coverage",
    "Available_Evidence_Domains",
    "Confidence_Score",
    "Confidence_Category",
    "Confidence_Explanation"
]

print(
    important_mines[
        check_columns
    ].to_string(index=False)
)


# ============================================================
# DUPLICATE VALIDATION
# ============================================================

print()
print("=" * 70)
print("DUPLICATE VALIDATION")
print("=" * 70)

duplicate_count = (
    df["Mine Name"]
    .duplicated()
    .sum()
)

if duplicate_count == 0:
    print(
        "PASS: One confidence record per master mine."
    )
else:
    print(
        f"FAIL: {duplicate_count} duplicate "
        f"mine records found."
    )


# ============================================================
# CONFIDENCE VALIDATION
# ============================================================

print()
print("=" * 70)
print("CONFIDENCE VALIDATION")
print("=" * 70)

invalid_scores = df[
    (df["Confidence_Score"] < 0)
    |
    (df["Confidence_Score"] > 100)
]

if invalid_scores.empty:
    print(
        "PASS: All confidence scores are between 0 and 100."
    )
else:
    print(
        f"FAIL: {len(invalid_scores)} invalid confidence "
        f"scores found."
    )


# ============================================================
# SAVE
# ============================================================

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

