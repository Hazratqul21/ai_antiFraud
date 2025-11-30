import datetime
from sqlalchemy.orm import Session
import models


def create_alert_from_event(db: Session, event: models.IngestedEvent, transaction: models.Transaction, rule_hits: list):
    if not rule_hits:
        return None
    top_hit = rule_hits[0]
    alert = models.Alert(
        ingested_event_id=event.id,
        transaction_id=transaction.id,
        severity=top_hit["severity"],
        status=models.AlertStatus.OPEN.value,
        notes=top_hit.get("reason"),
        created_at=datetime.datetime.utcnow()
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def list_alerts(db: Session, status: str | None = None, limit: int = 50):
    query = db.query(models.Alert).order_by(models.Alert.created_at.desc())
    if status:
        query = query.filter(models.Alert.status == status)
    return query.limit(limit).all()


def update_alert_status(db: Session, alert_id: int, status: str, analyst: str | None = None, notes: str | None = None):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        return None
    alert.status = status
    alert.assigned_to = analyst or alert.assigned_to
    if notes:
        alert.notes = notes
    alert.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert




