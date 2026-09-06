import pandas as pd
from pathlib import Path


# =========================
# PATHS
# =========================

INPUT_PATH = Path("data/processed/environmental_features.csv")


# =========================
# LOAD DATA
# =========================

df = pd.read_csv(INPUT_PATH)

print("Dataset shape:", df.shape)
print("\nColumns:")
print(df.columns.tolist())

# =========================
# SELECT MODEL FEATURES
# =========================

model_features = [
    "PM25_mean",
    "PM25_max",
    "PM25_std",
    "PM10_mean",
    "PM10_max",
    "PM10_std",
    "SO2_mean",
    "SO2_max",
    "SO2_std",
    "CO_mean",
    "CO_max",
    "CO_std"
]

X = df[model_features]

print("\nModel input shape:", X.shape)
print("\nModel features:")
print(X.columns.tolist())

# =========================
# CHECK MODEL DATA
# =========================

print("\nMissing values in model input:")
print(X.isnull().sum())

print("\nModel input preview:")
print(X.head())

# =========================
# ISOLATION FOREST
# =========================

from sklearn.ensemble import IsolationForest

model = IsolationForest(
    n_estimators=200,
    contamination="auto",
    random_state=42
)

model.fit(X)

# =========================
# ANOMALY PREDICTION
# =========================

df["Anomaly"] = model.predict(X)

df["Anomaly_Score"] = model.decision_function(X)

print("\nAnomaly counts:")
print(df["Anomaly"].value_counts())

print("\nAnomaly results:")
print(
    df[
        [
            "Mine Name",
            "Time_Window",
            "Anomaly",
            "Anomaly_Score"
        ]
    ].sort_values("Anomaly_Score").head(10)
)
# ENVIRONMENTAL RISK SCORE

min_score = df["Anomaly_Score"].min()
max_score = df["Anomaly_Score"].max()

df["Environmental_Risk_Score"] = (
    (max_score - df["Anomaly_Score"])
    / (max_score - min_score)
) * 100

df["Environmental_Risk_Score"] = (
    df["Environmental_Risk_Score"].clip(0, 100)
)

print("\nEnvironmental Risk Score:")
print(
    df[
        [
            "Mine Name",
            "Time_Window",
            "Anomaly_Score",
            "Environmental_Risk_Score"
        ]
    ]
    .sort_values("Environmental_Risk_Score", ascending=False)
    .head(10)
)
# ENVIRONMENTAL RISK SCORE

min_score = df["Anomaly_Score"].min()
max_score = df["Anomaly_Score"].max()

df["Environmental_Risk_Score"] = (
    (max_score - df["Anomaly_Score"])
    / (max_score - min_score)
) * 100

df["Environmental_Risk_Score"] = (
    df["Environmental_Risk_Score"].clip(0, 100)
)

print("\nEnvironmental Risk Score:")
print(
    df[
        [
            "Mine Name",
            "Time_Window",
            "Anomaly_Score",
            "Environmental_Risk_Score"
        ]
    ]
    .sort_values("Environmental_Risk_Score", ascending=False)
    .head(10)
)
# -----------------------------
# SAVE ANOMALY RESULTS
# -----------------------------

OUTPUT_PATH = Path(
    "data/processed/anomaly_detection.csv"
)

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_PATH,
    index=False
)

print("\nSaved anomaly detection results to:")
print(OUTPUT_PATH)
