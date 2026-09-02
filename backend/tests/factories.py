import copy


def mine_payload(**overrides):
    payload = {
        "name": "Mine A (Site Alpha)",
        "code": "MINE-ALPHA",
        "location": "Jharia Coalfield, Dhanbad, JH",
        "region": "Eastern Coalfields Division",
        "mineType": "Underground Bituminous",
        "status": "Active (At Risk)",
        "riskScore": 78,
        "primaryContractor": "Apex Mining Solutions",
        "coordinates": {
            "lat": 23.7466,
            "lng": 86.4154,
            "gpsText": "23.7466 N, 86.4154 E",
        },
        "riskFactors": {
            "safetyViolations": 4,
            "overdueActions": 2,
            "contractorIssues": 3,
            "envRenewals": 1,
        },
        "aiRecommendation": {
            "headline": "Immediate safety inspection recommended within 24 hours.",
            "description": "82% probability of disruption.",
            "actionLabel": "Deploy Inspection Team",
            "probability": 82,
        },
    }
    payload.update(overrides)
    return copy.deepcopy(payload)


def alert_payload(**overrides):
    payload = {
        "title": "Methane Sensor Failure",
        "location": "Sector 4, North Pit",
        "mine": "Blackwood North",
        "time": "10:42 AM",
        "status": "Unacknowledged",
        "severity": "Critical",
        "deadline": "11:00 AM",
        "isAiPrediction": True,
        "probScore": "89% PROB",
        "description": "Telemetry stream dropped offline.",
        "assignedTo": {"name": "J. Doe", "initials": "JD"},
    }
    payload.update(overrides)
    return copy.deepcopy(payload)


def compliance_payload(**overrides):
    payload = {
        "code": "REQ-2023-084",
        "requirement": "Ventilation Shaft Integrity Check",
        "mine": "Blackwood North",
        "category": "Safety",
        "dueDate": "2023-10-24",
        "status": "Overdue",
        "riskLevel": "High",
        "responsibleOfficer": {"name": "J. Mitchell"},
        "aiInsight": {
            "type": "RISK PATTERN DETECTED",
            "text": "78% probability of delay.",
            "delayProbability": 78,
        },
    }
    payload.update(overrides)
    return copy.deepcopy(payload)


def contractor_payload(**overrides):
    payload = {
        "name": "Apex Mining Solutions",
        "primarySite": "Mine A & Blackwood North",
        "activePersonnel": 142,
        "complianceScore": 74,
        "expiringCertifications": 8,
        "status": "Flagged",
        "mshaAuditDate": "2023-09-12",
    }
    payload.update(overrides)
    return copy.deepcopy(payload)


def inspection_payload(**overrides):
    payload = {
        "location": "Sector 4 - Conveyor Belt B",
        "sector": "Sector 4",
        "gpsText": "GPS: 23.7466 N, 86.4154 E",
        "time": "10:42 AM",
        "date": "Oct 24",
        "imageUrl": "http://example.com/media/conveyor.jpg",
        "notes": "Excessive coal dust accumulation noted near primary drive motor.",
        "status": "Active",
        "analysis": {
            "title": "Fire Safety Violation",
            "severity": "HIGH SEVERITY",
            "description": "Combustible dust build-up exceeds permissible thresholds.",
            "confidenceScore": 94,
            "standardRef": "Ref: MSHA 75.400",
        },
    }
    payload.update(overrides)
    return copy.deepcopy(payload)
