import pandas as pd
import os


# ============================================================
# AI RECOMMENDATION ENGINE
# ============================================================

RISK_FILE = "data/processed/risk_engine.csv"
EXPLAINABILITY_FILE = "data/processed/explainability.csv"
PRIORITY_FILE = "data/processed/inspection_priority.csv"

OUTPUT_FILE = "data/processed/ai_recommendations.csv"


def generate_recommendation(row):

    recommendations = []

    risk_category = str(row.get("Risk_Category", "")).upper()
    drivers = str(row.get("Risk_Drivers", "")).lower()
    explanation = str(row.get("Risk_Explanation", "")).lower()

    # Environmental recommendations
    if "environmental" in drivers or "environmental" in explanation:
        recommendations.append(
            "Increase environmental monitoring and investigate potential sources of elevated pollutant levels."
        )

    if "pm10" in explanation:
        recommendations.append(
            "Review dust suppression practices and consider increased particulate monitoring."
        )

    if "pm25" in explanation:
        recommendations.append(
            "Investigate potential particulate emission sources and increase PM2.5 monitoring."
        )

    # Operational recommendations
    if "operational" in drivers or "production" in explanation:
        recommendations.append(
            "Review recent production trends and investigate unusual operational deviations."
        )

    if "peer production anomaly" in drivers:
        recommendations.append(
            "Compare production activity with similar mines and review the cause of significant peer deviation."
        )

    # Risk-based recommendation
    if risk_category == "CRITICAL":
        recommendations.append(
            "Prioritize focused inspection and immediate further assessment of the identified risk indicators."
        )

    elif risk_category == "HIGH":
        recommendations.append(
            "Prioritize further assessment and focused inspection based on the identified risk indicators."
        )

    elif risk_category == "MEDIUM":
        recommendations.append(
            "Continue monitoring and conduct a focused review of the identified risk indicators."
        )

    elif risk_category == "LOW":
        recommendations.append(
            "No immediate high-risk indicator detected; continue routine monitoring."
        )

    elif risk_category == "INSUFFICIENT EVIDENCE":
        recommendations.append(
            "Collect additional evidence before making a risk-based inspection decision."
        )

    # Remove duplicate recommendations
    recommendations = list(dict.fromkeys(recommendations))

    return " ".join(recommendations)


def main():

    print("=" * 70)
    print("AI RECOMMENDATION ENGINE")
    print("=" * 70)

    risk = pd.read_csv(RISK_FILE)
    explainability = pd.read_csv(EXPLAINABILITY_FILE)
    priority = pd.read_csv(PRIORITY_FILE)

    print(f"Risk records: {len(risk)}")
    print(f"Explainability records: {len(explainability)}")
    print(f"Priority records: {len(priority)}")

    # Merge risk + explainability
    df = risk.merge(
        explainability[
            ["Mine Name", "Risk_Explanation", "Evidence_Summary"]
        ],
        on="Mine Name",
        how="left"
    )

    # Merge inspection priority
    df = df.merge(
        priority[
            ["Mine Name", "Inspection_Priority", "Priority_Reason"]
        ],
        on="Mine Name",
        how="left"
    )

    # Generate recommendations
    df["AI_Preventive_Recommendation"] = df.apply(
        generate_recommendation,
        axis=1
    )

    # Select final columns
    output_columns = [
        "Mine Name",
        "Mine_Type",
        "Overall_Risk_Score",
        "Risk_Category",
        "Risk_Drivers",
        "Confidence_Score",
        "Inspection_Priority",
        "AI_Preventive_Recommendation"
    ]

    output = df[output_columns].copy()

    # Validation
    print("\n" + "=" * 70)
    print("RECOMMENDATION VALIDATION")
    print("=" * 70)

    print(f"Total output records: {len(output)}")

    missing_recommendations = output[
        output["AI_Preventive_Recommendation"].isna()
        | (output["AI_Preventive_Recommendation"].str.strip() == "")
    ]

    if len(missing_recommendations) == 0:
        print("PASS: Recommendation generated for all mines.")
    else:
        print(
            f"WARNING: {len(missing_recommendations)} mines have no recommendation."
        )

    if output["Mine Name"].nunique() == risk["Mine Name"].nunique():
        print("PASS: One recommendation record per mine.")
    else:
        print("WARNING: Mine count mismatch.")

    # Important mine check
    print("\n" + "=" * 70)
    print("IMPORTANT MINE CHECK")
    print("=" * 70)

    important_mines = output[
        output["Mine Name"].isin(["Dipka", "Gevra"])
    ]

    print(
        important_mines[
            [
                "Mine Name",
                "Overall_Risk_Score",
                "Risk_Category",
                "Inspection_Priority",
                "AI_Preventive_Recommendation"
            ]
        ].to_string(index=False)
    )

    # Save
    os.makedirs("data/processed", exist_ok=True)

    output.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("\nSaved to:")
    print(OUTPUT_FILE)

    print("=" * 70)


if __name__ == "__main__":
    main()