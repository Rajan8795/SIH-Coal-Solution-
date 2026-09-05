
import pandas as pd
from pathlib import Path


# =========================================================
# PATHS
# =========================================================

MAPPING_PATH = Path("data/processed/mine_mapping.csv")
ENV_PATH = Path("data/processed/anomaly_detection.csv")
PRODUCTION_PATH = Path("data/processed/production_analysis.csv")

OUTPUT_PATH = Path("data/processed/evidence_engine.csv")


# =========================================================
# LOAD DATA
# =========================================================

mapping = pd.read_csv(MAPPING_PATH)
environmental = pd.read_csv(ENV_PATH)
production = pd.read_csv(PRODUCTION_PATH)

mapping.columns = mapping.columns.str.strip()
environmental.columns = environmental.columns.str.strip()
production.columns = production.columns.str.strip()


# =========================================================
# BASIC VALIDATION
# =========================================================

required_mapping = [
    "Source",
    "Source_Mine_Name",
    "Master_Mine_Name",
    "Match_Type",
    "Mapping_Status"
]

required_environmental = [
    "Mine Name",
    "Anomaly",
    "Anomaly_Score",
    "Environmental_Risk_Score"
]

required_production = [
    "Producing Mine",
    "Production_ZScore",
    "Absolute_Production_ZScore",
    "Production_Anomaly",
    "Production_Anomaly_Category",
    "Production_Anomaly_Reason",
    "Latest_Production_Change",
    "Data_Sufficient"
]

for col in required_mapping:
    if col not in mapping.columns:
        raise KeyError(f"Missing mapping column: {col}")

for col in required_environmental:
    if col not in environmental.columns:
        raise KeyError(f"Missing environmental column: {col}")

for col in required_production:
    if col not in production.columns:
        raise KeyError(f"Missing production column: {col}")


# =========================================================
# 1. ENVIRONMENTAL SUMMARY
# =========================================================

environmental_summary = (
    environmental
    .groupby("Mine Name")
    .agg(
        Environmental_Anomaly=("Anomaly", "max"),
        Environmental_Risk_Score=(
            "Environmental_Risk_Score",
            "max"
        ),
        Environmental_Min_Anomaly_Score=(
            "Anomaly_Score",
            "min"
        ),
        Environmental_Anomaly_Count=(
            "Anomaly",
            "sum"
        ),
        Environmental_Observations=(
            "Anomaly",
            "count"
        )
    )
    .reset_index()
)

environmental_summary[
    "Environmental_Anomaly_Rate"
] = (
    environmental_summary["Environmental_Anomaly_Count"]
    /
    environmental_summary["Environmental_Observations"]
    * 100
)

environmental_summary[
    "Environmental_Available"
] = 1


print("\nEnvironmental summary created:")
print(
    environmental_summary[
        [
            "Mine Name",
            "Environmental_Risk_Score",
            "Environmental_Anomaly_Count"
        ]
    ].to_string(index=False)
)


# =========================================================
# 2. CAAQMS VERIFIED MAPPING
# =========================================================
#
# Source name:
#
# M/s Dipka Expansion Project ...
#             ↓
#          Dipka
#
# SECL GEVRA
#      ↓
#    Gevra
#
# AQMS_H_Q
#      ↓
#   unmatched
#
# Only VERIFIED mappings are used.
#
# =========================================================

caaqms_mapping = mapping[
    (mapping["Source"] == "CAAQMS") &
    (mapping["Mapping_Status"] == "Verified")
].copy()


caaqms_mapping = caaqms_mapping[
    [
        "Source_Mine_Name",
        "Master_Mine_Name",
        "Match_Type"
    ]
].drop_duplicates()


print("\nVerified CAAQMS mappings:")
print(
    caaqms_mapping.to_string(index=False)
)


# =========================================================
# 3. ENVIRONMENTAL SOURCE → MASTER MINE
# =========================================================

environmental_evidence = environmental_summary.merge(
    caaqms_mapping,
    left_on="Mine Name",
    right_on="Source_Mine_Name",
    how="inner"
)


# IMPORTANT:
# After merge:
#
# environmental_summary["Mine Name"]
# = CAAQMS source name
#
# Master identity:
# Master_Mine_Name
#
# Therefore explicitly rename it.

environmental_evidence = (
    environmental_evidence
    .rename(
        columns={
            "Mine Name": "CAAQMS_Source_Name",
            "Master_Mine_Name": "Mine Name",
            "Match_Type": "CAAQMS_Match_Type"
        }
    )
)


# Keep only the fields we need.

