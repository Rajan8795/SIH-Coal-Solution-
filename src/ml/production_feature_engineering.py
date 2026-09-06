import pandas as pd
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

INPUT_PATH = Path("data/processed/production_cleaned.csv")
OUTPUT_PATH = Path("data/processed/production_features.csv")


# ============================================================
# 1. LOAD DATA
# ============================================================

print("=" * 80)
print("PRODUCTION FEATURE ENGINEERING")
print("=" * 80)

df = pd.read_csv(INPUT_PATH)

print("\nInput dataset shape:")
print(df.shape)

print("\nInput columns:")
print(df.columns.tolist())


# ============================================================
# 2. BASIC DATA TYPES
# ============================================================

df["Production (in MT)"] = pd.to_numeric(
    df["Production (in MT)"],
    errors="coerce"
)


# ============================================================
# 3. KEEP ONLY REQUIRED COLUMNS
# ============================================================

df = df[
    [
        "Year",
        "State",
        "Company",
        "Producing Mine",
        "Production (in MT)"
    ]
].copy()


# ============================================================
# 4. CREATE YEAR-WISE MINE PRODUCTION TABLE
# ============================================================

production_pivot = df.pivot_table(
    index=["Producing Mine", "State", "Company"],
    columns="Year",
    values="Production (in MT)",
    aggfunc="sum"
).reset_index()


# ============================================================
# 5. RENAME YEAR COLUMNS
# ============================================================

production_pivot = production_pivot.rename(
    columns={
        "2021-22": "Production_2021_22",
        "2022-23": "Production_2022_23",
        "2023-24": "Production_2023_24"
    }
)


# ============================================================
# 6. MAKE SURE ALL YEAR COLUMNS EXIST
# ============================================================

year_columns = [
    "Production_2021_22",
    "Production_2022_23",
    "Production_2023_24"
]

for col in year_columns:
    if col not in production_pivot.columns:
        production_pivot[col] = pd.NA


# ============================================================
# 7. YEAR-TO-YEAR ABSOLUTE CHANGE
# ============================================================

production_pivot["Change_2021_22_to_2022_23"] = (
    production_pivot["Production_2022_23"]
    - production_pivot["Production_2021_22"]
)

production_pivot["Change_2022_23_to_2023_24"] = (
    production_pivot["Production_2023_24"]
    - production_pivot["Production_2022_23"]
)


# ============================================================
# 8. YEAR-TO-YEAR PERCENTAGE CHANGE
# ============================================================

# Percentage change:
#
# (current - previous) / previous * 100
#
# If previous production is 0, percentage change is undefined.
# Therefore, keep it as NaN instead of creating infinity.

previous_2021_22 = production_pivot["Production_2021_22"]

production_pivot["Percentage_Change_21_22_to_22_23"] = (
    production_pivot["Change_2021_22_to_2022_23"]
    .div(previous_2021_22.where(previous_2021_22 > 0))
    * 100
)


previous_2022_23 = production_pivot["Production_2022_23"]

production_pivot["Percentage_Change_22_23_to_23_24"] = (
    production_pivot["Change_2022_23_to_2023_24"]
    .div(previous_2022_23.where(previous_2022_23 > 0))
    * 100
)


# ============================================================
# 9. PRODUCTION VARIABILITY
# ============================================================

production_columns = [
    "Production_2021_22",
    "Production_2022_23",
    "Production_2023_24"
]

production_pivot["Production_Mean"] = (
    production_pivot[production_columns]
    .mean(axis=1)
)

production_pivot["Production_Std"] = (
    production_pivot[production_columns]
    .std(axis=1)
)


# ============================================================
# 10. OBSERVATION COUNT
# ============================================================

production_pivot["Observation_Count"] = (
    production_pivot[production_columns]
    .notna()
    .sum(axis=1)
)


# ============================================================
# 11. ZERO PRODUCTION COUNT
# ============================================================

production_pivot["Zero_Production_Count"] = (
    production_pivot[production_columns]
    .eq(0)
    .sum(axis=1)
)


# ============================================================
# 12. LATEST PRODUCTION CHANGE
# ============================================================

