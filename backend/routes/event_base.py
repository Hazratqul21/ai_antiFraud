from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import database
import models
from services.event_repository import query_snapshots, get_metrics

router = APIRouter(prefix="/event-base", tags=["Event Base"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/snapshots")
def list_snapshots(
    status: str | None = None,
    action: str | None = None,
    country: str | None = None,
    rule_id: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    snapshots = query_snapshots(db, status, action, country, rule_id, limit)
    return [
        {
            "event_id": s.event_id,
            "transaction_id": s.transaction_id,
            "transaction_status": s.transaction_status,
            "risk_score": s.risk_score,
            "amount": s.amount,
            "currency": s.currency,
            "geo_country": s.geo_country,
            "device_type": s.device_type,
            "ip_reputation": s.ip_reputation,
            "rule_action": s.rule_action,
            "rule_ids": s.rule_ids,
            "metrics": s.metrics,
            "created_at": s.created_at,
        }
        for s in snapshots
    ]


@router.get("/metrics")
def list_metrics(days: int = 7, db: Session = Depends(get_db)):
    metrics = get_metrics(db, days)
    return [
        {
            "metric_date": m.metric_date,
            "total_events": m.total_events,
            "blocked_events": m.blocked_events,
            "challenged_events": m.challenged_events,
            "allowed_events": m.allowed_events,
            "avg_amount": round(m.avg_amount, 2) if m.avg_amount else 0,
            "avg_risk_score": round(m.avg_risk_score, 2) if m.avg_risk_score else 0,
        }
        for m in metrics
    ]

