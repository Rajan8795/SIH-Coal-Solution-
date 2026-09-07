import pandas as pd
from sklearn.ensemble import IsolationForest

anomaly = pd.read_csv("data/processed/anomaly_detection.csv")
evidence = pd.read_csv("data/processed/evidence_engine.csv")
risk = pd.read_csv("data/processed/ai_recommendations.csv")

# --- 1. Anomaly stability ---
features = [
    "PM25_mean","PM25_max","PM25_std",
    "PM10_mean","PM10_max","PM10_std",
    "SO2_mean","SO2_max","SO2_std",
    "CO_mean","CO_max","CO_std"
]

X = anomaly[features].fillna(0)
keys = anomaly[["Mine Name","Time_Window"]].astype(str).agg("|".join, axis=1)

sets = []
for seed in [1,2,3,4,5]:
    pred = IsolationForest(
        contamination=0.13,
        random_state=seed
    ).fit_predict(X)
    sets.append(set(keys[pred == -1]))

common = len(set.intersection(*sets))
union = len(set.union(*sets))

stability_pct = (common / union * 100) if union else 0

# --- 2. Statistical support ---
normal = anomaly[anomaly["Anomaly"] == 1]
flagged = anomaly[anomaly["Anomaly"] == -1]

stat_rows = {
    "PM25": (flagged["PM25_max"].mean(), normal["PM25_max"].mean()),
    "SO2": (flagged["SO2_max"].mean(), normal["SO2_max"].mean()),
    "CO": (flagged["CO_max"].mean(), normal["CO_max"].mean())
}

# --- 3. Mine-level evidence ---
env = evidence[evidence["Environmental_Available"] == 1].copy()

env = env[
    ["Mine Name","CAAQMS_Source_Name",
     "Environmental_Anomaly_Count",
     "Evidence_Coverage","Evidence_Status"]
]

final = risk[
    ["Mine Name","Overall_Risk_Score",
     "Risk_Category","Confidence_Score",
     "Inspection_Priority"]
].copy()

final = final.merge(env, on="Mine Name", how="left")

# --- 4. Validation status ---
def validation_status(row):
    if pd.isna(row["Overall_Risk_Score"]):
        return "Insufficient Evidence"

    if row["Evidence_Coverage"] == 100 and row["Confidence_Score"] >= 80:
        return "Supported by Available Evidence"

    return "Requires Additional Evidence"

final["Validation_Status"] = final.apply(validation_status, axis=1)

# --- 5. Report summary ---
summary = pd.DataFrame({
    "Metric": [
        "Total ML windows",
        "Detected anomaly windows",
        "Normal windows",
        "Anomaly stability across 5 seeds",
        "Common anomalies across 5 seeds",
        "Union of anomalies across 5 seeds",
        "Ground truth labels available",
        "Conventional accuracy"
    ],
    "Value": [
        len(anomaly),
        len(flagged),
        len(normal),
        f"{stability_pct:.1f}%",
        common,
        union,
        "No",
        "Not calculable"
    ]
})

summary.to_csv("data/processed/validation_summary.csv", index=False)
final.to_csv("data/processed/validation_report.csv", index=False)

print("Validation reports created successfully.")
print()
print(summary.to_string(index=False))
