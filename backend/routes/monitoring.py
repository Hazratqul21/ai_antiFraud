from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import database
from services.monitoring_service import monitoring_service

router = APIRouter(prefix="/monitoring", tags=["Monitoring & Feedback"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/model-performance")
def get_model_performance(days: int = 7, db: Session = Depends(get_db)):
    """
    Get model performance metrics (precision, recall, F1-score)
    """
    return monitoring_service.get_model_performance_metrics(db, days)

@router.get("/rule-triggers")
def get_rule_triggers(days: int = 7, db: Session = Depends(get_db)):
    """
    Get rule trigger statistics and effectiveness
    """
    return monitoring_service.get_rule_trigger_statistics(db, days)

@router.get("/analyst-decisions")
def get_analyst_decisions(days: int = 30, db: Session = Depends(get_db)):
    """
    Analyze analyst decision patterns and outcomes
    """
    return monitoring_service.get_analyst_decision_patterns(db, days)

@router.post("/feedback")
def submit_feedback(payload: dict, db: Session = Depends(get_db)):
    """
    Submit feedback for model retraining and rule updates
    """
    transaction_id = payload.get("transaction_id")
    feedback_type = payload.get("feedback_type")
    comments = payload.get("comments", "")
    
    return monitoring_service.submit_feedback(db, transaction_id, feedback_type, comments)
