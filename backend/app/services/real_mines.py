import csv
from pathlib import Path
from typing import Any


DATA_DIR = Path(__file__).resolve().parents[3] / "data" / "processed"
INSUFFICIENT_EVIDENCE = "Insufficient Evidence"


def _read_csv(filename: str) -> list[dict[str, str]]:
    with (DATA_DIR / filename).open(newline="", encoding="utf-8-sig") as file:
        return list(csv.DictReader(file))


def _by_mine_name(rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    result: dict[str, dict[str, str]] = {}
    for row in rows:
        name = row.get("Mine Name", "").strip()
        if name and name not in result:
            result[name] = row
    return result


def _text(row: dict[str, str], key: str) -> str:
    value = row.get(key, "").strip()
    return value or INSUFFICIENT_EVIDENCE


def _number(row: dict[str, str], key: str) -> float | None:
    value = row.get(key, "").strip()
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _int_or_insufficient(row: dict[str, str], key: str) -> int | str:
    value = _number(row, key)
    return int(value) if value is not None else INSUFFICIENT_EVIDENCE


def get_real_mines() -> list[dict[str, Any]]:
    master_rows = _read_csv("mine_master.csv")
    evidence = _by_mine_name(_read_csv("evidence_engine.csv"))
    confidence = _by_mine_name(_read_csv("confidence_engine.csv"))
    risk = _by_mine_name(_read_csv("risk_engine.csv"))
    explanations = _by_mine_name(_read_csv("explainability.csv"))
    priority = _by_mine_name(_read_csv("inspection_priority.csv"))
    recommendations = _by_mine_name(_read_csv("ai_recommendations.csv"))
    anomalies = _by_mine_name(_read_csv("anomaly_detection.csv"))
    mapping_rows = _read_csv("mine_mapping.csv")

    mapping: dict[tuple[str, str, str], dict[str, str]] = {}
    for row in mapping_rows:
        key = (
            row.get("Master_Mine_Name", "").strip(),
            row.get("Master_Company", "").strip(),
            row.get("Master_State", "").strip(),
        )
        if key[0] and key not in mapping:
            mapping[key] = row

    mines: list[dict[str, Any]] = []
    for index, master in enumerate(master_rows):
        name = master.get("Mine Name", "").strip()
        company = master.get("Company Name", "").strip()
        state = master.get("State", "").strip()
        risk_row = risk.get(name, {})
        confidence_row = confidence.get(name, {})
        evidence_row = evidence.get(name, {})
        explanation_row = explanations.get(name, {})
        priority_row = priority.get(name, {})
        recommendation_row = recommendations.get(name, {})
        anomaly_row = anomalies.get(name, {})
        risk_category = _text(risk_row, "Risk_Category")
        priority_value = _text(priority_row, "Inspection_Priority")
        mapping_row = mapping.get((name, company, state), {})

        if risk_category in {"HIGH", "CRITICAL"}:
            status = "Active (At Risk)"
        elif priority_value in {"HIGH", "MEDIUM"}:
            status = "Inspection Scheduled"
        else:
            status = "Operational"

        recommendation = _text(
            recommendation_row, "AI_Preventive_Recommendation"
        )
        if recommendation == INSUFFICIENT_EVIDENCE:
            recommendation = _text(risk_row, "AI_Recommendation")

        mine_id = f"{master.get('Mine ID', name)}-{index}"
        mines.append(
            {
            "id": mine_id,
            "mineId": mine_id,
                "name": name or INSUFFICIENT_EVIDENCE,
            "code": mine_id,
                "location": ", ".join(
                    value for value in (
                        master.get("Coalfield", "").strip(),
                        master.get("District", "").strip(),
                        state,
                    ) if value
                ) or INSUFFICIENT_EVIDENCE,
                "region": company or INSUFFICIENT_EVIDENCE,
                "mineType": master.get("Mine Type", "").strip() or INSUFFICIENT_EVIDENCE,
                "state": state or INSUFFICIENT_EVIDENCE,
                "district": master.get("District", "").strip() or INSUFFICIENT_EVIDENCE,
                "coalfield": master.get("Coalfield", "").strip() or INSUFFICIENT_EVIDENCE,
                "area": master.get("Area", "").strip() or INSUFFICIENT_EVIDENCE,
                "ownership": master.get("Ownership", "").strip() or INSUFFICIENT_EVIDENCE,
                "production": _number(master, "Production"),
                "despatch": _number(master, "Despatch"),
                "status": status,
                "riskScore": _number(risk_row, "Overall_Risk_Score"),
                "primaryContractor": company or INSUFFICIENT_EVIDENCE,
                "coordinates": None,
                "riskFactors": {
                    "safetyViolations": INSUFFICIENT_EVIDENCE,
                    "overdueActions": INSUFFICIENT_EVIDENCE,
                    "contractorIssues": INSUFFICIENT_EVIDENCE,
                    "envRenewals": _int_or_insufficient(
                        evidence_row, "Environmental_Anomaly_Count"
                    ),
                },
                "aiRecommendation": {
                    "headline": recommendation,
                    "description": _text(explanation_row, "Final_Explanation"),
                    "actionLabel": "Deploy Inspection Team" if priority_value in {"HIGH", "MEDIUM"} else "Review Evidence",
                    "probability": _number(confidence_row, "Confidence_Score"),
                },
                "confidenceScore": _number(confidence_row, "Confidence_Score"),
                "confidenceCategory": _text(confidence_row, "Confidence_Category"),
                "evidenceStatus": _text(evidence_row, "Evidence_Status"),
                "evidenceCoverage": _number(evidence_row, "Evidence_Coverage"),
                "inspectionPriority": priority_value,
                "priorityScore": _number(priority_row, "Priority_Score"),
                "riskCategory": risk_category,
                "operationalRiskScore": _number(risk_row, "Operational_Risk_Score"),
                "safetyRiskScore": _number(risk_row, "Safety_Risk_Score"),
                "riskDrivers": _text(risk_row, "Risk_Drivers"),
                "explanation": _text(explanation_row, "Final_Explanation"),
                "mappingStatus": _text(mapping_row, "Mapping_Status"),
                "environmentalAnomaly": _text(anomaly_row, "Anomaly"),
                "environmentalAnomalyScore": _number(anomaly_row, "Anomaly_Score"),
                "environmentalRiskScore": _number(anomaly_row, "Environmental_Risk_Score"),
            }
        )

    return mines