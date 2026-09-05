import pandas as pd
from pathlib import Path

INPUT_PATH = Path("data/raw/mine_statistics_data_2026-09-05_01-20-16.xlsx")
OUTPUT_PATH = Path("data/processed/mine_context_analysis.csv")

# --------------------------------------------------
# 1. Load data
# --------------------------------------------------

df = pd.read_excel(INPUT_PATH)

print("Raw shape:", df.shape)

# --------------------------------------------------
# 2. Select required columns
# --------------------------------------------------

required_columns = [
    "Mine Name",
    "Company Name",
    "State",
    "District",
    "Coalfield",
    "Area",
    "Type",
    "Production"
]

df = df[required_columns].copy()

# --------------------------------------------------
# 3. Clean text columns
# --------------------------------------------------

text_columns = [
    "Mine Name",
    "Company Name",
    "State",
    "District",
    "Coalfield",
    "Area",
    "Type"
]

for col in text_columns:
    df[col] = df[col].astype(str).str.strip()

# --------------------------------------------------
# 4. Standardize Mine Type
# --------------------------------------------------

type_mapping = {
    "OC": "Opencast",
    "UG": "Underground",
    "Mixed": "Mixed"
}

df["Mine_Type"] = df["Type"].map(type_mapping)

# --------------------------------------------------
# 5. Convert production to numeric
# --------------------------------------------------

df["Production"] = pd.to_numeric(
    df["Production"],
    errors="coerce"
)

# --------------------------------------------------
# 6. Remove records without Mine Type
# --------------------------------------------------

df = df.dropna(subset=["Mine_Type"])

# --------------------------------------------------
# 7. Peer-group statistics
# --------------------------------------------------
# Compare each mine with mines having the
# same mine type.

peer_stats = (
    df.groupby("Mine_Type")["Production"]
    .agg(
        Peer_Mean="mean",
        Peer_Std="std",
        Peer_Count="count"
    )
    .reset_index()
)

df = df.merge(
    peer_stats,
    on="Mine_Type",
    how="left"
)

# --------------------------------------------------
# 8. Calculate peer production z-score
# --------------------------------------------------

df["Peer_Production_ZScore"] = (
    (df["Production"] - df["Peer_Mean"])
    / df["Peer_Std"]
)

# --------------------------------------------------
# 9. Handle zero standard deviation
# --------------------------------------------------

df.loc[
    df["Peer_Std"] == 0,
    "Peer_Production_ZScore"
] = 0

# --------------------------------------------------
# 10. Peer anomaly detection
# --------------------------------------------------

df["Peer_Production_Anomaly"] = (
    df["Peer_Production_ZScore"].abs() >= 2
).astype(int)

# --------------------------------------------------
# 11. Peer operational risk indicator
# --------------------------------------------------
# Prototype indicator only.
# It is NOT an official regulatory risk score.

df["Peer_Operational_Risk"] = (
    df["Peer_Production_ZScore"].abs() / 4 * 100
).clip(0, 100)

# --------------------------------------------------
# 12. Risk category
# --------------------------------------------------

def classify_peer_risk(z):
    if pd.isna(z):
        return "Insufficient Data"
    elif abs(z) >= 3:
        return "Highly Unusual"
    elif abs(z) >= 2:
        return "Unusual"
    else:
        return "Normal"


df["Peer_Production_Category"] = (
    df["Peer_Production_ZScore"]
    .apply(classify_peer_risk)
)

# --------------------------------------------------
# 13. Direction
# --------------------------------------------------

def classify_direction(z):
    if pd.isna(z):
        return "Unknown"
    elif z > 0:
        return "Higher than peer average"
    elif z < 0:
        return "Lower than peer average"
    else:
        return "Near peer average"


df["Peer_Production_Direction"] = (
    df["Peer_Production_ZScore"]
    .apply(classify_direction)
)

# --------------------------------------------------
# 14. Save output
# --------------------------------------------------

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_PATH,
    index=False
)

# --------------------------------------------------
# 15. Validation / summary
# --------------------------------------------------

print("\nFinal shape:", df.shape)

print("\nMine Type Distribution:")
print(df["Mine_Type"].value_counts())

print("\nPeer Anomaly Distribution:")
print(df["Peer_Production_Anomaly"].value_counts())

print("\nPeer Risk Categories:")
print(df["Peer_Production_Category"].value_counts())

print("\nTop unusual mines:")
print(
    df[
        [
            "Mine Name",
            "State",
            "Mine_Type",
            "Production",
            "Peer_Mean",
            "Peer_Production_ZScore",
            "Peer_Production_Category"
        ]
    ]
    .sort_values(
        "Peer_Production_ZScore",
        key=lambda x: x.abs(),
        ascending=False
    )
    .head(10)
    .to_string(index=False)
)

print("\nSaved to:", OUTPUT_PATH)