environmental_evidence = environmental_evidence[
    [
        "Mine Name",
        "CAAQMS_Source_Name",
        "CAAQMS_Match_Type",
        "Environmental_Anomaly",
        "Environmental_Risk_Score",
        "Environmental_Min_Anomaly_Score",
        "Environmental_Anomaly_Count",
        "Environmental_Observations",
        "Environmental_Anomaly_Rate",
        "Environmental_Available"
    ]
].copy()


# =========================================================
# 4. PRODUCTION SUMMARY
# =========================================================

production_summary = production[
    [
        "Producing Mine",
        "Production_ZScore",
        "Absolute_Production_ZScore",
        "Production_Anomaly",
        "Production_Anomaly_Category",
        "Production_Anomaly_Reason",
        "Latest_Production_Change",
        "Data_Sufficient"
    ]
].copy()


production_summary = production_summary.rename(
    columns={
        "Producing Mine":
            "Production_Source_Name",

        "Production_ZScore":
            "Operational_ZScore",

        "Absolute_Production_ZScore":
            "Operational_Absolute_ZScore",

        "Production_Anomaly":
            "Operational_Anomaly",

        "Production_Anomaly_Category":
            "Operational_Anomaly_Category",

        "Production_Anomaly_Reason":
            "Operational_Anomaly_Reason",

        "Latest_Production_Change":
            "Operational_Change"
    }
)


production_summary[
    "Operational_Available"
] = (
    production_summary["Data_Sufficient"]
    .fillna(False)
    .astype(bool)
    .astype(int)
)


# =========================================================
# 5. PRODUCTION MAPPING
# =========================================================
#
# We DO NOT use all Matched_Review records.
#
# Only:
#
#   Verified
#   OR
#   high-confidence Contextual_Fuzzy
#
# Possible matches are excluded.
#
# =========================================================

production_mapping = mapping[
    mapping["Source"] == "Production"
].copy()


if "Match_Score" in production_mapping.columns:

    production_mapping["Match_Score"] = pd.to_numeric(
        production_mapping["Match_Score"],
        errors="coerce"
    )

else:

    production_mapping["Match_Score"] = 0


if "Score_Gap" in production_mapping.columns:

    production_mapping["Score_Gap"] = pd.to_numeric(
        production_mapping["Score_Gap"],
        errors="coerce"
    )

else:

    production_mapping["Score_Gap"] = 0


verified_production = production_mapping[
    production_mapping["Mapping_Status"] == "Verified"
].copy()


contextual_production = production_mapping[
    (production_mapping["Match_Type"] == "Contextual_Fuzzy") &
    (production_mapping["Match_Score"] >= 0.90) &
    (production_mapping["Score_Gap"] >= 0.05)
].copy()


reliable_production_mapping = pd.concat(
    [
        verified_production,
        contextual_production
    ],
    ignore_index=True
)


reliable_production_mapping = (
    reliable_production_mapping[
        [
            "Source_Mine_Name",
            "Master_Mine_Name",
            "Match_Type"
        ]
    ]
    .drop_duplicates()
)


reliable_production_mapping = (
    reliable_production_mapping
    .rename(
        columns={
            "Master_Mine_Name":
                "Mine Name",

            "Match_Type":
                "Production_Match_Type"
        }
    )
)


print(
    "\nReliable production mappings:",
    len(reliable_production_mapping)
)


# =========================================================
# 6. PRODUCTION SOURCE → MASTER MINE
# =========================================================

production_evidence = production_summary.merge(
    reliable_production_mapping,
    left_on="Production_Source_Name",
    right_on="Source_Mine_Name",
    how="inner"
)


production_evidence = production_evidence[
    [
        "Mine Name",
        "Production_Source_Name",
        "Production_Match_Type",
        "Operational_ZScore",
        "Operational_Absolute_ZScore",
        "Operational_Anomaly",
        "Operational_Anomaly_Category",
        "Operational_Anomaly_Reason",
        "Operational_Change",
        "Data_Sufficient",
        "Operational_Available"
    ]
].copy()


# =========================================================
# 7. ONE PRODUCTION RECORD PER MASTER MINE
# =========================================================
#
# If multiple source records map to the same master mine,
# keep the strongest operational signal.
#
# =========================================================

production_evidence = (
    production_evidence
    .sort_values(
        "Operational_Absolute_ZScore",
        ascending=False
    )
    .drop_duplicates(
        subset=["Mine Name"],
        keep="first"
    )
)


# =========================================================
# 8. COMBINE ENVIRONMENTAL + OPERATIONAL
# =========================================================

combined = pd.merge(
    environmental_evidence,
    production_evidence,
    on="Mine Name",
    how="outer"
)


