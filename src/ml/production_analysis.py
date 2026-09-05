import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

INPUT_PATH = Path("data/processed/production_features.csv")
OUTPUT_PATH = Path("data/processed/production_analysis.csv")


# ============================================================
# 1. LOAD FEATURE DATA
# ============================================================

print("=" * 80)
print("PRODUCTION ANALYSIS")
print("=" * 80)

df = pd.read_csv(INPUT_PATH)

print("\nInput dataset shape:")
print(df.shape)

print("\nInput columns:")
print(df.columns.tolist())


# ============================================================
# 2. CHECK REQUIRED COLUMN
# ============================================================

required_column = "Latest_Production_Change"

if required_column not in df.columns:
    raise ValueError(
        f"Required column '{required_column}' not found."
    )


# ============================================================
# 3. CONVERT PRODUCTION CHANGE TO NUMERIC
# ============================================================

df[required_column] = pd.to_numeric(
    df[required_column],
    errors="coerce"
)


# ============================================================
# 4. ANALYZE AVAILABLE PRODUCTION CHANGES
# ============================================================

analysis_df = df[
    df[required_column].notna()
].copy()

print("\nMines with available latest production change:")
print(len(analysis_df))


# ============================================================
# 5. CHECK DATA SUFFICIENCY
# ============================================================

if "Data_Sufficient" in analysis_df.columns:

    analysis_df["Data_Sufficient"] = (
        analysis_df["Data_Sufficient"]
        .astype(bool)
    )

else:

    analysis_df["Data_Sufficient"] = (
        analysis_df["Observation_Count"] >= 2
    )


print("\nData sufficient:")
print(analysis_df["Data_Sufficient"].value_counts())


# ============================================================
# 6. CALCULATE MEAN AND STANDARD DEVIATION
# ============================================================

mean_change = analysis_df[
    required_column
].mean()

std_change = analysis_df[
    required_column
].std()

print("\nMean production change:")
print(mean_change)

print("\nStandard deviation of production change:")
print(std_change)


# ============================================================
# 7. CALCULATE Z-SCORE
# ============================================================

if std_change == 0 or pd.isna(std_change):

    analysis_df["Production_ZScore"] = 0

else:

    analysis_df["Production_ZScore"] = (
        analysis_df[required_column] - mean_change
    ) / std_change


# ============================================================
# 8. ABSOLUTE Z-SCORE
# ============================================================

analysis_df["Absolute_Production_ZScore"] = (
    analysis_df["Production_ZScore"].abs()
)


# ============================================================
# 9. IDENTIFY UNUSUAL PRODUCTION CHANGES
# ============================================================

# Z-score >= 2 is treated as statistically unusual
# for this prototype analysis.

analysis_df["Production_Anomaly"] = (
    (
        analysis_df["Absolute_Production_ZScore"] >= 2
    )
    &
    (
        analysis_df["Data_Sufficient"]
    )
).astype(int)


# ============================================================
# 10. CREATE CHANGE DIRECTION
# ============================================================

def get_change_direction(change):

    if pd.isna(change):
        return "Unknown"

    if change > 0:
        return "Increase"

    if change < 0:
        return "Decrease"

    return "No Change"


analysis_df["Production_Change_Direction"] = (
    analysis_df[required_column]
    .apply(get_change_direction)
)


# ============================================================
# 11. CREATE ANOMALY CATEGORY
# ============================================================

def get_anomaly_category(row):

    if not row["Data_Sufficient"]:
        return "Insufficient Data"

    z_score = row["Production_ZScore"]

    if pd.isna(z_score):
        return "Insufficient Data"

    absolute_z = abs(z_score)

    if absolute_z >= 3:
        return "Highly Unusual"

    elif absolute_z >= 2:
        return "Unusual"

    else:
        return "Normal"


analysis_df["Production_Anomaly_Category"] = (
    analysis_df.apply(
        get_anomaly_category,
        axis=1
    )
)


# ============================================================
# 12. CREATE EXPLANATION
# ============================================================

def create_reason(row):

    if not row["Data_Sufficient"]:
        return (
            "Insufficient production history for "
            "reliable anomaly assessment."
        )

    change = row["Latest_Production_Change"]
    z_score = row["Production_ZScore"]

    if row["Production_Anomaly"] == 1:

        if change > 0:
            direction = "increased"

        elif change < 0:
            direction = "decreased"

        else:
            direction = "changed"

        return (
            f"Production {direction} by "
            f"{abs(change):.2f} MT compared with the "
            f"previous year; the change is statistically "
            f"unusual (Z-score: {z_score:.2f})."
        )

    return (
        "Latest production change is within the "
        "normal range of observed production changes."
    )


analysis_df["Production_Anomaly_Reason"] = (
    analysis_df.apply(
        create_reason,
        axis=1
    )
)


# ============================================================
# 13. SORT BY ABSOLUTE ANOMALY
# ============================================================

analysis_df = analysis_df.sort_values(
    "Absolute_Production_ZScore",
    ascending=False
)


# ============================================================
# 14. DISPLAY TOP UNUSUAL MINES
# ============================================================

