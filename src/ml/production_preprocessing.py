import pandas as pd
from pathlib import Path

INPUT_PATH = Path("data/raw/RS_Session_266_AU_2269_2.csv")
OUTPUT_PATH = Path("data/processed/production_cleaned.csv")

df = pd.read_csv(INPUT_PATH)

print("=" * 80)
print("PRODUCTION DATA PREPROCESSING")
print("=" * 80)

print("\nOriginal shape:")
print(df.shape)

print("\nOriginal columns:")
print(df.columns.tolist())


# --------------------------------------------------
# 1. Remove duplicate rows
# --------------------------------------------------

duplicates = df.duplicated().sum()

print("\nDuplicate rows found:", duplicates)

df = df.drop_duplicates()

print("Shape after removing duplicates:")
print(df.shape)


# --------------------------------------------------
# 2. Remove aggregate row
# --------------------------------------------------

aggregate_rows = (
    df["Producing Mine"].str.strip()
    == "All India Total Production"
).sum()

print("\nAggregate rows found:", aggregate_rows)

df = df[
    df["Producing Mine"].str.strip()
    != "All India Total Production"
]


# --------------------------------------------------
# 3. Convert production column to numeric
# --------------------------------------------------

df["Production (in MT)"] = pd.to_numeric(
    df["Production (in MT)"],
    errors="coerce"
)


# --------------------------------------------------
# 4. Check missing values
# --------------------------------------------------

print("\nMissing values:")
print(df.isnull().sum())


# --------------------------------------------------
# 5. Check invalid production values
# --------------------------------------------------

invalid_production = (
    df["Production (in MT)"] < 0
).sum()

print("\nNegative production values:", invalid_production)


# --------------------------------------------------
# 6. Create processed directory
# --------------------------------------------------

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

print("\nFinal missing values:")
print(df.isnull().sum())

print("\nFinal shape before saving:")
print(df.shape)

# --------------------------------------------------
# 7. Save cleaned dataset
# --------------------------------------------------

df.to_csv(
    OUTPUT_PATH,
    index=False
)

print("\nFinal shape:")
print(df.shape)

print("\nSaved cleaned dataset to:")
print(OUTPUT_PATH)



print("\nRecords with missing production:")

missing_records = df.loc[
        df["Production (in MT)"].isnull(),
        ["Year", "State", "Company", "Producing Mine", "Production (in MT)"]


    ]

print(missing_records.to_string(index=False))


