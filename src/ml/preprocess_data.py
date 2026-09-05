import pandas as pd
from pathlib import Path


DATA_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")

# Create processed directory if it doesn't exist
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


# =========================
# 1. LOAD CAAQMS DATA
# =========================

caaqms_path = DATA_DIR / "CAAQMS Data.csv"

df = pd.read_csv(
    caaqms_path,
    encoding="latin1"
)

print("Original shape:", df.shape)


# =========================
# 2. REMOVE EXACT DUPLICATES
# =========================

duplicates = df.duplicated().sum()

print("Duplicate rows:", duplicates)

df = df.drop_duplicates().copy()

print("Shape after removing duplicates:", df.shape)


# =========================
# 3. CONVERT DATETIME COLUMNS
# =========================

df["Creation datetime"] = pd.to_datetime(
    df["Creation datetime"],
    format="%d-%b-%Y %H:%M",
    errors="coerce"
)

df["Record time"] = pd.to_datetime(
    df["Record time"],
    format="%d-%b-%Y %H:%M",
    errors="coerce"
)


# =========================
# 4. CONVERT POLLUTION COLUMNS
# =========================

pollution_columns = [
    "PM - 2.5 (µg/m3)",
    "PM - 10 (µg/m3)",
    "SO2 (µg/m3)",
    "NO2  (µg/m3)",
    "CO (mg/m3)"
]

for column in pollution_columns:
    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )


# =========================
# 5. CHECK MISSING VALUES
# =========================

print("\nMissing values after cleaning:")
print(df[pollution_columns].isnull().sum())


# =========================
# 6. CREATE DATE COLUMN
# =========================

df["Date"] = df["Record time"].dt.date


# =========================
# 7. SAVE CLEANED DATA
# =========================

output_path = PROCESSED_DIR / "caaqms_cleaned.csv"

df.to_csv(
    output_path,
    index=False
)

print("\nCleaned CAAQMS shape:", df.shape)
print("Saved to:", output_path)