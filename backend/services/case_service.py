import datetime
from sqlalchemy.orm import Session
import models


def open_case_for_alert(db: Session, alert_id: int, analyst: str) -> models.Case:
    case = models.Case(
        alert_id=alert_id,
        analyst=analyst,
        created_at=datetime.datetime.utcnow()
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


def resolve_case(db: Session, case_id: int, resolution: str, conclusion: str):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        return None
    case.resolution = resolution
    case.conclusion = conclusion
    case.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(case)
    return case


def list_cases(db: Session, analyst: str | None = None, limit: int = 50):
    query = db.query(models.Case).order_by(models.Case.updated_at.desc())
    if analyst:
        query = query.filter(models.Case.analyst == analyst)
    return query.limit(limit).all()

