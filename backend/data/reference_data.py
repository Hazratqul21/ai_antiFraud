"""
Static reference data used by the Sense → Interpret enrichment layer.
In production, these would be replaced by external services or dynamic datasets.
"""

HIGH_RISK_IP_RANGES = {
    "45.": {"reputation": "botnet", "risk_score": 0.92},
    "91.": {"reputation": "anonymous_proxy", "risk_score": 0.84},
    "179.": {"reputation": "high_chargeback", "risk_score": 0.78},
    "203.": {"reputation": "suspicious_vpn", "risk_score": 0.71},
}

KNOWN_SAFE_IP_RANGES = {
    "66.": {"reputation": "trusted_partner", "risk_score": 0.05},
    "104.": {"reputation": "corporate_network", "risk_score": 0.12},
}

DEVICE_RISK_PROFILES = {
    "iphone": {"type": "Mobile", "risk": "low"},
    "android": {"type": "Mobile", "risk": "medium"},
    "desktop": {"type": "Desktop", "risk": "low"},
    "tablet": {"type": "Tablet", "risk": "medium"},
    "laptop": {"type": "Laptop", "risk": "low"},
    "jailbreak": {"type": "Mobile", "risk": "high"},
}

COUNTRY_LAT_LON = {
    "USA": ("37.0902", "-95.7129"),
    "UK": ("55.3781", "-3.4360"),
    "France": ("46.2276", "2.2137"),
    "Germany": ("51.1657", "10.4515"),
    "Spain": ("40.4637", "-3.7492"),
    "Japan": ("36.2048", "138.2529"),
    "Singapore": ("1.3521", "103.8198"),
    "Australia": ("-25.2744", "133.7751"),
    "Canada": ("56.1304", "-106.3468"),
    "Brazil": ("-14.2350", "-51.9253"),
    "India": ("20.5937", "78.9629"),
    "UAE": ("23.4241", "53.8478"),
}

USER_SEGMENTS = {
    "consumer": {"avg_amount": 150.0, "txn_per_day": 3, "velocity_limit": 8},
    "premium": {"avg_amount": 600.0, "txn_per_day": 6, "velocity_limit": 12},
    "merchant": {"avg_amount": 2200.0, "txn_per_day": 15, "velocity_limit": 25},
}


def infer_segment_from_user(user_id: str) -> str:
    if user_id.startswith("vip") or user_id.endswith("999"):
        return "premium"
    if user_id.startswith("merchant") or "store" in user_id:
        return "merchant"
    return "consumer"

