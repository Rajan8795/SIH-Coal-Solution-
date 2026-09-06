import pandas as pd
from pathlib import Path

# -----------------------------
# 1. File paths
# -----------------------------

INPUT_PATH = Path("data/raw/RS_Session_262_AU_48_A.csv")
OUTPUT_PATH = Path("data/processed/accident_cleaned.csv")


# -----------------------------
# 2. Load dataset
# -----------------------------

df = pd.read_csv(INPUT_PATH)

print("Original shape:", df.shape)


# -----------------------------
# 3. Remove aggregate rows
# -----------------------------

# Remove rows where Year is "Total"
df = df[df["Year"] != "Total"]

# Remove rows where State is "Total"
df = df[df["State"] != "Total"]


# -----------------------------
# 4. Convert accident columns
# -----------------------------

accident_columns = [
    "Number of Fatal accident",
    "Number of Serious accident"
]

for column in accident_columns:
    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )


# -----------------------------
# 5. Check missing values
# -----------------------------

print("\nMissing values:")
print(df.isnull().sum())


# -----------------------------
# 6. Check negative values
# -----------------------------

print("\nNegative values:")

for column in accident_columns:
    print(
        column,
        ":",
        (df[column] < 0).sum()
    )


# -----------------------------
# 7. Check duplicates
# -----------------------------

print("\nDuplicates:", df.duplicated().sum())


# -----------------------------
# 8. Create total accidents
# -----------------------------

df["Total Accidents"] = (
    df["Number of Fatal accident"]
    + df["Number of Serious accident"]
)


# -----------------------------
# 9. Sort data
# -----------------------------

df = df.sort_values(
    ["Year", "State"]
).reset_index(drop=True)


# -----------------------------
# 10. Save cleaned dataset
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
# 11. Final information
# -----------------------------

print("\n========== PREPROCESSING COMPLETED ==========")

print("Final shape:", df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nFirst 5 rows:")
print(df.head())

print("\nSaved to:")
print(OUTPUT_PATH)