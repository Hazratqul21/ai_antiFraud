import datetime
from sqlalchemy.orm import Session
import models
import schemas
import ml_engine


def create_transaction_record(db: Session, transaction: schemas.TransactionCreate, decision: dict | None = None) -> models.Transaction:
    """
    Encapsulates the core transaction + risk creation logic so it can be reused
    by both API routes and ingestion adapters.
    """
    db_transaction = models.Transaction(
        transaction_id=transaction.transaction_id,
        user_id=transaction.user_id,
        amount=transaction.amount,
        currency=transaction.currency,
        merchant=transaction.merchant,
        ip_address=transaction.ip_address,
        location=transaction.location,
        device_id=transaction.device_id,
        timestamp=transaction.timestamp or datetime.datetime.utcnow(),
        status="PENDING"
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    risk_result = ml_engine.ml_engine.predict(transaction.dict())

    db_risk = models.RiskScore(
        transaction_id=db_transaction.id,
        score=risk_result["score"],
        confidence=risk_result["confidence"],
        reason=risk_result["reason"]
    )
    db.add(db_risk)

    if decision and decision.get("status_override"):
        db_transaction.status = decision["status_override"]
    else:
        if risk_result["score"] > 800:
            db_transaction.status = "BLOCK"
        elif risk_result["score"] > 500:
            db_transaction.status = "CHALLENGE"
        else:
            db_transaction.status = "ALLOW"

    db.commit()
    db.refresh(db_transaction)
    return db_transaction

