from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, database
import csv
import io
import datetime

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/reports/summary")
def get_report_summary(db: Session = Depends(get_db)):
    # Monthly stats (simplified for now, just total counts)
    total = db.query(models.Transaction).count()
    blocked = db.query(models.Transaction).filter(models.Transaction.status == "BLOCK").count()
    volume = db.query(func.sum(models.Transaction.amount)).scalar() or 0
    
    return {
        "generated_at": datetime.datetime.utcnow(),
        "period": "All Time",
        "total_transactions": total,
        "blocked_transactions": blocked,
        "total_volume": volume,
        "fraud_rate": (blocked / total) if total > 0 else 0
    }

@router.get("/reports/export")
def export_transactions(format: str = "csv", db: Session = Depends(get_db)):
    # Export all transactions
    transactions = db.query(models.Transaction).order_by(models.Transaction.timestamp.desc()).all()
    
    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(["ID", "User", "Amount", "Currency", "Merchant", "Status", "Timestamp", "Risk Score"])
        
        # Data
        for tx in transactions:
            writer.writerow([
                tx.transaction_id,
                tx.user_id,
                tx.amount,
                tx.currency,
                tx.merchant,
                tx.status,
                tx.timestamp,
                tx.risk_score.score if tx.risk_score else 0
            ])
            
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=transactions_report.csv"}
        )
    
    return {"error": "Unsupported format"}
