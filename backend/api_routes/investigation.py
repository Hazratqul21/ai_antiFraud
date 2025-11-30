from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, case
from typing import List, Optional
import models, database
import datetime

router = APIRouter(prefix="/investigation", tags=["Investigation"])


@router.get("/overview")
def get_investigation_overview(
    status: Optional[List[str]] = Query(None),
    urgency: Optional[List[str]] = Query(None),  
    assigned_to: Optional[List[str]] = Query(None),
    location: Optional[List[str]] = Query(None),
    merchant: Optional[List[str]] = Query(None),
    min_risk_score: Optional[float] = None,
    max_risk_score: Optional[float] = None,
    time_range: str = "24h",
    db: Session = Depends(database.get_db)
):
    """
    Multi-dimensional investigation dashboard with drill-down filtering
    Similar to Splunk fraud incident review
    """
    # Calculate time filter
    end_time = datetime.datetime.utcnow()
    if time_range == "1h":
        start_time = end_time - datetime.timedelta(hours=1)
    elif time_range == "6h":
        start_time = end_time - datetime.timedelta(hours=6)
    elif time_range == "24h":
        start_time = end_time - datetime.timedelta(hours=24)
    elif time_range == "7d":
        start_time = end_time - datetime.timedelta(days=7)
    else:
        start_time = end_time - datetime.timedelta(hours=24)
    
    # Build base query
    query = db.query(
        models.Transaction.id,
        models.Transaction.transaction_id,
        models.Transaction.user_id,
        models.Transaction.amount,
        models.Transaction.merchant,
        models.Transaction.location,
        models.Transaction.status,
        models.Transaction.timestamp,
        models.RiskScore.score.label('risk_score'),
        models.RiskScore.reason.label('risk_reason')
    ).join(
        models.RiskScore, 
        models.Transaction.id == models.RiskScore.transaction_id,
        isouter=True
    ).filter(
        models.Transaction.timestamp >= start_time
    )
    
    # Apply filters
    if status:
        query = query.filter(models.Transaction.status.in_(status))
    
    if location:
        query = query.filter(models.Transaction.location.in_(location))
    
    if merchant:
        query = query.filter(models.Transaction.merchant.in_(merchant))
    
    if min_risk_score is not None:
        query = query.filter(models.RiskScore.score >= min_risk_score)
    
    if max_risk_score is not None:
        query = query.filter(models.RiskScore.score <= max_risk_score)
    
    # Get total count before filters
    total_count = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.timestamp >= start_time
    ).scalar()
    
    # Execute filtered query
    results = query.order_by(models.Transaction.timestamp.desc()).limit(100).all()
    
    # Map urgency based on risk score
    def get_urgency(score):
        if score is None:
            return "info"
        if score >= 900:
            return "critical"
        elif score >= 750:
            return "high"
        elif score >= 500:
            return "medium"
        else:
            return "low"
    
    enriched_results = [
        {
            "id": r.id,
            "transaction_id": r.transaction_id,
            "user_id": r.user_id,
            "amount": float(r.amount),
            "merchant": r.merchant,
            "location": r.location,
            "status": r.status,
            "timestamp": r.timestamp,
            "risk_score": r.risk_score or 0,
            "risk_reason": r.risk_reason or "No assessment",
            "urgency": get_urgency(r.risk_score),
            "assigned_to": assigned_to[0] if assigned_to and len(assigned_to) > 0 else None
        }
        for r in results
    ]
    
    return {
        "total_events": total_count,
        "filtered_events": len(enriched_results),
        "matching_events": len(enriched_results),
        "time_range": time_range,
        "transactions": enriched_results
    }

