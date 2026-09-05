
import pandas as pd
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

INPUT_PATH = Path(
    "data/processed/risk_engine.csv"
)

OUTPUT_PATH = Path(
    "data/processed/inspection_priority.csv"
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
    "Overall_Risk_Score",
    "Risk_Category",
    "Confidence_Score",
    "Evidence_Coverage",
    "AI_Recommendation"
]


missing_columns = [
    col
    for col in required_columns
    if col not in df.columns
]


if missing_columns:

    raise KeyError(
        f"risk_engine.csv is missing columns: "
        f"{missing_columns}"
    )


# ============================================================
# NUMERIC CONVERSION
# ============================================================

numeric_columns = [
    "Overall_Risk_Score",
    "Confidence_Score",
    "Evidence_Coverage"
]


for col in numeric_columns:

    df[col] = pd.to_numeric(
        df[col],
        errors="coerce"
    )


# ============================================================
# INSPECTION PRIORITY
# ============================================================
#
# IMPORTANT:
#
# Risk Score is the PRIMARY signal.
#
# Confidence and Evidence Coverage DO NOT create risk.
#
# They only determine whether a high-risk signal
# has sufficient supporting evidence for URGENT priority.
#
# Rules:
#
# Risk >= 70 AND
# Confidence >= 80 AND
# Evidence Coverage >= 80
#       -> URGENT
#
# Risk >= 70
#       -> HIGH
#
# Risk >= 40
#       -> MEDIUM
#
# Risk < 40
#       -> LOW
#
# No risk score
#       -> INSUFFICIENT EVIDENCE
# ============================================================


def calculate_priority(row):

    risk = row["Overall_Risk_Score"]
    confidence = row["Confidence_Score"]
    coverage = row["Evidence_Coverage"]

    # --------------------------------------------------------
    # No evidence
    # --------------------------------------------------------

    if pd.isna(risk):

        return "INSUFFICIENT EVIDENCE"


    # --------------------------------------------------------
    # Urgent
    # --------------------------------------------------------

    if (
        risk >= 70
        and confidence >= 80
        and coverage >= 80
    ):

        return "URGENT"


    # --------------------------------------------------------
    # High
    # --------------------------------------------------------

    if risk >= 70:

        return "HIGH"


    # --------------------------------------------------------
    # Medium
    # --------------------------------------------------------

    if risk >= 40:

        return "MEDIUM"


    # --------------------------------------------------------
    # Low
    # --------------------------------------------------------

    return "LOW"


df["Inspection_Priority"] = df.apply(
    calculate_priority,
    axis=1
)


# ============================================================
# PRIORITY SCORE
# ============================================================
#
# Risk remains the numeric priority score.
#
# We intentionally do NOT use:
#
# 0.60 * risk
# + 0.25 * coverage
# + 0.15 * confidence
#
# because that could make a low-risk mine high priority
# simply because its evidence coverage/confidence is high.
# ============================================================

df["Priority_Score"] = (
    df["Overall_Risk_Score"]
)


# ============================================================
# PRIORITY REASON
# ============================================================

def priority_reason(row):

    priority = row["Inspection_Priority"]
    risk = row["Overall_Risk_Score"]
    confidence = row["Confidence_Score"]
    coverage = row["Evidence_Coverage"]

    if priority == "URGENT":

        return (
            f"High risk indicator ({risk:.2f}) with "
            f"strong supporting evidence "
            f"(confidence {confidence:.0f}%, "
            f"coverage {coverage:.0f}%)."
        )


    if priority == "HIGH":

        return (
            f"High risk indicator detected "
            f"(risk score {risk:.2f}). "
            f"Further assessment should be prioritized."
        )


    if priority == "MEDIUM":

        return (
            f"Moderate risk indicator detected "
            f"(risk score {risk:.2f}). "
            f"Monitoring and review recommended."
        )


    if priority == "LOW":

        return (
            f"Low risk indicator "
            f"(risk score {risk:.2f}); "
            f"no immediate high-risk indicator detected."
        )


    return (
        "Insufficient evidence available to determine "
        "inspection priority."
    )


df["Priority_Reason"] = df.apply(
    priority_reason,
    axis=1
)


# ============================================================
# FINAL COLUMNS
# ============================================================

final_columns = [
    "Mine Name",
    "Company Name",
    "State",
    "District",
    "Coalfield",
    "Area",
    "Mine Type",
    "Ownership",

    "Overall_Risk_Score",
    "Risk_Category",

    "Confidence_Score",
    "Confidence_Category",

    "Evidence_Coverage",
    "Evidence_Status",

    "Inspection_Priority",
    "Priority_Score",
    "Priority_Reason",

    "AI_Recommendation"
]


final_columns = [
    col
    for col in final_columns
    if col in df.columns
]


df = df[final_columns]


# ============================================================
# VALIDATION
# ============================================================

print()
print("=" * 70)
print("INSPECTION PRIORITY ENGINE")
print("=" * 70)

print(
    f"Total mines: {len(df)}"
)


print()
print("Inspection Priority:")
print(
    df["Inspection_Priority"]
    .value_counts()
)


# ============================================================
# IMPORTANT MINE CHECK
# ============================================================

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
    "Overall_Risk_Score",
    "Risk_Category",
    "Confidence_Score",
    "Evidence_Coverage",
    "Inspection_Priority",
    "Priority_Score",
    "Priority_Reason"
]


print(
    important_mines[
        check_columns
    ].to_string(index=False)
)


# ============================================================
# LOGIC VALIDATION
# ============================================================

print()
print("=" * 70)
print("PRIORITY LOGIC VALIDATION")
print("=" * 70)


logic_errors = []


for _, row in df.iterrows():

    risk = row["Overall_Risk_Score"]
    confidence = row["Confidence_Score"]
    coverage = row["Evidence_Coverage"]
    priority = row["Inspection_Priority"]


    if pd.isna(risk):

        expected = "INSUFFICIENT EVIDENCE"

    elif (
        risk >= 70
        and confidence >= 80
        and coverage >= 80
    ):

        expected = "URGENT"

    elif risk >= 70:

        expected = "HIGH"

    elif risk >= 40:

        expected = "MEDIUM"

    else:

        expected = "LOW"


    if priority != expected:

        logic_errors.append(
            row["Mine Name"]
        )


if not logic_errors:

    print(
        "PASS: Inspection priority logic is consistent."
    )

else:

    print(
        f"FAIL: {len(logic_errors)} priority "
        f"logic errors found."
    )


# ============================================================
# RISK-PRIORITY SAFETY CHECK
# ============================================================
#
# A LOW risk mine must never become HIGH/URGENT
# only because confidence or coverage is high.
# ============================================================

low_risk_wrong_priority = df[
    (
        df["Overall_Risk_Score"] < 40
    )
    &
    (
        df["Inspection_Priority"].isin(
            ["HIGH", "URGENT"]
        )
    )
]


if low_risk_wrong_priority.empty:

    print(
        "PASS: Low-risk mines are not promoted "
        "to HIGH/URGENT due to evidence coverage."
    )

else:

    print(
        "FAIL: Low-risk mines incorrectly "
        "received HIGH/URGENT priority."
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