production_pivot["Latest_Production_Change"] = (
    production_pivot["Change_2022_23_to_2023_24"]
)


# ============================================================
# 13. LATEST PERCENTAGE CHANGE
# ============================================================

production_pivot["Latest_Percentage_Change"] = (
    production_pivot["Percentage_Change_22_23_to_23_24"]
)


# ============================================================
# 14. MISSING PRODUCTION INDICATORS
# ============================================================

production_pivot["Missing_2021_22"] = (
    production_pivot["Production_2021_22"]
    .isna()
    .astype(int)
)

production_pivot["Missing_2022_23"] = (
    production_pivot["Production_2022_23"]
    .isna()
    .astype(int)
)

production_pivot["Missing_2023_24"] = (
    production_pivot["Production_2023_24"]
    .isna()
    .astype(int)
)


# ============================================================
# 15. DATA SUFFICIENCY FLAG
# ============================================================

production_pivot["Data_Sufficient"] = (
    production_pivot["Observation_Count"] >= 2
).astype(int)


# ============================================================
# 16. CREATE OUTPUT DIRECTORY
# ============================================================

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# 17. SAVE FEATURE DATASET
# ============================================================

production_pivot.to_csv(
    OUTPUT_PATH,
    index=False
)


# ============================================================
# 18. DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 80)
print("FEATURE ENGINEERING RESULTS")
print("=" * 80)

print("\nFeature dataset shape:")
print(production_pivot.shape)

print("\nFeature columns:")
print(production_pivot.columns.tolist())

print("\nFirst 10 rows:")
print(
    production_pivot.head(10).to_string(index=False)
)


# ============================================================
# 19. MISSING VALUES CHECK
# ============================================================

print("\n" + "=" * 80)
print("MISSING VALUES")
print("=" * 80)

print(
    production_pivot.isnull().sum()
)


# ============================================================
# 20. DATA SUFFICIENCY
# ============================================================

print("\n" + "=" * 80)
print("DATA SUFFICIENCY")
print("=" * 80)

print(
    production_pivot["Data_Sufficient"]
    .value_counts()
    .rename(
        index={
            0: "Insufficient Data",
            1: "Sufficient Data"
        }
    )
)


# ============================================================
# 21. MISSING PRODUCTION RECORDS
# ============================================================

print("\n" + "=" * 80)
print("MINES WITH MISSING YEARLY PRODUCTION")
print("=" * 80)

missing_data = production_pivot[
    production_pivot["Observation_Count"] < 3
][
    [
        "Producing Mine",
        "State",
        "Company",
        "Production_2021_22",
        "Production_2022_23",
        "Production_2023_24",
        "Observation_Count"
    ]
]

print(
    missing_data.to_string(index=False)
)


# ============================================================
# 22. TOP PRODUCTION CHANGES
# ============================================================

print("\n" + "=" * 80)
print("LARGEST POSITIVE PRODUCTION CHANGES")
print("=" * 80)

positive_changes = production_pivot[
    production_pivot["Latest_Production_Change"].notna()
].sort_values(
    "Latest_Production_Change",
    ascending=False
)

print(
    positive_changes[
        [
            "Producing Mine",
            "Production_2022_23",
            "Production_2023_24",
            "Latest_Production_Change"
        ]
    ]
    .head(10)
    .to_string(index=False)
)


# ============================================================
# 23. LARGEST NEGATIVE PRODUCTION CHANGES
# ============================================================

print("\n" + "=" * 80)
print("LARGEST NEGATIVE PRODUCTION CHANGES")
print("=" * 80)

negative_changes = production_pivot[
    production_pivot["Latest_Production_Change"].notna()
].sort_values(
    "Latest_Production_Change",
    ascending=True
)

print(
    negative_changes[
        [
            "Producing Mine",
            "Production_2022_23",
            "Production_2023_24",
            "Latest_Production_Change"
        ]
    ]
    .head(10)
    .to_string(index=False)
)


# ============================================================
# 24. SAVE CONFIRMATION
# ============================================================

print("\n" + "=" * 80)
print("FEATURE ENGINEERING COMPLETED")
print("=" * 80)

print("\nSaved feature dataset to:")
print(OUTPUT_PATH)