# =========================================================
# 9. AVAILABILITY FLAGS
# =========================================================

combined["Environmental_Available"] = (
    combined["Environmental_Available"]
    .fillna(0)
    .astype(int)
)

combined["Operational_Available"] = (
    combined["Operational_Available"]
    .fillna(0)
    .astype(int)
)


# =========================================================
# 10. EVIDENCE STATUS
# =========================================================

def evidence_status(row):

    env = row["Environmental_Available"] == 1
    op = row["Operational_Available"] == 1

    if env and op:
        return "Environmental + Operational"

    if env:
        return "Environmental Only"

    if op:
        return "Operational Only"

    return "Insufficient Evidence"


combined["Evidence_Status"] = combined.apply(
    evidence_status,
    axis=1
)


# =========================================================
# 11. EVIDENCE COUNT
# =========================================================

combined["Evidence_Count"] = (
    combined["Environmental_Available"]
    +
    combined["Operational_Available"]
)


# =========================================================
# 12. EVIDENCE COVERAGE
# =========================================================

combined["Evidence_Coverage"] = (
    combined["Evidence_Count"] / 2 * 100
)


# =========================================================
# 13. SAFETY LIMITATION
# =========================================================

combined["Safety_Evidence_Status"] = (
    "Mine-level safety evidence unavailable"
)


# =========================================================
# 14. NUMERIC CLEANING
# =========================================================

numeric_columns = [
    "Environmental_Risk_Score",
    "Environmental_Min_Anomaly_Score",
    "Environmental_Anomaly_Count",
    "Environmental_Observations",
    "Environmental_Anomaly_Rate",
    "Operational_ZScore",
    "Operational_Absolute_ZScore",
    "Operational_Change",
    "Evidence_Count",
    "Evidence_Coverage"
]


for column in numeric_columns:

    if column in combined.columns:

        combined[column] = pd.to_numeric(
            combined[column],
            errors="coerce"
        )


# =========================================================
# 15. FINAL COLUMN ORDER
# =========================================================

final_columns = [
    "Mine Name",

    # Environmental
    "CAAQMS_Source_Name",
    "CAAQMS_Match_Type",
    "Environmental_Anomaly",
    "Environmental_Risk_Score",
    "Environmental_Min_Anomaly_Score",
    "Environmental_Anomaly_Count",
    "Environmental_Observations",
    "Environmental_Anomaly_Rate",
    "Environmental_Available",

    # Operational
    "Production_Source_Name",
    "Production_Match_Type",
    "Operational_ZScore",
    "Operational_Absolute_ZScore",
    "Operational_Anomaly",
    "Operational_Anomaly_Category",
    "Operational_Anomaly_Reason",
    "Operational_Change",
    "Data_Sufficient",
    "Operational_Available",

    # Combined
    "Evidence_Count",
    "Evidence_Coverage",
    "Evidence_Status",

    # Safety
    "Safety_Evidence_Status"
]


final_columns = [
    column
    for column in final_columns
    if column in combined.columns
]


final_df = combined[
    final_columns
].copy()


# =========================================================
# 16. SAVE
# =========================================================

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

final_df.to_csv(
    OUTPUT_PATH,
    index=False
)


# =========================================================
# 17. FINAL SUMMARY
# =========================================================

print("\n========================================")
print("EVIDENCE ENGINE")
print("========================================")

print(
    "Environmental source mines:",
    len(environmental_summary)
)

print(
    "Verified CAAQMS mappings:",
    len(caaqms_mapping)
)

print(
    "Reliable production mappings:",
    len(reliable_production_mapping)
)

print(
    "Combined master mine records:",
    len(final_df)
)


print("\nEvidence Status:")
print(
    final_df[
        "Evidence_Status"
    ].value_counts()
)


# =========================================================
# 18. IMPORTANT MINE CHECK
# =========================================================

print("\n========================================")
print("IMPORTANT MINE CHECK")
print("========================================")

important_mines = [
    "Dipka",
    "Gevra"
]


important = final_df[
    final_df["Mine Name"].isin(important_mines)
]


if len(important) > 0:

    preview_columns = [
        "Mine Name",
        "CAAQMS_Source_Name",
        "Environmental_Risk_Score",
        "Operational_ZScore",
        "Environmental_Available",
        "Operational_Available",
        "Evidence_Coverage",
        "Evidence_Status"
    ]

    print(
        important[
            preview_columns
        ].to_string(index=False)
    )

else:

    print(
        "WARNING: Dipka/Gevra not found."
    )


print("\n========================================")
print(
    f"Saved to: {OUTPUT_PATH}"
)
print("========================================")

