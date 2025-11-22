import datetime
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import models
import schemas
from services.transaction_service import create_transaction_record
from services.enrichment_service import enrich_transaction_event, store_enriched_context
from services.event_pipeline import (
    run_processing_pipeline,
    persist_rule_hits,
    persist_automated_action,
)
from services.event_repository import record_event_snapshot, update_event_metrics
from services.alert_service import create_alert_from_event


def ingest_transaction_event(db: Session, event: schemas.TransactionEvent) -> schemas.IngestTransactionResponse:
    existing = db.query(models.IngestedEvent).filter(models.IngestedEvent.event_id == event.event_id).first()
    if existing and existing.processed_transaction_id:
        return schemas.IngestTransactionResponse(
            event_id=event.event_id,
            status=existing.status,
            transaction_id=existing.processed_transaction_id,
            message="Event already processed"
        )

    payload = event.model_dump()

    if not existing:
        event_record = models.IngestedEvent(
            event_id=event.event_id,
            source_system=event.source_system,
            channel=event.channel,
            priority=event.priority or "normal",
            event_type="TRANSACTION",
            payload=payload,
            status=models.IngestedEventStatus.RECEIVED.value,
            received_at=event.ingestion_timestamp or datetime.datetime.utcnow()
        )
        db.add(event_record)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            event_record = db.query(models.IngestedEvent).filter(models.IngestedEvent.event_id == event.event_id).first()
        db.refresh(event_record)
    else:
        event_record = existing

    try:
        event_record.status = models.IngestedEventStatus.PROCESSING.value
        db.commit()

        enrichment_context = enrich_transaction_event(event)
        store_enriched_context(db, event_record.id, enrichment_context)
        payload = event_record.payload or {}
        payload["enrichment"] = enrichment_context
        event_record.payload = payload
        db.commit()

        derived_features = enrichment_context.get("derived_features", {})
        transaction_payload = event.transaction.model_copy(
            update={
                "avg_transaction_amount": derived_features.get("avg_transaction_amount"),
                "transaction_frequency": derived_features.get("transaction_frequency"),
                "days_since_last_transaction": derived_features.get("days_since_last_transaction"),
                "velocity_flag": derived_features.get("velocity_flag"),
                "device_change": derived_features.get("device_change"),
                "ip_change": derived_features.get("ip_change"),
                "location_change_speed": derived_features.get("location_change_speed"),
                "metadata": {
                    "enrichment_signals": enrichment_context.get("signals"),
                    "user_segment": enrichment_context.get("user_segment"),
                },
            }
        )

        pipeline_result = run_processing_pipeline(event, enrichment_context)
        decision = pipeline_result["decision"]
        rule_hits = pipeline_result["rule_hits"]

        transaction = create_transaction_record(db, transaction_payload, decision)

        event_record.status = models.IngestedEventStatus.PROCESSED.value
        event_record.processed_transaction_id = transaction.id
        event_record.processed_at = datetime.datetime.utcnow()
        db.commit()

        if rule_hits:
            persist_rule_hits(db, event_record.id, transaction.id, rule_hits)
            create_alert_from_event(db, event_record, transaction, rule_hits)
        persist_automated_action(db, event_record.id, transaction.id, decision)
        record_event_snapshot(db, event_record, transaction, enrichment_context, decision, rule_hits)
        update_event_metrics(db, transaction)

        return schemas.IngestTransactionResponse(
            event_id=event.event_id,
            status=event_record.status,
            transaction_id=transaction.id,
            message="Transaction ingested and processed"
        )
    except Exception as exc:
        db.rollback()
        event_record.status = models.IngestedEventStatus.FAILED.value
        event_record.processing_error = str(exc)
        event_record.processed_at = datetime.datetime.utcnow()
        db.add(event_record)
        db.commit()
        raise

