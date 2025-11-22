from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, database
from services.transaction_service import create_transaction_record

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/transactions/", response_model=schemas.TransactionWithRisk)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    return create_transaction_record(db, transaction)


def _update_transaction_status(transaction_id: int, new_status: str, db: Session, require_status: str | None = None):
    transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if require_status and transaction.status != require_status:
        raise HTTPException(
            status_code=400,
            detail=f"Transaction must be {require_status} before performing this action"
        )
    
    if transaction.status == new_status:
        return transaction
    
    transaction.status = new_status
    db.commit()
    db.refresh(transaction)
    return transaction


@router.post("/transactions/{transaction_id}/approve", response_model=schemas.TransactionWithRisk)
def approve_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """
    Force-approve a transaction (used for manual review override)
    """
    return _update_transaction_status(transaction_id, "ALLOW", db)


@router.post("/transactions/{transaction_id}/unblock", response_model=schemas.TransactionWithRisk)
def unblock_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """
    Unblock a previously blocked transaction after manual verification
    """
    return _update_transaction_status(transaction_id, "ALLOW", db, require_status="BLOCK")


@router.get("/transactions/", response_model=list[schemas.TransactionWithRisk])
def get_transactions(
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    min_amount: float = None,
    max_amount: float = None,
    user_id: str = None,
    merchant: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Transaction)
    
    if status:
        query = query.filter(models.Transaction.status == status)
    if min_amount:
        query = query.filter(models.Transaction.amount >= min_amount)
    if max_amount:
        query = query.filter(models.Transaction.amount <= max_amount)
    if user_id:
        query = query.filter(models.Transaction.user_id.contains(user_id))
    if merchant:
        query = query.filter(models.Transaction.merchant.contains(merchant))
        
    return query.order_by(models.Transaction.timestamp.desc()).offset(skip).limit(limit).all()
