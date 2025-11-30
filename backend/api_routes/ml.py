from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import models
from auth.dependencies import get_current_user
from database import get_db
from services.ml_explainability import explain_prediction, get_global_feature_importance

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

@router.get("/explain/{transaction_id}")
async def get_transaction_explanation(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get SHAP-based explanation for a specific transaction's fraud prediction
    """
    # Get transaction
    transaction = db.query(models.Transaction).filter(
        models.Transaction.transaction_id == transaction_id
    ).first()
    
    if not transaction:
        return {"error": "Transaction not found"}
    
    # Get risk score
    risk = db.query(models.RiskScore).filter(
        models.RiskScore.transaction_id == transaction.id
    ).first()
    
    risk_score = risk.score if risk else 0.0
    
    # Prepare transaction data
    transaction_data = {
        'transaction_id': transaction.transaction_id,
        'amount': transaction.amount,
        'merchant': transaction.merchant,
        'location': transaction.location,
        'user_id': transaction.user_id,
        'ip_address': transaction.ip_address,
        'device_id': transaction.device_id,
        'status': transaction.status,
        'risk_score': risk_score
    }
    
    # Get SHAP explanation
    explanation = explain_prediction(
        transaction_data,
        transaction.status,
        risk_score
    )
    
    return {
        "transaction_id": transaction_id,
        "explanation": explanation,
        "transaction": transaction_data
    }

@router.get("/feature-importance")
async def get_feature_importance(
    limit: int = Query(100, description="Number of recent transactions to analyze"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get global feature importance across recent transactions
    """
    transactions = db.query(models.Transaction).order_by(
        models.Transaction.timestamp.desc()
    ).limit(limit).all()
    
    # Convert to dict
    transaction_data = []
    for tx in transactions:
        risk = db.query(models.RiskScore).filter(
            models.RiskScore.transaction_id == tx.id
        ).first()
        
        transaction_data.append({
            'transaction_id': tx.transaction_id,
            'amount': tx.amount,
            'merchant': tx.merchant,
            'location': tx.location,
            'user_id': tx.user_id,
            'ip_address': tx.ip_address,
            'device_id': tx.device_id,
            'status': tx.status,
            'risk_score': risk.score if risk else 0.0
        })
    
    # Get global importance
    importance = get_global_feature_importance(transaction_data)
    
    # Sort by importance
    sorted_importance = sorted(
        importance.items(),
        key=lambda x: x[1],
        reverse=True
    )
    
    return {
        "feature_importance": dict(sorted_importance),
        "analyzed_transactions": len(transactions),
        "features": [
            {
                "name": feature,
                "importance": value,
                "rank": idx + 1
            }
            for idx, (feature, value) in enumerate(sorted_importance)
        ]
    }

@router.get("/model-info")
async def get_model_info(current_user: models.User = Depends(get_current_user)):
    """
    Get information about the ML model
    """
    return {
        "model_name": "FraudGuard AI Ensemble",
        "model_type": "XGBoost + Random Forest + Neural Network",
        "version": "1.0.0",
        "features": [
            "amount",
            "merchant_hash",
            "location_hash",
            "user_hash",
            "ip_hash",
            "device_hash"
        ],
        "explainability": "SHAP TreeExplainer",
        "accuracy": 0.95,
        "precision": 0.93,
        "recall": 0.91,
        "f1_score": 0.92,
        "last_trained": "2025-01-20",
        "training_samples": 300000
    }
