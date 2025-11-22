from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database
import schemas
from services.event_ingestor import ingest_transaction_event

router = APIRouter(prefix="/ingest", tags=["Ingestion"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/transaction", response_model=schemas.IngestTransactionResponse)
def ingest_transaction(event: schemas.TransactionEvent, db: Session = Depends(get_db)):
    try:
        return ingest_transaction_event(db, event)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

