from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case
from typing import List, Optional
import models, database
import datetime

router = APIRouter(prefix="/web-traffic", tags=["Web Traffic Analysis"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/overview")
def get_web_traffic_overview(time_range: str = "24h", db: Session = Depends(get_db)):
    """
    Get overall web traffic statistics
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
    
    total_events = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.timestamp >= start_time
    ).scalar()
    
    return {
        "total_events": total_events,
        "time_range": time_range
    }

@router.get("/by-location")
def get_traffic_by_location(
    time_range: str = "24h",
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Traffic analysis by location (Countries/Cities)
    Similar to Splunk's country/region breakdown
    """
    end_time =datetime.datetime.utcnow()
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
    
    results = db.query(
        models.Transaction.location,
        func.count(models.Transaction.id).label('events'),
        func.count(func.distinct(models.Transaction.user_id)).label('users'),
        func.sum(models.Transaction.amount).label('volume')
    ).filter(
        models.Transaction.timestamp >= start_time
    ).group_by(models.Transaction.location).order_by(
        func.count(models.Transaction.id).desc()
    ).limit(limit).all()
    
    return [
        {
            "location": r.location,
            "events": r.events,
            "users": r.users,
            "volume": float(r.volume or 0)
        }
        for r in results
    ]

@router.get("/by-ip")
def get_traffic_by_ip(
    time_range: str = "24h",
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Traffic analysis by IP address
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
    
    results = db.query(
        models.Transaction.ip_address,
        models.Transaction.location,
        func.count(models.Transaction.id).label('events'),
        func.count(func.distinct(models.Transaction.user_id)).label('users'),
        func.count(func.distinct(models.Transaction.device_id)).label('devices'),
        func.sum(models.Transaction.amount).label('volume')
    ).filter(
        models.Transaction.timestamp >= start_time
    ).group_by(
        models.Transaction.ip_address,
        models.Transaction.location
    ).order_by(
        func.count(models.Transaction.id).desc()
    ).limit(limit).all()
    
    return [
        {
            "ip_address": r.ip_address,
            "location": r.location,
            "events": r.events,
            "users": r.users,
            "devices": r.devices,
            "volume": float(r.volume or 0)
        }
        for r in results
    ]

@router.get("/by-user")
def get_traffic_by_user(
    time_range: str = "24h",
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Traffic analysis by user/username
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
    
    results = db.query(
        models.Transaction.user_id,
        func.count(models.Transaction.id).label('events'),
        func.count(func.distinct(models.Transaction.location)).label('locations'),
        func.count(func.distinct(models.Transaction.ip_address)).label('ips'),
        func.sum(models.Transaction.amount).label('volume')
    ).filter(
        models.Transaction.timestamp >= start_time
    ).group_by(models.Transaction.user_id).order_by(
        func.count(models.Transaction.id).desc()
    ).limit(limit).all()
    
    return [
        {
            "user_id": r.user_id,
            "events": r.events,
            "locations": r.locations,
            "ips": r.ips,
            "volume": float(r.volume or 0)
        }
        for r in results
    ]

@router.get("/by-merchant")
def get_traffic_by_merchant(
    time_range: str = "24h",
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Traffic analysis by merchant
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
    
    results = db.query(
        models.Transaction.merchant,
        func.count(models.Transaction.id).label('events'),
        func.count(func.distinct(models.Transaction.user_id)).label('users'),
        func.sum(models.Transaction.amount).label('volume'),
        func.sum(case((models.Transaction.status == 'BLOCK', 1), else_=0)).label('blocked')
    ).filter(
        models.Transaction.timestamp >= start_time
    ).group_by(models.Transaction.merchant).order_by(
        func.count(models.Transaction.id).desc()
    ).limit(limit).all()
    
    return [
        {
            "merchant": r.merchant,
            "events": r.events,
            "users": r.users,
            "volume": float(r.volume or 0),
            "blocked": r.blocked or 0,
            "block_rate": (r.blocked / r.events) if r.events > 0 else 0
        }
        for r in results
    ]

@router.get("/by-device")
def get_traffic_by_device(
    time_range: str = "24h",
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Traffic analysis by device ID
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
    
    results = db.query(
        models.Transaction.device_id,
        func.count(models.Transaction.id).label('events'),
        func.count(func.distinct(models.Transaction.user_id)).label('users'),
        func.sum(models.Transaction.amount).label('volume')
    ).filter(
        models.Transaction.timestamp >= start_time
    ).group_by(models.Transaction.device_id).order_by(
        func.count(models.Transaction.id).desc()
    ).limit(limit).all()
    
    return [
        {
            "device_id": r.device_id,
            "events": r.events,
            "users": r.users,
            "volume": float(r.volume or 0)
        }
        for r in results
    ]

@router.get("/status-breakdown")
def get_status_breakdown(
    time_range: str = "24h",
    db: Session = Depends(get_db)
):
    """
    Transaction status breakdown (similar to HTTP status in Splunk)
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
    
    results = db.query(
        models.Transaction.status,
        func.count(models.Transaction.id).label('events')
    ).filter(
        models.Transaction.timestamp >= start_time
    ).group_by(models.Transaction.status).all()
    
    return [
        {
            "status": r.status,
            "events": r.events
        }
        for r in results
    ]
