import pandas as pd
from pathlib import Path

# -----------------------------
# 1. File paths
# -----------------------------

INPUT_PATH = Path("data/processed/accident_cleaned.csv")
OUTPUT_PATH = Path("data/processed/accident_features.csv")


# -----------------------------
# 2. Load cleaned dataset
# -----------------------------

df = pd.read_csv(INPUT_PATH)

print("Input shape:", df.shape)


# -----------------------------
# 3. Convert Year to numeric
# -----------------------------

df["Year"] = pd.to_numeric(
    df["Year"],
    errors="coerce"
)


# -----------------------------
# 4. Sort data
# -----------------------------

df = df.sort_values(
    ["State", "Year"]
).reset_index(drop=True)


# -----------------------------
# 5. Create Fatal Accident Ratio
# -----------------------------

df["Fatal_Accident_Ratio"] = (
    df["Number of Fatal accident"]
    / df["Total Accidents"]
)

df["Fatal_Accident_Ratio"] = (
    df["Fatal_Accident_Ratio"]
    .fillna(0)
)


# -----------------------------
# 6. Year-over-Year change
# -----------------------------

df["Total_Accident_Change"] = (
    df.groupby("State")["Total Accidents"]
    .diff()
)


# -----------------------------
# 7. Fatal accident change
# -----------------------------

df["Fatal_Accident_Change"] = (
    df.groupby("State")["Number of Fatal accident"]
    .diff()
)


# -----------------------------
# 8. Serious accident change
# -----------------------------

df["Serious_Accident_Change"] = (
    df.groupby("State")["Number of Serious accident"]
    .diff()
)


# -----------------------------
# 9. State-level average
# -----------------------------

df["State_Avg_Total_Accidents"] = (
    df.groupby("State")["Total Accidents"]
    .transform("mean")
)


# -----------------------------
# 10. State-level accident std
# -----------------------------

df["State_Accident_Std"] = (
    df.groupby("State")["Total Accidents"]
    .transform("std")
)

df["State_Accident_Std"] = (
    df["State_Accident_Std"]
    .fillna(0)
)


# -----------------------------
# 11. Accident anomaly indicator
# -----------------------------

df["Accident_Deviation"] = (
    df["Total Accidents"]
    - df["State_Avg_Total_Accidents"]
)


# -----------------------------
# 12. Data availability
# -----------------------------

df["Data_Available"] = (
    df["Total Accidents"].notna()
    .astype(int)
)


# -----------------------------
# 13. Save features
# -----------------------------

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_PATH,
    index=False
)


# -----------------------------
# 14. Display results
# -----------------------------

print("\n========== FEATURE ENGINEERING COMPLETED ==========")

print("Output shape:", df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nSample:")
print(df.head(10))

print("\nMissing values:")
print(df.isnull().sum())

print("\nSaved to:")
print(OUTPUT_PATH)