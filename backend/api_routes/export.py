from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from auth.dependencies import get_current_user
from database import get_db
from services.pdf_service import generate_fraud_report_pdf, generate_transaction_export_pdf
from services.excel_service import generate_transaction_excel, generate_analytics_excel
from datetime import datetime, timedelta

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/pdf/report")
async def export_fraud_report_pdf(
    days: int = Query(7, description="Number of days to include in report"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Export fraud detection report as PDF
    """
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get statistics
    total_transactions = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.timestamp >= start_date
    ).scalar()
    
    blocked = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.status == "BLOCK",
        models.Transaction.timestamp >= start_date
    ).scalar()
    
    challenged = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.status == "CHALLENGE",
        models.Transaction.timestamp >= start_date
    ).scalar()
    
    allowed = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.status == "ALLOW",
        models.Transaction.timestamp >= start_date
    ).scalar()
    
    total_volume = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.timestamp >= start_date
    ).scalar() or 0
    
    fraud_rate = (blocked / total_transactions * 100) if total_transactions > 0 else 0
    
    # Get top fraud locations
    top_locations = db.query(
        models.Transaction.location,
        func.count(models.Transaction.id).label('count')
    ).filter(
        models.Transaction.status == "BLOCK",
        models.Transaction.timestamp >= start_date
    ).group_by(
        models.Transaction.location
    ).order_by(
        func.count(models.Transaction.id).desc()
    ).limit(10).all()
    
    locations_data = [{
        'location': loc[0],
        'count': loc[1],
        'fraud_rate': 100.0  # Simplified
    } for loc in top_locations]
    
    report_data = {
        'total_transactions': total_transactions,
        'blocked': blocked,
        'challenged': challenged,
        'allowed': allowed,
        'total_volume': total_volume,
        'fraud_rate': fraud_rate,
        'top_locations': locations_data,
        'period_days': days
    }
    
    # Generate PDF
    pdf_buffer = generate_fraud_report_pdf(report_data)
    
    filename = f"fraud_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/pdf/transactions")
async def export_transactions_pdf(
    limit: int = Query(50, description="Number of transactions to export"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Export transaction list as PDF
    """
    transactions = db.query(models.Transaction).order_by(
        models.Transaction.timestamp.desc()
    ).limit(limit).all()
    
    pdf_buffer = generate_transaction_export_pdf(transactions)
    
    filename = f"transactions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/excel/transactions")
async def export_transactions_excel(
    limit: int = Query(1000, description="Number of transactions to export"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Export transaction list as Excel
    """
    transactions = db.query(models.Transaction).order_by(
        models.Transaction.timestamp.desc()
    ).limit(limit).all()
    
    excel_buffer = generate_transaction_excel(transactions)
    
    filename = f"transactions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/excel/analytics")
async def export_analytics_excel(
    days: int = Query(7),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Export analytics data as multi-sheet Excel
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get analytics data (similar to PDF report)
    total_transactions = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.timestamp >= start_date
    ).scalar()
    
    blocked = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.status == "BLOCK",
        models.Transaction.timestamp >= start_date
    ).scalar()
    
    analytics_data = {
        'total_transactions': total_transactions,
        'blocked': blocked,
        'challenged': 0,
        'allowed': total_transactions - blocked,
        'fraud_rate': (blocked / total_transactions * 100) if total_transactions > 0 else 0,
        'total_volume': 0,
        'by_location': []
    }
    
    excel_buffer = generate_analytics_excel(analytics_data)
    
    filename = f"analytics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
