from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import database
import schemas
import models
from services.alert_service import list_alerts, update_alert_status
from services.case_service import open_case_for_alert, resolve_case, list_cases

router = APIRouter(prefix="/cockpit", tags=["Real-Time Cockpit"])




@router.get("/alerts")
def get_alerts(status: str | None = None, limit: int = 50, db: Session = Depends(database.get_db)):
    alerts = list_alerts(db, status, limit)
    return [
        {
            "id": alert.id,
            "transaction_id": alert.transaction_id,
            "severity": alert.severity,
            "status": alert.status,
            "assigned_to": alert.assigned_to,
            "notes": alert.notes,
            "created_at": alert.created_at,
        }
        for alert in alerts
    ]


@router.post("/alerts/{alert_id}/assign")
def assign_alert(alert_id: int, payload: dict, db: Session = Depends(database.get_db)):
    analyst = payload.get("analyst")
    if not analyst:
        raise HTTPException(status_code=400, detail="analyst is required")
    alert = update_alert_status(db, alert_id, models.AlertStatus.IN_PROGRESS.value, analyst=analyst)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    case = open_case_for_alert(db, alert.id, analyst)
    return {"alert": alert.id, "case_id": case.id}


@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, payload: dict, db: Session = Depends(database.get_db)):
    resolution = payload.get("resolution")
    conclusion = payload.get("conclusion", "")
    if not resolution:
        raise HTTPException(status_code=400, detail="resolution is required")
    alert = update_alert_status(db, alert_id, models.AlertStatus.RESOLVED.value, notes=conclusion)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"status": alert.status}


@router.get("/cases")
def get_cases(analyst: str | None = None, limit: int = 20, db: Session = Depends(database.get_db)):
    cases = list_cases(db, analyst, limit)
    return [
        {
            "id": case.id,
            "alert_id": case.alert_id,
            "analyst": case.analyst,
            "resolution": case.resolution,
            "conclusion": case.conclusion,
            "updated_at": case.updated_at,
        }
        for case in cases
    ]



