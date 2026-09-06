import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path


# ============================================================
# LOAD DATA
# ============================================================

INPUT_PATH = Path("data/processed/production_cleaned.csv")

df = pd.read_csv(INPUT_PATH)


print("=" * 80)
print("PRODUCTION DATASET EDA")
print("=" * 80)


# ============================================================
# 1. BASIC DATASET OVERVIEW
# ============================================================

print("\n" + "=" * 80)
print("1. DATASET OVERVIEW")
print("=" * 80)

print("\nShape:")
print(df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nData Types:")
print(df.dtypes)

print("\nFirst 10 Rows:")
print(df.head(10))

print("\nLast 5 Rows:")
print(df.tail())


# ============================================================
# 2. DATA QUALITY
# ============================================================

print("\n" + "=" * 80)
print("2. DATA QUALITY")
print("=" * 80)

print("\nMissing Values:")
print(df.isnull().sum())

print("\nTotal Missing Values:")
print(df.isnull().sum().sum())

print("\nDuplicate Rows:")
print(df.duplicated().sum())

print("\nNegative Production Values:")

negative_values = (
    df["Production (in MT)"] < 0
).sum()

print(negative_values)


# ============================================================
# 3. UNIQUE VALUES
# ============================================================

print("\n" + "=" * 80)
print("3. UNIQUE VALUES")
print("=" * 80)

print("\nUnique Years:")
print(df["Year"].unique())

print("\nNumber of Years:")
print(df["Year"].nunique())

print("\nUnique States:")
print(df["State"].nunique())

print("\nUnique Companies:")
print(df["Company"].nunique())

print("\nUnique Mines:")
print(df["Producing Mine"].nunique())


# ============================================================
# 4. PRODUCTION STATISTICS
# ============================================================

print("\n" + "=" * 80)
print("4. PRODUCTION STATISTICS")
print("=" * 80)

print(
    df["Production (in MT)"].describe()
)


# ============================================================
# 5. PRODUCTION DISTRIBUTION
# ============================================================

print("\n" + "=" * 80)
print("5. PRODUCTION DISTRIBUTION")
print("=" * 80)

plt.figure(figsize=(8, 5))

plt.hist(
    df["Production (in MT)"],
    bins=30
)

plt.xlabel("Production (in MT)")
plt.ylabel("Number of Records")
plt.title("Distribution of Coal Production")

plt.show()


# ============================================================
# 6. YEAR-WISE PRODUCTION
# ============================================================

print("\n" + "=" * 80)
print("6. YEAR-WISE PRODUCTION")
print("=" * 80)

yearly_production = (
    df.groupby("Year")["Production (in MT)"]
      .agg([
          "count",
          "mean",
          "sum",
          "min",
          "max"
      ])
)

print("\nYear-wise Production:")
print(yearly_production)


# ============================================================
# 7. YEAR-WISE TOTAL PRODUCTION GRAPH
# ============================================================

year_total = (
    df.groupby("Year")["Production (in MT)"]
      .sum()
)

plt.figure(figsize=(8, 5))

year_total.plot(
    kind="bar"
)

plt.xlabel("Year")
plt.ylabel("Total Production (in MT)")
plt.title("Total Coal Production by Year")

plt.xticks(rotation=0)

plt.show()


# ============================================================
# 8. YEAR-WISE AVERAGE PRODUCTION
# ============================================================

year_average = (
    df.groupby("Year")["Production (in MT)"]
      .mean()
)

print("\nAverage Production by Year:")
print(year_average)

plt.figure(figsize=(8, 5))

year_average.plot(
    kind="bar"
)

plt.xlabel("Year")
plt.ylabel("Average Production (in MT)")
plt.title("Average Coal Production by Year")

plt.xticks(rotation=0)

plt.show()


# ============================================================
# 9. STATE-WISE PRODUCTION
# ============================================================

print("\n" + "=" * 80)
print("9. STATE-WISE PRODUCTION")
print("=" * 80)

state_production = (
    df.groupby("State")["Production (in MT)"]
      .agg([
          "count",
          "mean",
          "sum",
          "min",
          "max"
      ])
      .sort_values(
          "sum",
          ascending=False
      )
)

print("\nState-wise Production:")
print(state_production)


# ============================================================
# 10. STATE-WISE TOTAL PRODUCTION GRAPH
# ============================================================

plt.figure(figsize=(10, 6))

state_production["sum"].plot(
    kind="bar"
)

plt.xlabel("State")
plt.ylabel("Total Production (in MT)")
plt.title("Total Coal Production by State")

plt.xticks(
    rotation=45,
    ha="right"
)

plt.tight_layout()

plt.show()


# ============================================================
# 11. TOP 10 PRODUCING MINES
# ============================================================

print("\n" + "=" * 80)
print("11. TOP 10 PRODUCING MINES")
print("=" * 80)

top_mines = (
    df.groupby("Producing Mine")["Production (in MT)"]
      .sum()
      .sort_values(
          ascending=False
      )
      .head(10)
)

print("\nTop 10 Producing Mines:")
print(top_mines)


# ============================================================
# 12. TOP 10 MINES GRAPH
# ============================================================

plt.figure(figsize=(10, 6))

top_mines.sort_values().plot(
    kind="barh"
)

plt.xlabel("Total Production (in MT)")
plt.ylabel("Mine")
plt.title("Top 10 Producing Mines")

plt.tight_layout()

plt.show()


# ============================================================
# 13. PRODUCTION VARIABILITY
# ============================================================

print("\n" + "=" * 80)
print("13. PRODUCTION VARIABILITY")
print("=" * 80)

mine_variability = (
    df.groupby("Producing Mine")["Production (in MT)"]
      .agg([
          "count",
          "mean",
          "std",
          "min",
          "max"
      ])
      .sort_values(
          "std",
          ascending=False
      )
)

print("\nMines with highest production variability:")

print(
    mine_variability.head(10)
)


# ============================================================
# 14. OUTLIER ANALYSIS USING IQR
# ============================================================

print("\n" + "=" * 80)
print("14. OUTLIER ANALYSIS")
print("=" * 80)

Q1 = df["Production (in MT)"].quantile(0.25)

Q3 = df["Production (in MT)"].quantile(0.75)

IQR = Q3 - Q1

lower_bound = Q1 - 1.5 * IQR

upper_bound = Q3 + 1.5 * IQR

print("\nQ1:")
print(Q1)

print("\nQ3:")
print(Q3)

print("\nIQR:")
print(IQR)

print("\nLower Bound:")
print(lower_bound)

print("\nUpper Bound:")
print(upper_bound)


# Find outliers

outliers = df[
    (df["Production (in MT)"] < lower_bound)
    |
    (df["Production (in MT)"] > upper_bound)
]

print("\nNumber of Outliers:")
print(len(outliers))

print("\nTop Production Outliers:")

print(
    outliers[
        [
            "Year",
            "State",
            "Company",
            "Producing Mine",
            "Production (in MT)"
        ]
    ]
    .sort_values(
        "Production (in MT)",
        ascending=False
    )
    .head(10)
)


# ============================================================
# 15. OUTLIER VISUALIZATION
# ============================================================

plt.figure(figsize=(8, 5))

plt.boxplot(
    df["Production (in MT)"]
)

plt.ylabel("Production (in MT)")
plt.title("Boxplot of Coal Production")

plt.show()


# ============================================================
# 16. ZERO PRODUCTION ANALYSIS
# ============================================================

print("\n" + "=" * 80)
print("16. ZERO PRODUCTION ANALYSIS")
print("=" * 80)

zero_production = (
    df["Production (in MT)"] == 0
).sum()

print("\nNumber of zero-production records:")
print(zero_production)

print("\nPercentage of zero-production records:")

zero_percentage = (
    zero_production / len(df)
) * 100

print(
    round(zero_percentage, 2),
    "%"
)


# ============================================================
# 17. PRODUCTION BY COMPANY
# ============================================================

print("\n" + "=" * 80)
print("17. COMPANY-WISE PRODUCTION")
print("=" * 80)

company_production = (
    df.groupby("Company")["Production (in MT)"]
      .sum()
      .sort_values(
          ascending=False
      )
      .head(10)
)

print("\nTop 10 Companies by Production:")

print(company_production)


# ============================================================
# 18. FINAL EDA SUMMARY
# ============================================================

print("\n" + "=" * 80)
print("18. FINAL EDA SUMMARY")
print("=" * 80)

print(
    f"""
1. Final dataset contains {df.shape[0]} records
   and {df.shape[1]} columns.

2. Missing production values:
   {df["Production (in MT)"].isnull().sum()}

3. Duplicate rows:
   {df.duplicated().sum()}

4. Unique states:
   {df["State"].nunique()}

5. Unique companies:
   {df["Company"].nunique()}

6. Unique mines:
   {df["Producing Mine"].nunique()}

7. Mean production:
   {df["Production (in MT)"].mean():.2f} MT

8. Median production:
   {df["Production (in MT)"].median():.2f} MT

9. Maximum production:
   {df["Production (in MT)"].max():.2f} MT

10. Number of statistical outliers:
    {len(outliers)}

11. Number of zero-production records:
    {zero_production}
"""
)

print("=" * 80)
print("PRODUCTION EDA COMPLETED")
print("=" * 80)