from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import database
from services.analytics_service import analytics_service

router = APIRouter(prefix="/event-analysis", tags=["Event Analysis & Mining"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/time-series")
def get_time_series(granularity: str = "hourly", days: int = 7, db: Session = Depends(get_db)):
    """
    Get time-series aggregated data for transactions
    granularity: hourly, daily, weekly
    days: number of days to analyze
    """
    return analytics_service.get_time_series_data(db, granularity, days)

@router.get("/patterns")
def get_patterns(min_support: int = 3, db: Session = Depends(get_db)):
    """
    Detect transaction patterns (frequent sequences)
    min_support: minimum frequency threshold
    """
    return analytics_service.get_pattern_sequences(db, min_support)

@router.get("/relationships")
def get_relationships(entity_type: str = "all", limit: int = 100, db: Session = Depends(get_db)):
    """
    Get graph-based entity relationships (user-merchant-device)
    Returns nodes and edges for graph visualization
    """
    return analytics_service.get_entity_relationships(db, entity_type, limit)

@router.get("/root-cause")
def get_root_cause(time_window_hours: int = 24, db: Session = Depends(get_db)):
    """
    Perform root cause analysis for fraud patterns
    Identifies common factors in blocked transactions
    """
    return analytics_service.get_root_cause_analysis(db, time_window_hours)
