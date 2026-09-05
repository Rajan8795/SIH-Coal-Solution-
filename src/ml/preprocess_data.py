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

df = pd.read_csv(caaqms_path, encoding="latin1")

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
    df[column] = pd.to_numeric(df[column], errors="coerce")


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

df.to_csv(output_path, index=False)

print("\nCleaned CAAQMS shape:", df.shape)
print("Saved to:", output_path)



# =========================
# 2. LOAD PRODUCTION DATA
# =========================

production_path = DATA_DIR / "RS_Session_266_AU_2269_2.csv"

production_df = pd.read_csv(
    production_path,
    encoding="latin1"
)

print("\n\n" + "=" * 80)
print("PRODUCTION DATA")
print("=" * 80)

print("Original shape:", production_df.shape)


# =========================
# REMOVE EXACT DUPLICATES
# =========================

print("Duplicate rows:", production_df.duplicated().sum())

production_df = production_df.drop_duplicates().copy()

print("Shape after removing duplicates:", production_df.shape)


# =========================
# REMOVE AGGREGATE ROW
# =========================

aggregate_rows = (
    production_df["Producing Mine"]
    .str.strip()
    .eq("All India Total Production")
)

print("Aggregate rows:", aggregate_rows.sum())

production_df = production_df[~aggregate_rows].copy()


# =========================
# CONVERT PRODUCTION TO NUMERIC
# =========================

production_df["Production (in MT)"] = pd.to_numeric(
    production_df["Production (in MT)"],
    errors="coerce"
)


# =========================
# CHECK MISSING VALUES
# =========================

print("\nMissing values:")
print(production_df.isnull().sum())


# =========================
# SAVE CLEANED DATA
# =========================

production_output = PROCESSED_DIR / "production_cleaned.csv"

production_df.to_csv(
    production_output,
    index=False
)

print("\nCleaned production shape:", production_df.shape)
print("Saved to:", production_output)


# =========================
# 3. LOAD ACCIDENT DATA
# =========================

accident_path = DATA_DIR / "RS_Session_262_AU_48_A.csv"

accident_df = pd.read_csv(
    accident_path,
    encoding="latin1"
)

print("\n\n" + "=" * 80)
print("ACCIDENT DATA")
print("=" * 80)

print("Original shape:", accident_df.shape)


# =========================
# REMOVE TOTAL ROWS
# =========================

total_rows = (
    accident_df["State"]
    .str.strip()
    .eq("Total")
)

print("Total/aggregate rows:", total_rows.sum())

accident_df = accident_df[~total_rows].copy()


# =========================
# CONVERT ACCIDENT COUNTS
# =========================

accident_df["Number of Fatal accident"] = pd.to_numeric(
    accident_df["Number of Fatal accident"],
    errors="coerce"
)

accident_df["Number of Serious accident"] = pd.to_numeric(
    accident_df["Number of Serious accident"],
    errors="coerce"
)


# =========================
# CHECK MISSING VALUES
# =========================

print("\nMissing values:")
print(accident_df.isnull().sum())


# =========================
# SAVE CLEANED DATA
# =========================

accident_output = PROCESSED_DIR / "accidents_cleaned.csv"

accident_df.to_csv(
    accident_output,
    index=False
)

print("\nCleaned accident shape:", accident_df.shape)
print("Saved to:", accident_output)


# =========================
# 4. LOAD FATALITIES DATA
# =========================

fatalities_path = DATA_DIR / "RS_Session_267_AU_1866_C.csv"

fatalities_df = pd.read_csv(
    fatalities_path,
    encoding="latin1"
)

print("\n\n" + "=" * 80)
print("FATALITIES DATA")
print("=" * 80)

print("Original shape:", fatalities_df.shape)


# =========================
# CHECK DUPLICATES
# =========================

print("Duplicate rows:", fatalities_df.duplicated().sum())


# =========================
# CONVERT COLUMNS TO NUMERIC
# =========================

fatalities_df["Year-wise"] = pd.to_numeric(
    fatalities_df["Year-wise"],
    errors="coerce"
)

fatalities_df["Fatalities"] = pd.to_numeric(
    fatalities_df["Fatalities"],
    errors="coerce"
)


# =========================
# CHECK MISSING VALUES
# =========================

print("\nMissing values:")
print(fatalities_df.isnull().sum())


# =========================
# SAVE CLEANED DATA
# =========================

fatalities_output = PROCESSED_DIR / "fatalities_cleaned.csv"

fatalities_df.to_csv(
    fatalities_output,
    index=False
)

print("\nCleaned fatalities shape:", fatalities_df.shape)
print("Saved to:", fatalities_output)
