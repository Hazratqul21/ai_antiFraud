RULES = [
    {
        "id": "high_amount_risky_geo",
        "name": "High Amount from Risky Geo",
        "severity": "high",
        "action": "BLOCK",
        "conditions": [
            {"type": "amount_greater_than", "value": 10000},
            {"type": "country_in", "value": ["UAE", "BRAZIL", "INDIA"]},
            {"type": "ip_risk_above", "value": 0.7},
        ],
        "reason": "Large transaction sourced from a monitored geography and risky IP.",
    },
    {
        "id": "velocity_spike",
        "name": "Velocity Spike",
        "severity": "medium",
        "action": "CHALLENGE",
        "conditions": [
            {"type": "velocity_flag_equals", "value": 1},
            {"type": "amount_between", "min": 500, "max": 5000},
        ],
        "reason": "Customer velocity exceeded baseline thresholds.",
    },
    {
        "id": "device_change_high_value",
        "name": "Device Change on High Value",
        "severity": "medium",
        "action": "CHALLENGE",
        "conditions": [
            {"type": "device_change_equals", "value": 1},
            {"type": "amount_greater_than", "value": 3000},
        ],
        "reason": "High value purchase on unfamiliar device.",
    },
    {
        "id": "known_safe_network",
        "name": "Known Safe Network",
        "severity": "low",
        "action": "ALLOW",
        "conditions": [
            {"type": "ip_reputation_equals", "value": "trusted_partner"},
            {"type": "amount_less_than", "value": 5000},
        ],
        "reason": "Traffic originates from vetted partner network.",
    },
]

