import pandas as pd
from pathlib import Path


# =========================
# LOAD CLEANED CAAQMS DATA
# =========================

DATA_PATH = Path("data/processed/caaqms_cleaned.csv")

df = pd.read_csv(DATA_PATH)

# Convert Record time back to datetime
df["Record time"] = pd.to_datetime(df["Record time"], errors="coerce")


# =========================
# BASIC INFORMATION
# =========================

print("=" * 80)
print("CAAQMS EDA")
print("=" * 80)

print("\nShape:")
print(df.shape)

print("\nColumns:")
print(df.columns.tolist())


# =========================
# DESCRIPTIVE STATISTICS
# =========================

pollution_columns = [
    "PM - 2.5 (µg/m3)",
    "PM - 10 (µg/m3)",
    "SO2 (µg/m3)",
    "NO2  (µg/m3)",
    "CO (mg/m3)"
]

print("\n" + "=" * 80)
print("DESCRIPTIVE STATISTICS")
print("=" * 80)

print(df[pollution_columns].describe())


# =========================
# POLLUTION STATISTICS BY MINE
# =========================

print("\n" + "=" * 80)
print("POLLUTION BY MINE")
print("=" * 80)

mine_stats = df.groupby("Mine Name")[pollution_columns].mean()

print(mine_stats)


# =========================
# RECORDS PER MINE
# =========================

print("\n" + "=" * 80)
print("RECORD COUNT BY MINE")
print("=" * 80)

print(df["Mine Name"].value_counts())


# =========================
# DATE RANGE
# =========================

print("\n" + "=" * 80)
print("DATE RANGE")
print("=" * 80)

print("Start:", df["Record time"].min())
print("End:", df["Record time"].max())


# =========================
# POLLUTION CORRELATION
# =========================

print("\n" + "=" * 80)
print("CORRELATION MATRIX")
print("=" * 80)

print(df[pollution_columns].corr())

import matplotlib.pyplot as plt


# =========================
# POLLUTION DISTRIBUTIONS
# =========================

for col in pollution_columns:
    plt.figure(figsize=(8, 5))
    plt.hist(df[col].dropna(), bins=30)
    plt.xlabel(col)
    plt.ylabel("Frequency")
    plt.title(f"Distribution of {col}")
    plt.tight_layout()
    plt.show()


# =========================
# POLLUTION OVER TIME
# =========================

for col in pollution_columns:
    plt.figure(figsize=(10, 5))
    plt.plot(df["Record time"], df[col])
    plt.xlabel("Time")
    plt.ylabel(col)
    plt.title(f"{col} over Time")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()
    