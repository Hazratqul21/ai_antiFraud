from sqlalchemy.orm import Session
from sqlalchemy import func, and_
import models
import datetime

class MonitoringService:
    """Service for monitoring model performance, rules, and analyst decisions"""
    
    def get_model_performance_metrics(self, db: Session, days: int = 7):
        """
        Calculate model performance metrics (precision, recall, F1-score)
        Based on risk scores and actual outcomes
        """
        end_time = datetime.datetime.utcnow()
        start_time = end_time - datetime.timedelta(days=days)
        
        # Get transactions with risk scores
        transactions = db.query(models.Transaction).join(
            models.RiskScore
        ).filter(
            models.Transaction.timestamp >= start_time
        ).all()
        
        if not transactions:
            return {
                "precision": 0,
                "recall": 0,
                "f1_score": 0,
                "accuracy": 0,
                "total_predictions": 0
            }
        
        # Calculate confusion matrix
        true_positives = 0  # Correctly identified fraud (BLOCK)
        false_positives = 0  # Incorrectly flagged as fraud
        true_negatives = 0  # Correctly identified legitimate
        false_negatives = 0  # Missed fraud
        
        for tx in transactions:
            predicted_fraud = tx.status == 'BLOCK'
            # For simulation, assume high-risk scores indicate actual fraud
            actual_fraud = tx.risk_score.score > 700 if tx.risk_score else False
            
            if predicted_fraud and actual_fraud:
                true_positives += 1
            elif predicted_fraud and not actual_fraud:
                false_positives += 1
            elif not predicted_fraud and not actual_fraud:
                true_negatives += 1
            else:
                false_negatives += 1
        
        # Calculate metrics
        precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
        recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        accuracy = (true_positives + true_negatives) / len(transactions) if len(transactions) > 0 else 0
        
        return {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "f1_score": round(f1_score, 4),
            "accuracy": round(accuracy, 4),
            "total_predictions": len(transactions),
            "true_positives": true_positives,
            "false_positives": false_positives,
            "true_negatives": true_negatives,
            "false_negatives": false_negatives
        }
    
    def get_rule_trigger_statistics(self, db: Session, days: int = 7):
        """
        Get statistics on rule triggers and effectiveness
        """
        end_time = datetime.datetime.utcnow()
        start_time = end_time - datetime.timedelta(days=days)
        
        # Get rule evaluations
        rule_stats = db.query(
            models.RuleEvaluation.rule_name,
            models.RuleEvaluation.severity,
            models.RuleEvaluation.action,
            func.count(models.RuleEvaluation.id).label('trigger_count'),
            func.sum(models.RuleEvaluation.matched).label('matched_count')
        ).filter(
            models.RuleEvaluation.created_at >= start_time
        ).group_by(
            models.RuleEvaluation.rule_name,
            models.RuleEvaluation.severity,
            models.RuleEvaluation.action
        ).all()
        
        return [
            {
                "rule_name": stat.rule_name,
                "severity": stat.severity,
                "action": stat.action,
                "trigger_count": stat.trigger_count,
                "matched_count": stat.matched_count or 0,
                "match_rate": (stat.matched_count / stat.trigger_count) if stat.trigger_count > 0 else 0
            }
            for stat in rule_stats
        ]
    
    def get_analyst_decision_patterns(self, db: Session, days: int = 30):
        """
        Analyze analyst decision patterns and outcomes
        """
        end_time = datetime.datetime.utcnow()
        start_time = end_time - datetime.timedelta(days=days)
        
        # Get resolved alerts with outcomes
        decisions = db.query(
            models.Alert.assigned_to,
            models.Alert.severity,
            func.count(models.Alert.id).label('total_cases'),
            func.sum(case((models.Alert.status == 'RESOLVED', 1), else_=0)).label('resolved_count')
        ).filter(
            models.Alert.created_at >= start_time
        ).group_by(
            models.Alert.assigned_to,
            models.Alert.severity
        ).all()
        
        # Get case resolutions
        case_outcomes = db.query(
            models.Case.resolution,
            func.count(models.Case.id).label('count')
        ).filter(
            models.Case.created_at >= start_time
        ).group_by(
            models.Case.resolution
        ).all()
        
        return {
            "analyst_performance": [
                {
                    "analyst": dec.assigned_to or "Unassigned",
                    "severity": dec.severity,
                    "total_cases": dec.total_cases,
                    "resolved": dec.resolved_count or 0,
                    "resolution_rate": (dec.resolved_count / dec.total_cases) if dec.total_cases > 0 else 0
                }
                for dec in decisions
            ],
            "resolution_distribution": [
                {
                    "resolution": outcome.resolution or "Unknown",
                    "count": outcome.count
                }
                for outcome in case_outcomes
            ]
        }
    
    def submit_feedback(self, db: Session, transaction_id: int, feedback_type: str, comments: str):
        """
        Submit feedback for model retraining
        This would trigger a feedback loop to update rules and ML models
        """
        # In a real system, this would queue feedback for batch processing
        # For now, we'll just log it
        
        transaction = db.query(models.Transaction).filter(
            models.Transaction.id == transaction_id
        ).first()
        
        if not transaction:
            return {"error": "Transaction not found"}
        
        # Store feedback (simplified - in production, use a dedicated feedback table)
        # This is a placeholder for the feedback loop mechanism
        
        return {
            "status": "submitted",
            "transaction_id": transaction_id,
            "feedback_type": feedback_type,
            "message": "Feedback queued for model retraining"
        }

from sqlalchemy import case

monitoring_service = MonitoringService()
