import pandas as pd
from pathlib import Path


# =========================
# PATHS
# =========================

INPUT_PATH = Path("data/processed/caaqms_cleaned.csv")
OUTPUT_PATH = Path("data/processed/environmental_features.csv")


# =========================
# LOAD DATA
# =========================

df = pd.read_csv(INPUT_PATH)

# Convert Record time to datetime
df["Record time"] = pd.to_datetime(
    df["Record time"],
    errors="coerce"
)

# Remove rows where time could not be parsed
df = df.dropna(subset=["Record time"])


# =========================
# CREATE 1-HOUR WINDOW
# =========================

df["Time_Window"] = df["Record time"].dt.floor("h")


# =========================
# POLLUTION COLUMNS
# =========================

pollution_columns = {
    "PM25": "PM - 2.5 (µg/m3)",
    "PM10": "PM - 10 (µg/m3)",
    "SO2": "SO2 (µg/m3)",
    "CO": "CO (mg/m3)"
}


# =========================
# CONVERT TO NUMERIC
# =========================

for col in pollution_columns.values():
    df[col] = pd.to_numeric(df[col], errors="coerce")


# =========================
# GROUP BY MINE + HOUR
# =========================

grouped = df.groupby(
    ["Mine Name", "Time_Window"]
)


# =========================
# CREATE FEATURES
# =========================

features = grouped.size().reset_index(
    name="record_count"
)

for feature_name, column_name in pollution_columns.items():

    stats = grouped[column_name].agg(
        ["mean", "max", "std", "count"]
    ).reset_index()

    stats = stats.rename(columns={
        "mean": f"{feature_name}_mean",
        "max": f"{feature_name}_max",
        "std": f"{feature_name}_std",
        "count": f"{feature_name}_count"
    })

    features = features.merge(
        stats,
        on=["Mine Name", "Time_Window"],
        how="left"
    )

    # =========================
# HANDLE MISSING VALUES
# =========================

for feature_name in pollution_columns.keys():

    std_col = f"{feature_name}_std"
    count_col = f"{feature_name}_count"

    features.loc[
        features[count_col] == 1,
        std_col
    ] = 0


# Create missing indicator for PM10
features["PM10_missing"] = (
    features["PM10_count"] == 0
).astype(int)


# Impute missing PM10 values using median
pm10_features = [
    "PM10_mean",
    "PM10_max",
    "PM10_std"
]

for col in pm10_features:

    median_value = features[col].median()

    features[col] = features[col].fillna(median_value)



# =========================
# SAVE FEATURES
# =========================

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

features.to_csv(
    OUTPUT_PATH,
    index=False
)


# =========================
# CHECK RESULT
# =========================
print("\nMissing values after preprocessing:")
print(features.isnull().sum())

print("\nPM10 missing indicator:")
print(features["PM10_missing"].value_counts())

print("=" * 80)
print("HOURLY ENVIRONMENTAL FEATURE ENGINEERING")
print("=" * 80)

print("\nFeature dataset shape:")
print(features.shape)

print("\nColumns:")
print(features.columns.tolist())

print("\nFirst 10 rows:")
print(features.head(10))

print("\nSaved to:")
print(OUTPUT_PATH)