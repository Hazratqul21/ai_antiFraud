import datetime
import random
from typing import Dict, Any

import models
from sqlalchemy.orm import Session

from data.reference_data import (
    HIGH_RISK_IP_RANGES,
    KNOWN_SAFE_IP_RANGES,
    DEVICE_RISK_PROFILES,
    COUNTRY_LAT_LON,
    USER_SEGMENTS,
    infer_segment_from_user,
)
import schemas


def _lookup_ip_reputation(ip_address: str) -> Dict[str, Any]:
    prefix = ip_address.split(".", 1)[0] + "."
    if ip_address.startswith(tuple(HIGH_RISK_IP_RANGES.keys())):
        data = HIGH_RISK_IP_RANGES[prefix]
        return {"reputation": data["reputation"], "risk_score": data["risk_score"]}
    if ip_address.startswith(tuple(KNOWN_SAFE_IP_RANGES.keys())):
        data = KNOWN_SAFE_IP_RANGES[prefix]
        return {"reputation": data["reputation"], "risk_score": data["risk_score"]}
    return {"reputation": "unknown", "risk_score": 0.35}


def _detect_device_profile(device_id: str) -> Dict[str, str]:
    device_key = device_id.lower().split("_")[0]
    profile = DEVICE_RISK_PROFILES.get(device_key, {"type": "Unknown", "risk": "medium"})
    return {"device_type": profile["type"], "device_risk_level": profile["risk"]}


def _infer_geo(location: str):
    if not location:
        return None, None, None
    city_country = location.split(",")
    city = city_country[0].strip()
    country = city_country[-1].strip().upper()
    coords = COUNTRY_LAT_LON.get(country, ("0", "0"))
    return country, city, ",".join(coords)


def _build_behavioral_features(transaction: schemas.TransactionCreate) -> Dict[str, Any]:
    segment = infer_segment_from_user(transaction.user_id)
    baseline = USER_SEGMENTS[segment]
    random.seed(transaction.user_id)
    avg_amount = baseline["avg_amount"] * random.uniform(0.9, 1.1)
    txn_freq = baseline["txn_per_day"] + random.randint(-1, 2)
    days_since_last = random.randint(0, 5)
    velocity_flag = 1 if txn_freq > baseline["velocity_limit"] else 0

    return {
        "segment": segment,
        "avg_transaction_amount": round(avg_amount, 2),
        "transaction_frequency": max(1, txn_freq),
        "days_since_last_transaction": days_since_last,
        "velocity_flag": velocity_flag,
    }


def enrich_transaction_event(event: schemas.TransactionEvent) -> Dict[str, Any]:
    transaction = event.transaction
    ip_info = _lookup_ip_reputation(transaction.ip_address)
    device_info = _detect_device_profile(transaction.device_id)
    geo_country, geo_city, coordinates = _infer_geo(transaction.location)
    behavioral = _build_behavioral_features(transaction)

    derived_features = {
        "avg_transaction_amount": behavioral["avg_transaction_amount"],
        "transaction_frequency": behavioral["transaction_frequency"],
        "days_since_last_transaction": behavioral["days_since_last_transaction"],
        "velocity_flag": behavioral["velocity_flag"],
        "device_change": 1 if device_info["device_risk_level"] == "high" else 0,
        "ip_change": 1 if ip_info["risk_score"] > 0.7 else 0,
        "location_change_speed": random.uniform(0.1, 1.5),
    }

    signals = {
        "ip": ip_info,
        "device": device_info,
        "behavioral": behavioral,
    }

    explanations = {
        "ip": f"IP reputation classified as {ip_info['reputation']}",
        "device": f"Device type {device_info['device_type']} risk {device_info['device_risk_level']}",
        "behavior": f"User segment {behavioral['segment']} baseline velocity {behavioral['transaction_frequency']}/day",
    }

    return {
        "geo_country": geo_country,
        "geo_city": geo_city,
        "geo_coordinates": coordinates,
        "device_type": device_info["device_type"],
        "device_risk_level": device_info["device_risk_level"],
        "ip_reputation": ip_info["reputation"],
        "ip_risk_score": ip_info["risk_score"],
        "user_segment": behavioral["segment"],
        "signals": signals,
        "derived_features": derived_features,
        "explanations": explanations,
    }


def store_enriched_context(db: Session, ingested_event_id: int, context: Dict[str, Any]) -> models.EnrichedEventContext:
    record = models.EnrichedEventContext(
        ingested_event_id=ingested_event_id,
        geo_country=context["geo_country"],
        geo_city=context["geo_city"],
        geo_coordinates=context["geo_coordinates"],
        device_type=context["device_type"],
        device_risk_level=context["device_risk_level"],
        ip_reputation=context["ip_reputation"],
        ip_risk_score=context["ip_risk_score"],
        user_segment=context["user_segment"],
        signals=context["signals"],
        derived_features=context["derived_features"],
        explanations=context["explanations"],
        created_at=datetime.datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