print("\n" + "=" * 80)
print("TOP UNUSUAL PRODUCTION CHANGES")
print("=" * 80)

top_anomalies = analysis_df[
    analysis_df["Production_Anomaly"] == 1
]

print(
    top_anomalies[
        [
            "Producing Mine",
            "State",
            "Company",
            "Production_2022_23",
            "Production_2023_24",
            "Latest_Production_Change",
            "Production_ZScore",
            "Production_Anomaly_Category",
            "Production_Anomaly_Reason"
        ]
    ]
    .head(15)
    .to_string(index=False)
)


# ============================================================
# 15. COUNT ANOMALIES
# ============================================================

total_anomalies = (
    analysis_df["Production_Anomaly"]
    .sum()
)

total_mines = len(analysis_df)

print("\n" + "=" * 80)
print("PRODUCTION ANOMALY SUMMARY")
print("=" * 80)

print("\nTotal mines analyzed:")
print(total_mines)

print("\nUnusual production changes:")
print(total_anomalies)

if total_mines > 0:

    anomaly_percentage = (
        total_anomalies / total_mines
    ) * 100

    print("\nPercentage of unusual production changes:")
    print(f"{anomaly_percentage:.2f} %")


# ============================================================
# 16. POSITIVE VS NEGATIVE ANOMALIES
# ============================================================

positive_anomalies = analysis_df[
    (analysis_df["Production_Anomaly"] == 1)
    &
    (analysis_df["Latest_Production_Change"] > 0)
]

negative_anomalies = analysis_df[
    (analysis_df["Production_Anomaly"] == 1)
    &
    (analysis_df["Latest_Production_Change"] < 0)
]

print("\nPositive production anomalies:")
print(len(positive_anomalies))

print("\nNegative production anomalies:")
print(len(negative_anomalies))


# ============================================================
# 17. LARGEST PRODUCTION INCREASES
# ============================================================

print("\n" + "=" * 80)
print("LARGEST PRODUCTION INCREASES")
print("=" * 80)

largest_increases = analysis_df[
    analysis_df["Latest_Production_Change"] > 0
].sort_values(
    "Latest_Production_Change",
    ascending=False
)

print(
    largest_increases[
        [
            "Producing Mine",
            "Production_2022_23",
            "Production_2023_24",
            "Latest_Production_Change",
            "Production_ZScore"
        ]
    ]
    .head(10)
    .to_string(index=False)
)


# ============================================================
# 18. LARGEST PRODUCTION DECREASES
# ============================================================

print("\n" + "=" * 80)
print("LARGEST PRODUCTION DECREASES")
print("=" * 80)

largest_decreases = analysis_df[
    analysis_df["Latest_Production_Change"] < 0
].sort_values(
    "Latest_Production_Change",
    ascending=True
)

print(
    largest_decreases[
        [
            "Producing Mine",
            "Production_2022_23",
            "Production_2023_24",
            "Latest_Production_Change",
            "Production_ZScore"
        ]
    ]
    .head(10)
    .to_string(index=False)
)


# ============================================================
# 19. FINAL OUTPUT COLUMNS
# ============================================================

output_columns = [
    "Producing Mine",
    "State",
    "Company",
    "Production_2021_22",
    "Production_2022_23",
    "Production_2023_24",

    "Change_2021_22_to_2022_23",
    "Change_2022_23_to_2023_24",

    "Percentage_Change_21_22_to_22_23",
    "Percentage_Change_22_23_to_23_24",

    "Production_Mean",
    "Production_Std",
    "Observation_Count",
    "Zero_Production_Count",

    "Latest_Production_Change",
    "Latest_Percentage_Change",

    "Production_ZScore",
    "Absolute_Production_ZScore",

    "Production_Anomaly",
    "Production_Change_Direction",
    "Production_Anomaly_Category",

    "Production_Anomaly_Reason",

    "Data_Sufficient"
]


# ============================================================
# 20. KEEP ONLY EXISTING COLUMNS
# ============================================================

output_columns = [
    col
    for col in output_columns
    if col in analysis_df.columns
]

final_df = analysis_df[
    output_columns
].copy()


# ============================================================
# 21. SAVE ANALYSIS DATASET
# ============================================================

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

final_df.to_csv(
    OUTPUT_PATH,
    index=False
)


# ============================================================
# 22. FINAL SUMMARY
# ============================================================

print("\n" + "=" * 80)
print("FINAL PRODUCTION ANALYSIS SUMMARY")
print("=" * 80)

print("\nTotal mines analyzed:")
print(total_mines)

print("\nProduction anomalies:")
print(total_anomalies)

print("\nMean production change:")
print(f"{mean_change:.4f}")

print("\nStandard deviation:")
print(f"{std_change:.4f}")

print("\nZ-score threshold:")
print("Absolute Z-score >= 2")

print("\nProduction analysis type:")
print("Operational anomaly detection")


# ============================================================
# 23. SAVE CONFIRMATION
# ============================================================

print("\n" + "=" * 80)
print("PRODUCTION ANALYSIS COMPLETED")
print("=" * 80)

print("\nSaved analysis dataset to:")
print(OUTPUT_PATH)