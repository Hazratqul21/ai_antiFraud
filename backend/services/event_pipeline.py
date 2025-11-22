from typing import Dict, Any, List
import datetime
from sqlalchemy.orm import Session

import models
import schemas
from services.rule_engine import evaluate_rules, decide_action


def run_processing_pipeline(event: schemas.TransactionEvent, enrichment_context: Dict[str, Any]) -> Dict[str, Any]:
    transaction_dict = event.transaction.model_dump()
    rule_hits = evaluate_rules(transaction_dict, enrichment_context)
    decision = decide_action(rule_hits)
    return {
        "rule_hits": rule_hits,
        "decision": decision,
    }


def persist_rule_hits(db: Session, ingested_event_id: int, transaction_id: int, hits: List[Dict[str, Any]]):
    for hit in hits:
        evaluation = models.RuleEvaluation(
            ingested_event_id=ingested_event_id,
            transaction_id=transaction_id,
            rule_id=hit["rule_id"],
            rule_name=hit["rule_name"],
            severity=hit["severity"],
            action=hit["action"],
            reason=hit["reason"],
            matched=1,
            created_at=datetime.datetime.utcnow()
        )
        db.add(evaluation)
    db.commit()


def persist_automated_action(db: Session, ingested_event_id: int, transaction_id: int, decision: Dict[str, Any]):
    if decision.get("action") in ("CHALLENGE", "BLOCK"):
        action = models.AutomatedAction(
            ingested_event_id=ingested_event_id,
            transaction_id=transaction_id,
            action_type=decision["action"],
            status="EXECUTED",
            details={
                "reason": decision.get("reason"),
                "triggered_rules": decision.get("triggered_rules", []),
            },
            created_at=datetime.datetime.utcnow(),
            processed_at=datetime.datetime.utcnow()
        )
        db.add(action)
        db.commit()

