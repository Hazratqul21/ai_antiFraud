import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

import models


def record_event_snapshot(
    db: Session,
    event_record: models.IngestedEvent,
    transaction: models.Transaction,
    enrichment_context: dict,
    decision: dict,
    rule_hits: list,
):
    rule_ids = [hit["rule_id"] for hit in rule_hits]
    metrics = {
        "confidence": transaction.risk_score.confidence if transaction.risk_score else None,
        "reason": transaction.risk_score.reason if transaction.risk_score else None,
    }
    snapshot = models.EventSnapshot(
        ingested_event_id=event_record.id,
        event_id=event_record.event_id,
        transaction_id=transaction.id,
        transaction_status=transaction.status,
        risk_score=transaction.risk_score.score if transaction.risk_score else None,
        amount=transaction.amount,
        currency=transaction.currency,
        geo_country=enrichment_context.get("geo_country"),
        device_type=enrichment_context.get("device_type"),
        ip_reputation=enrichment_context.get("ip_reputation"),
        rule_action=decision.get("action"),
        rule_ids=rule_ids,
        metrics=metrics,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(snapshot)
    db.commit()
    return snapshot


def update_event_metrics(db: Session, transaction: models.Transaction):
    metric_date = transaction.timestamp.replace(hour=0, minute=0, second=0, microsecond=0)
    metric = (
        db.query(models.EventMetric)
        .filter(models.EventMetric.metric_date == metric_date)
        .first()
    )
    if not metric:
        metric = models.EventMetric(metric_date=metric_date)
        db.add(metric)

    metric.total_events += 1
    if transaction.status == "BLOCK":
        metric.blocked_events += 1
    elif transaction.status == "CHALLENGE":
        metric.challenged_events += 1
    else:
        metric.allowed_events += 1

    # Running averages
    count = metric.total_events
    metric.avg_amount = ((metric.avg_amount * (count - 1)) + transaction.amount) / count
    if transaction.risk_score:
        metric.avg_risk_score = (
            (metric.avg_risk_score * (count - 1)) + transaction.risk_score.score
        ) / count

    db.commit()
    return metric


def query_snapshots(
    db: Session,
    status: str | None = None,
    action: str | None = None,
    country: str | None = None,
    rule_id: str | None = None,
    limit: int = 50,
):
    query = db.query(models.EventSnapshot).order_by(models.EventSnapshot.created_at.desc())
    if status:
        query = query.filter(models.EventSnapshot.transaction_status == status)
    if action:
        query = query.filter(models.EventSnapshot.rule_action == action)
    if country:
        query = query.filter(models.EventSnapshot.geo_country == country)
    if rule_id:
        query = query.filter(models.EventSnapshot.rule_ids.contains([rule_id]))
    return query.limit(limit).all()


def get_metrics(db: Session, days: int = 7):
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    metrics = (
        db.query(models.EventMetric)
        .filter(models.EventMetric.metric_date >= cutoff)
        .order_by(models.EventMetric.metric_date.desc())
        .all()
    )
    return metrics




