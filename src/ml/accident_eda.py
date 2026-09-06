import pandas as pd
from pathlib import Path

# -----------------------------
# 1. Load dataset
# -----------------------------

INPUT_PATH = Path("data/raw/RS_Session_262_AU_48_A.csv")

df = pd.read_csv(INPUT_PATH)

print("\n========== BASIC INFORMATION ==========")

print("Shape:", df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nFirst 5 rows:")
print(df.head())


# -----------------------------
# 2. Data types
# -----------------------------

print("\n========== DATA TYPES ==========")

print(df.dtypes)


# -----------------------------
# 3. Missing values
# -----------------------------

print("\n========== MISSING VALUES ==========")

print(df.isnull().sum())


# -----------------------------
# 4. Duplicate values
# -----------------------------

print("\n========== DUPLICATES ==========")

print("Duplicate rows:", df.duplicated().sum())


# -----------------------------
# 5. Basic statistics
# -----------------------------

print("\n========== DESCRIPTIVE STATISTICS ==========")

print(df.describe())


# -----------------------------
# 6. Unique values
# -----------------------------

print("\n========== UNIQUE VALUES ==========")

for column in df.columns:
    print(f"\n{column}:")
    print("Unique values:", df[column].nunique())

    if df[column].nunique() <= 20:
        print(df[column].unique())


# -----------------------------
# 7. Year-wise accident analysis
# -----------------------------

print("\n========== YEAR-WISE ACCIDENTS ==========")

year_data = df[df["Year"] != "Total"].copy()

year_data["Number of Fatal accident"] = pd.to_numeric(
    year_data["Number of Fatal accident"],
    errors="coerce"
)

year_data["Number of Serious accident"] = pd.to_numeric(
    year_data["Number of Serious accident"],
    errors="coerce"
)

year_wise = (
    year_data
    .groupby("Year")[
        ["Number of Fatal accident", "Number of Serious accident"]
    ]
    .sum()
)

print(year_wise)


# -----------------------------
# 8. State-wise accident analysis
# -----------------------------

print("\n========== STATE-WISE ACCIDENTS ==========")

state_data = df[
    (df["State"] != "Total") &
    (df["Year"] != "Total")
].copy()

state_data["Number of Fatal accident"] = pd.to_numeric(
    state_data["Number of Fatal accident"],
    errors="coerce"
)

state_data["Number of Serious accident"] = pd.to_numeric(
    state_data["Number of Serious accident"],
    errors="coerce"
)

state_wise = (
    state_data
    .groupby("State")[
        ["Number of Fatal accident", "Number of Serious accident"]
    ]
    .sum()
    .sort_values(
        "Number of Fatal accident",
        ascending=False
    )
)

print(state_wise)


# -----------------------------
# 9. Total accidents
# -----------------------------

print("\n========== TOTAL ACCIDENTS ==========")

total_fatal = state_data["Number of Fatal accident"].sum()
total_serious = state_data["Number of Serious accident"].sum()

print("Total Fatal Accidents:", total_fatal)
print("Total Serious Accidents:", total_serious)
print("Total Accidents:", total_fatal + total_serious)


# -----------------------------
# 10. Highest fatal accidents
# -----------------------------

print("\n========== TOP STATES BY FATAL ACCIDENTS ==========")

print(
    state_wise
    .sort_values(
        "Number of Fatal accident",
        ascending=False
    )
    .head(10)
)


# -----------------------------
# 11. Highest serious accidents
# -----------------------------

print("\n========== TOP STATES BY SERIOUS ACCIDENTS ==========")

print(
    state_wise
    .sort_values(
        "Number of Serious accident",
        ascending=False
    )
    .head(10)
)


# -----------------------------
# 12. Year-wise total accidents
# -----------------------------

year_wise["Total Accidents"] = (
    year_wise["Number of Fatal accident"]
    + year_wise["Number of Serious accident"]
)

print("\n========== YEAR-WISE TOTAL ACCIDENTS ==========")

print(year_wise)


# -----------------------------
# 13. Highest accident year
# -----------------------------

highest_year = year_wise["Total Accidents"].idxmax()
highest_value = year_wise["Total Accidents"].max()

print("\n========== HIGHEST ACCIDENT YEAR ==========")

print("Year:", highest_year)
print("Total accidents:", highest_value)


# -----------------------------
# 14. Correlation
# -----------------------------

print("\n========== CORRELATION ==========")

print(
    year_data[
        [
            "Number of Fatal accident",
            "Number of Serious accident"
        ]
    ].corr()
)


print("\n========== EDA COMPLETED ==========")