@router.get("/filter-options")
def get_filter_options(time_range: str = "24h", db: Session = Depends(database.get_db)):
    """
    Get available filter options for multi-select dropdowns
    """
    end_time = datetime.datetime.utcnow()
    if time_range == "1h":
        start_time = end_time - datetime.timedelta(hours=1)
    elif time_range == "6h":
        start_time = end_time - datetime.timedelta(hours=6)
    elif time_range == "24h":
        start_time = end_time - datetime.timedelta(hours=24)
    elif time_range == "7d":
        start_time = end_time - datetime.timedelta(days=7)
    else:
        start_time = end_time - datetime.timedelta(hours=24)
    
    # Get distinct values for each filterable field
    statuses = db.query(
        models.Transaction.status,
        func.count(models.Transaction.id).label('count')
    ).filter(
        models.Transaction.timestamp >= start_time
    ).group_by(models.Transaction.status).all()
    
    locations = db.query(
        models.Transaction.location,
        func.count(models.Transaction.id).label('count')
    ).filter(
        models.Transaction.timestamp >= start_time
    ).group_by(models.Transaction.location).order_by(func.count(models.Transaction.id).desc()).limit(20).all()
    
    merchants = db.query(
        models.Transaction.merchant,
        func.count(models.Transaction.id).label('count')
    ).filter(
        models.Transaction.timestamp >= start_time
    ).group_by(models.Transaction.merchant).order_by(func.count(models.Transaction.id).desc()).limit(20).all()
    
    return {
        "statuses": [{"value": s.status, "count": s.count} for s in statuses],
        "locations": [{"value": l.location, "count": l.count} for l in locations],
        "merchants": [{"value": m.merchant, "count": m.count} for m in merchants],
        "urgency_levels": [
            {"value": "critical", "label": "Critical"},
            {"value": "high", "label": "High"},
            {"value": "medium", "label": "Medium"},
            {"value": "low", "label": "Low"},
            {"value": "info", "label": "Info"}
        ]
    }

@router.get("/heat-map")
def get_heat_map_data(
    dimension: str = "location",  # location, merchant, user_id
    time_range: str = "24h",
    db: Session = Depends(database.get_db)
):
    """
    Generate heat map data for visualization with gradient colors
    """
    end_time = datetime.datetime.utcnow()
    if time_range == "1h":
        start_time = end_time - datetime.timedelta(hours=1)
    elif time_range == "6h":
        start_time = end_time - datetime.timedelta(hours=6)
    elif time_range == "24h":
        start_time = end_time - datetime.timedelta(hours=24)
    elif time_range == "7d":
        start_time = end_time - datetime.timedelta(days=7)
    else:
        start_time = end_time - datetime.timedelta(hours=24)
    
    # Select dimension field
    if dimension == "location":
        field = models.Transaction.location
    elif dimension == "merchant":
        field = models.Transaction.merchant
    elif dimension == "user_id":
        field = models.Transaction.user_id
    else:
        field = models.Transaction.location
    
    # Aggregate data
    results = db.query(
        field.label('dimension_value'),
        func.count(models.Transaction.id).label('total'),
        func.sum(case((models.Transaction.status == 'BLOCK', 1), else_=0)).label('blocked'),
        func.sum(case((models.Transaction.status == 'ALLOW', 1), else_=0)).label('allowed'),
        func.avg(models.RiskScore.score).label('avg_risk_score')
    ).join(
        models.RiskScore,
        models.Transaction.id == models.RiskScore.transaction_id,
        isouter=True
    ).filter(
        models.Transaction.timestamp >= start_time
    ).group_by(field).order_by(func.count(models.Transaction.id).desc()).limit(50).all()
    
    # Calculate heat intensity and color
    max_total = max([r.total for r in results]) if results else 1
    
    heat_map_data = []
    for r in results:
        fraud_rate = (r.blocked / r.total) if r.total > 0 else 0
        intensity = (r.total / max_total) * 100
        
        # Determine color based on fraud rate
        if fraud_rate >= 0.5:
            color = "#DC4E41"  # Red
        elif fraud_rate >= 0.3:
            color = "#F1813F"  # Orange
        elif fraud_rate >= 0.1:
            color = "#F8BE34"  # Yellow
        else:
            color = "#53A051"  # Green
        
        heat_map_data.append({
            "value": r.dimension_value,
            "total": r.total,
            "blocked": r.blocked or 0,
            "allowed": r.allowed or 0,
            "fraud_rate": fraud_rate,
            "avg_risk_score": float(r.avg_risk_score or 0),
            "intensity": intensity,
            "color": color
        })
    
    return {
        "dimension": dimension,
        "time_range": time_range,
        "data": heat_map_data
    }
