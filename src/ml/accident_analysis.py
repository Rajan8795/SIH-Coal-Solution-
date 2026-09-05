import pandas as pd
from pathlib import Path

# -----------------------------
# 1. File paths
# -----------------------------

INPUT_PATH = Path("data/processed/accident_features.csv")
OUTPUT_PATH = Path("data/processed/accident_analysis.csv")


# -----------------------------
# 2. Load feature dataset
# -----------------------------

df = pd.read_csv(INPUT_PATH)

print("Input shape:", df.shape)


# -----------------------------
# 3. Overall accident Z-score
# -----------------------------

mean_accidents = df["Total Accidents"].mean()
std_accidents = df["Total Accidents"].std()

df["Accident_ZScore"] = (
    (df["Total Accidents"] - mean_accidents)
    / std_accidents
)

df["Absolute_Accident_ZScore"] = (
    df["Accident_ZScore"].abs()
)


# -----------------------------
# 4. State-level deviation
# -----------------------------
# Measures how much a year's accidents
# differ from the state's historical average.

df["State_Accident_Deviation"] = (
    df["Accident_Deviation"]
)


# -----------------------------
# 5. State-level anomaly
# -----------------------------
# Use state-level standard deviation.
# This is better than comparing every
# state against one global average.

df["State_Accident_ZScore"] = (
    df["State_Accident_Deviation"]
    / df["State_Accident_Std"]
)

df["Absolute_State_Accident_ZScore"] = (
    df["State_Accident_ZScore"].abs()
)


# -----------------------------
# 6. Identify unusual accident patterns
# -----------------------------

df["Accident_Anomaly"] = (
    (
        df["Absolute_State_Accident_ZScore"] >= 2
    )
    &
    (
        df["Data_Available"] == 1
    )
).astype(int)


# -----------------------------
# 7. Categorize accident pattern
# -----------------------------

def categorize_accident(row):

    if row["Data_Available"] == 0:
        return "Insufficient Data"

    z = abs(row["State_Accident_ZScore"])

    if z >= 3:
        return "Highly Unusual"

    elif z >= 2:
        return "Unusual"

    else:
        return "Normal"


df["Accident_Anomaly_Category"] = (
    df.apply(categorize_accident, axis=1)
)


# -----------------------------
# 8. Accident direction
# -----------------------------

def accident_direction(z):

    if z > 0:
        return "Higher than state average"

    elif z < 0:
        return "Lower than state average"

    else:
        return "Same as state average"


df["Accident_Pattern"] = (
    df["State_Accident_ZScore"]
    .apply(accident_direction)
)


# -----------------------------
# 9. Fatal accident ratio
# -----------------------------

df["Fatality_Risk_Pattern"] = (
    df["Fatal_Accident_Ratio"].apply(
        lambda x:
        "Higher fatal accident proportion"
        if x >= 0.30
        else "Lower fatal accident proportion"
    )
)


# -----------------------------
# 10. Accident trend
# -----------------------------

def accident_trend(change):

    if pd.isna(change):
        return "No previous year data"

    if change > 0:
        return "Increasing"

    elif change < 0:
        return "Decreasing"

    else:
        return "Stable"


df["Accident_Trend"] = (
    df["Total_Accident_Change"]
    .apply(accident_trend)
)


# -----------------------------
# 11. Sort by unusual pattern
# -----------------------------

df = df.sort_values(
    "Absolute_State_Accident_ZScore",
    ascending=False
).reset_index(drop=True)


# -----------------------------
# 12. Summary
# -----------------------------

total_records = len(df)

anomaly_count = (
    df["Accident_Anomaly"].sum()
)

print("\n========== ACCIDENT ANALYSIS ==========")

print("Mean total accidents:", mean_accidents)
print("Overall standard deviation:", std_accidents)

print("Total records:", total_records)
print("Unusual records:", anomaly_count)

print(
    "Anomaly percentage:",
    round(
        (anomaly_count / total_records) * 100,
        2
    ),
    "%"
)


# -----------------------------
# 13. Top unusual accident patterns
# -----------------------------

print("\n========== TOP UNUSUAL PATTERNS ==========")

print(
    df[
        [
            "Year",
            "State",
            "Total Accidents",
            "State_Accident_Deviation",
            "State_Accident_ZScore",
            "Fatal_Accident_Ratio",
            "Accident_Anomaly_Category",
            "Accident_Pattern",
            "Accident_Trend"
        ]
    ].head(10)
)


# -----------------------------
# 14. Highest accident states
# -----------------------------

print("\n========== HIGHEST ACCIDENT STATES ==========")

state_summary = (
    df.groupby("State")["Total Accidents"]
    .sum()
    .sort_values(ascending=False)
)

print(state_summary.head(10))


# -----------------------------
# 15. Year-wise accidents
# -----------------------------

print("\n========== YEAR-WISE ACCIDENTS ==========")

year_summary = (
    df.groupby("Year")["Total Accidents"]
    .sum()
    .sort_values(ascending=False)
)

print(year_summary)


# -----------------------------
# 16. Fatal accident analysis
# -----------------------------

print("\n========== FATAL ACCIDENT ANALYSIS ==========")

fatal_summary = (
    df.groupby("State")["Number of Fatal accident"]
    .sum()
    .sort_values(ascending=False)
)

print(fatal_summary.head(10))


# -----------------------------
# 17. Save analysis
# -----------------------------

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_PATH,
    index=False
)


print("\n========== ANALYSIS COMPLETED ==========")

print("Output shape:", df.shape)

print("Saved to:")
print(OUTPUT_PATH)
