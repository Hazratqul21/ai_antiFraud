from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
import models, database
import datetime

router = APIRouter()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/analytics/trends")
def get_trends(days: int = 7, db: Session = Depends(get_db)):
    # Get daily transaction volume and fraud count for the last N days
    end_date = datetime.datetime.utcnow()
    start_date = end_date - datetime.timedelta(days=days)
    
    # Group by date
    # Note: SQLite specific date function, might need adjustment for other DBs
    daily_stats = db.query(
        func.date(models.Transaction.timestamp).label('date'),
        func.count(models.Transaction.id).label('total'),
        func.sum(models.Transaction.amount).label('volume'),
        func.sum(case((models.Transaction.status == 'BLOCK', 1), else_=0)).label('fraud_count')
    ).filter(
        models.Transaction.timestamp >= start_date
    ).group_by(
        func.date(models.Transaction.timestamp)
    ).all()
    
    detailed_stats = [
        {
            "date": str(stat.date),
            "total": stat.total,
            "volume": stat.volume or 0,
            "fraud_count": stat.fraud_count or 0
        }
        for stat in daily_stats
    ]
    
    return {
        "success": True,
        "data": detailed_stats
    }

@router.get("/network-graph")
async def get_transaction_network(
    limit: int = Query(100, description="Number of transactions to include"),
    db: Session = Depends(get_db)
):
    """
    Get transaction network graph data for visualization
    """
    from services.network_analysis import build_transaction_network
    
    network_data = build_transaction_network(db, limit)
    
    return {
        "success": True,
        "data": network_data
    }

@router.get("/fraud-patterns-3d")
async def get_fraud_patterns_3d(
    limit: int = Query(200, description="Number of data points"),
    db: Session = Depends(get_db)
):
    """
    Get 3D fraud pattern data (Amount vs Time vs Risk)
    """
    from services.network_analysis import get_fraud_pattern_3d
    
    pattern_data = get_fraud_pattern_3d(db, limit)
    
    return {
        "success": True,
        "data": pattern_data
    }

@router.get("/analytics/fraud-distribution")
def get_fraud_distribution(db: Session = Depends(get_db)):
    # Fraud by location
    location_stats = db.query(
        models.Transaction.location,
        func.count(models.Transaction.id).label('count')
    ).filter(
        models.Transaction.status == 'BLOCK'
    ).group_by(
        models.Transaction.location
    ).limit(5).all()
    
    # Fraud by merchant
    merchant_stats = db.query(
        models.Transaction.merchant,
        func.count(models.Transaction.id).label('count')
    ).filter(
        models.Transaction.status == 'BLOCK'
    ).group_by(
        models.Transaction.merchant
    ).limit(5).all()
    
    return {
        "by_location": [{"name": s.location, "value": s.count} for s in location_stats],
        "by_merchant": [{"name": s.merchant, "value": s.count} for s in merchant_stats]
    }

@router.get("/analytics/location-heatmap")
def get_location_heatmap(db: Session = Depends(get_db)):
    # Get transaction counts and fraud rates by location
    location_stats = db.query(
        models.Transaction.location,
        func.count(models.Transaction.id).label('total'),
        func.sum(case((models.Transaction.status == 'BLOCK', 1), else_=0)).label('blocked'),
        func.sum(case((models.Transaction.status == 'ALLOW', 1), else_=0)).label('approved'),
        func.sum(case((models.Transaction.status == 'CHALLENGE', 1), else_=0)).label('challenged')
    ).group_by(
        models.Transaction.location
    ).all()
    
    return [
        {
            "location": stat.location,
            "total": stat.total,
            "blocked": stat.blocked or 0,
            "approved": stat.approved or 0,
            "challenged": stat.challenged or 0,
            "fraud_rate": (stat.blocked / stat.total) if stat.total > 0 else 0,
            "intensity": min(stat.total / 10, 100)  # Scale for visual intensity
        }
        for stat in location_stats
    ]

@router.get("/analytics/location/{location}/detail")
def get_location_detail(location: str, time_range: str = "24h", db: Session = Depends(get_db)):
    # Calculate time filter based on range
    end_time = datetime.datetime.utcnow()
    
    if time_range == "real_time" or time_range == "1h":
        start_time = end_time - datetime.timedelta(hours=1)
    elif time_range == "6h":
        start_time = end_time - datetime.timedelta(hours=6)
    elif time_range == "24h":
        start_time = end_time - datetime.timedelta(hours=24)
    else:
        start_time = end_time - datetime.timedelta(hours=24)
    
    # Get transaction stats for this location in the time range
    stats = db.query(
        func.count(models.Transaction.id).label('total'),
        func.sum(case((models.Transaction.status == 'BLOCK', 1), else_=0)).label('blocked'),
        func.sum(case((models.Transaction.status == 'ALLOW', 1), else_=0)).label('approved'),
        func.sum(case((models.Transaction.status == 'CHALLENGE', 1), else_=0)).label('challenged'),
        func.sum(models.Transaction.amount).label('total_volume')
    ).filter(
        models.Transaction.location == location,
        models.Transaction.timestamp >= start_time
    ).first()
    
    # Get recent transactions
    recent_txs = db.query(models.Transaction).filter(
        models.Transaction.location == location,
        models.Transaction.timestamp >= start_time
    ).order_by(models.Transaction.timestamp.desc()).limit(10).all()
    
    return {
        "location": location,
        "time_range": time_range,
        "start_time": start_time,
        "end_time": end_time,
        "stats": {
            "total": stats.total or 0,
            "blocked": stats.blocked or 0,
            "approved": stats.approved or 0,
            "challenged": stats.challenged or 0,
            "total_volume": float(stats.total_volume or 0),
            "fraud_rate": (stats.blocked / stats.total) if stats.total > 0 else 0
        },
        "recent_transactions": [
            {
                "id": tx.transaction_id,
                "amount": tx.amount,
                "status": tx.status,
                "timestamp": tx.timestamp,
                "merchant": tx.merchant
            }
            for tx in recent_txs
        ]
    }
