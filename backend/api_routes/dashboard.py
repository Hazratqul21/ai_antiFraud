from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, database, schemas

router = APIRouter()


@router.get("/dashboard/stats")
def get_stats(db: Session = Depends(database.get_db)):
    total_transactions = db.query(models.Transaction).count()
    blocked_transactions = db.query(models.Transaction).filter(models.Transaction.status == models.TransactionStatus.BLOCKED.value).count()
    challenged_transactions = db.query(models.Transaction).filter(models.Transaction.status == models.TransactionStatus.CHALLENGED.value).count()
    approved_transactions = db.query(models.Transaction).filter(models.Transaction.status == models.TransactionStatus.APPROVED.value).count()
    pending_transactions = db.query(models.Transaction).filter(models.Transaction.status == models.TransactionStatus.PENDING.value).count()
    
    fraud_rate = (blocked_transactions / total_transactions) if total_transactions > 0 else 0
    approval_rate = (approved_transactions / total_transactions) if total_transactions > 0 else 0
    review_rate = (challenged_transactions / total_transactions) if total_transactions > 0 else 0
    
    return {
        "total_transactions": total_transactions,
        "blocked_transactions": blocked_transactions,
        "challenged_transactions": challenged_transactions,
        "approved_transactions": approved_transactions,
        "pending_transactions": pending_transactions,
        "fraud_rate": fraud_rate,
        "approval_rate": approval_rate,
        "review_rate": review_rate
    }

@router.get("/dashboard/recent", response_model=list[schemas.TransactionWithRisk])
def get_recent_transactions(limit: int = 10, db: Session = Depends(database.get_db)):
    return db.query(models.Transaction).order_by(models.Transaction.timestamp.desc()).limit(limit).all()
