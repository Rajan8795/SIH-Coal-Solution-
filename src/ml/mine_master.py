
import pandas as pd
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

INPUT_PATH = Path(
    "data/raw/mine_statistics_data_2026-09-05_01-20-16.xlsx"
)

OUTPUT_PATH = Path(
    "data/processed/mine_master.csv"
)


# ============================================================
# LOAD DATA
# ============================================================

print("Loading mine statistics data...")

df = pd.read_excel(INPUT_PATH)

print(f"Raw shape: {df.shape}")
print("\nRaw columns:")
print(df.columns.tolist())


# ============================================================
# CLEAN COLUMN NAMES
# ============================================================

df.columns = (
    df.columns
    .str.strip()
    .str.replace(r"\s+", " ", regex=True)
)

print("\nCleaned columns:")
print(df.columns.tolist())


# ============================================================
# SELECT REQUIRED COLUMNS
# ============================================================

required_columns = [
    "Mine Name",
    "Company Name",
    "State",
    "District",
    "Coalfield",
    "Area",
    "Type",
    "Public/Pvt",
    "Production",
    "Despatch"
]

missing_columns = [
    col for col in required_columns
    if col not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing required columns: {missing_columns}"
    )

df = df[required_columns].copy()


# ============================================================
# STANDARDIZE TEXT COLUMNS
# ============================================================

text_columns = [
    "Mine Name",
    "Company Name",
    "State",
    "District",
    "Coalfield",
    "Area",
    "Type",
    "Public/Pvt"
]

for col in text_columns:
    df[col] = (
        df[col]
        .astype("string")
        .str.strip()
    )


# ============================================================
# STANDARDIZE MINE TYPE
# ============================================================

type_mapping = {
    "OC": "Opencast",
    "UG": "Underground",
    "Mixed": "Mixed"
}

df["Mine Type"] = df["Type"].map(type_mapping)

unknown_types = df.loc[
    df["Mine Type"].isna(),
    "Type"
].dropna().unique()

if len(unknown_types) > 0:
    print(
        "\nWarning: Unknown mine types found:",
        unknown_types
    )


# ============================================================
# STANDARDIZE OWNERSHIP
# ============================================================

df["Ownership"] = (
    df["Public/Pvt"]
    .str.upper()
    .str.strip()
)


# ============================================================
# NUMERIC COLUMNS
# ============================================================

df["Production"] = pd.to_numeric(
    df["Production"],
    errors="coerce"
)

df["Despatch"] = pd.to_numeric(
    df["Despatch"],
    errors="coerce"
)


# ============================================================
# CREATE STANDARD MINE ID
# ============================================================

df["Mine ID"] = (
    df["Mine Name"]
    .str.upper()
    .str.replace(r"[^A-Z0-9]+", "_", regex=True)
    .str.strip("_")
)


# ============================================================
# CHECK DUPLICATE MINE NAMES
# ============================================================

duplicate_mines = df[
    df["Mine Name"].duplicated(keep=False)
].sort_values("Mine Name")

print(
    f"\nDuplicate mine-name records: "
    f"{len(duplicate_mines)}"
)

if len(duplicate_mines) > 0:
    print("\nDuplicate examples:")
    print(
        duplicate_mines[
            ["Mine Name", "Company Name", "State"]
        ].head(10)
    )


# ============================================================
# REMOVE EXACT DUPLICATES
# ============================================================

before = len(df)

df = df.drop_duplicates()

after = len(df)

print(
    f"\nExact duplicate rows removed: "
    f"{before - after}"
)


# ============================================================
# REORDER COLUMNS
# ============================================================

final_columns = [
    "Mine ID",
    "Mine Name",
    "Company Name",
    "State",
    "District",
    "Coalfield",
    "Area",
    "Mine Type",
    "Ownership",
    "Production",
    "Despatch"
]

df = df[final_columns]


# ============================================================
# DATA QUALITY CHECK
# ============================================================

print("\n========== DATA QUALITY ==========")

print(f"Final shape: {df.shape}")

print("\nMissing values:")
print(df.isna().sum())

print("\nMine type distribution:")
print(df["Mine Type"].value_counts(dropna=False))

print("\nOwnership distribution:")
print(df["Ownership"].value_counts(dropna=False))

print("\nNumber of unique mines:")
print(df["Mine Name"].nunique())

print("\nNumber of unique companies:")
print(df["Company Name"].nunique())

print("\nNumber of states:")
print(df["State"].nunique())


# ============================================================
# SAVE
# ============================================================

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_PATH,
    index=False
)

print(
    f"\nMine Master saved successfully to:"
    f"\n{OUTPUT_PATH}"
)

