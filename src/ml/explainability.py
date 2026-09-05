import pandas as pd
from pathlib import Path

RISK_PATH = Path("data/processed/risk_engine.csv")
OUTPUT_PATH = Path("data/processed/explainability.csv")


# --------------------------------------------------
# 1. Load risk engine output
# --------------------------------------------------

df = pd.read_csv(RISK_PATH)

print("Total input records:", len(df))


# --------------------------------------------------
# 2. Helper functions
# --------------------------------------------------

def add_driver(drivers, text):
    if text not in drivers:
        drivers.append(text)


def generate_explanation(row):

    drivers = []

    env_score = row["Environmental_Risk_Score"]
    operational_score = row["Operational_Risk_Score"]
    peer_anomaly = row["Peer_Production_Anomaly"]

    # ----------------------------------------------
    # Environmental explanation
    # ----------------------------------------------

    if pd.notna(env_score):

        if env_score >= 80:
            add_driver(
                drivers,
                "Strong environmental risk indicator detected"
            )

        elif env_score >= 60:
            add_driver(
                drivers,
                "Elevated environmental risk indicator detected"
            )

        elif env_score >= 30:
            add_driver(
                drivers,
                "Moderate environmental risk indicator detected"
            )

        else:
            add_driver(
                drivers,
                "Environmental risk indicator is relatively low"
            )

    # ----------------------------------------------
    # Historical operational explanation
    # ----------------------------------------------

    if pd.notna(operational_score):

        if operational_score >= 80:
            add_driver(
                drivers,
                "Significant historical production anomaly detected"
            )

        elif operational_score >= 60:
            add_driver(
                drivers,
                "Elevated historical production anomaly detected"
            )

        elif operational_score >= 30:
            add_driver(
                drivers,
                "Moderate historical production variation detected"
            )

        else:
            add_driver(
                drivers,
                "Historical production indicator is relatively low"
            )

    # ----------------------------------------------
    # Peer-group explanation
    # ----------------------------------------------

    if peer_anomaly == 1:

        mine_type = row["Mine_Type"]

        direction = row["Peer_Production_Direction"]

        z_score = row["Peer_Production_ZScore"]

        if pd.notna(mine_type):

            add_driver(
                drivers,
                (
                    f"Production is {direction.lower()} "
                    f"compared with the {mine_type} peer group"
                )
            )

        if pd.notna(z_score):

            add_driver(
                drivers,
                (
                    f"Peer production deviation "
                    f"(Z-score: {z_score:.2f})"
                )
            )

    # ----------------------------------------------
    # No indicators
    # ----------------------------------------------

    if not drivers:
        return "No significant risk indicator detected."

    return "; ".join(drivers)


df["Risk_Explanation"] = df.apply(
    generate_explanation,
    axis=1
)


# --------------------------------------------------
# 3. Evidence-based explanation
# --------------------------------------------------

def generate_evidence_summary(row):

    domains = []

    if row["Environmental_Available"] == 1:
        domains.append("Environmental")

    if row["Operational_Available"] == 1:
        domains.append("Operational")

    if row["Safety_Evidence_Available"] == 1:
        domains.append("Safety")

    if not domains:
        return "No sufficient evidence available."

    return ", ".join(domains) + " evidence available."


df["Evidence_Summary"] = df.apply(
    generate_evidence_summary,
    axis=1
)


# --------------------------------------------------
# 4. Confidence explanation
# --------------------------------------------------

def generate_confidence_explanation(row):

    confidence = row["Confidence_Score"]

    if pd.isna(confidence) or confidence == 0:
        return "Insufficient evidence for reliable risk assessment."

    if confidence >= 80:
        return (
            "High confidence based on available evidence domains."
        )

    if confidence >= 50:
        return (
            "Moderate confidence because only limited evidence "
            "domains are available."
        )

    return (
        "Low confidence because evidence coverage is limited."
    )


df["Confidence_Explanation"] = df.apply(
    generate_confidence_explanation,
    axis=1
)


# --------------------------------------------------
# 5. Inspection explanation
# --------------------------------------------------

def generate_priority_explanation(row):

    category = row["Risk_Category"]

    if category == "CRITICAL":
        return (
            "High-risk indicators justify priority inspection "
            "or further assessment."
        )

    if category == "HIGH":
        return (
            "Elevated risk indicators justify further assessment."
        )

    if category == "MEDIUM":
        return (
            "Moderate risk indicators suggest monitoring and review."
        )

    if category == "LOW":
        return (
            "No immediate high-risk indicator detected."
        )

    return (
        "Insufficient evidence to determine inspection priority."
    )


df["Priority_Explanation"] = df.apply(
    generate_priority_explanation,
    axis=1
)


# --------------------------------------------------
# 6. Final human-readable explanation
# --------------------------------------------------

def generate_final_explanation(row):

    risk = row["Risk_Category"]
    score = row["Overall_Risk_Score"]

    if pd.isna(score):
        return (
            "Risk assessment cannot be reliably determined "
            "because sufficient evidence is unavailable."
        )

    return (
        f"Risk category: {risk}. "
        f"Overall prototype risk score: {score:.2f}/100. "
        f"{row['Risk_Explanation']}. "
        f"{row['Evidence_Summary']} "
        f"{row['Confidence_Explanation']}"
    )


df["Final_Explanation"] = df.apply(
    generate_final_explanation,
    axis=1
)


# --------------------------------------------------
# 7. Save explainability output
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
# 8. Validation
# --------------------------------------------------

print("\nTotal output records:", len(df))

print("\nExplanation coverage:")
print(
    df["Final_Explanation"]
    .notna()
    .value_counts()
)

print("\nImportant Mines:")

important_mines = [
    "Dipka",
    "Gevra"
]

print(
    df[
        df["Mine Name"].isin(important_mines)
    ][
        [
            "Mine Name",
            "Mine_Type",
            "Risk_Category",
            "Overall_Risk_Score",
            "Risk_Drivers",
            "Risk_Explanation",
            "Evidence_Summary",
            "Confidence_Score",
            "Final_Explanation"
        ]
    ].to_string(index=False)
)


if len(df) == len(
    pd.read_csv(RISK_PATH)
):
    print("\nPASS: One explainability record per mine.")

if df["Final_Explanation"].notna().all():
    print("PASS: Explanation generated for all records.")

print("\nSaved to:", OUTPUT_PATH)