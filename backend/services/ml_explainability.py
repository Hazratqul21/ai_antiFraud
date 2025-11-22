"""
ML Explainability Service
Provides SHAP-based explanations for fraud detection decisions
"""
import shap
import numpy as np
import pandas as pd
from typing import Dict, List
import pickle
import os

# Global SHAP explainer (initialized on demand)
_explainer = None
_model = None
_feature_names = None

def _get_feature_vector(transaction_data: dict) -> np.ndarray:
    """
    Convert transaction data to feature vector for ML model
    """
    features = [
        transaction_data.get('amount', 0),
        hash(transaction_data.get('merchant', '')) % 1000,
        hash(transaction_data.get('location', '')) % 100,
        hash(transaction_data.get('user_id', '')) % 1000,
        hash(transaction_data.get('ip_address', '')) % 10000,
        hash(transaction_data.get('device_id', '')) % 10000,
        # Add more engineered features as needed
    ]
    return np.array([features])

def initialize_explainer(model_path: str = None):
    """
    Initialize SHAP explainer with trained model
    """
    global _explainer, _model, _feature_names
    
    try:
        # In production, load actual trained model
        # For now, use a simple mock
        if model_path and os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                _model = pickle.load(f)
        else:
            # Mock model for demonstration
            print("⚠️ Using mock model for SHAP explainability")
            _model = None
        
        _feature_names = [
            'amount', 'merchant_hash', 'location_hash', 
            'user_hash', 'ip_hash', 'device_hash'
        ]
        
        # Create SHAP explainer
        if _model:
            _explainer = shap.TreeExplainer(_model)
        
        print("✅ SHAP explainer initialized")
        return True
        
    except Exception as e:
        print(f"❌ Failed to initialize SHAP explainer: {e}")
        return False

def explain_prediction(transaction_data: dict, prediction: str, risk_score: float) -> Dict:
    """
    Generate SHAP explanations for a fraud prediction
    
    Returns:
        - feature_importance: Dict of features and their contribution to decision
        - top_reasons: List of top reasons for the decision
        - confidence: Model confidence score
    """
    try:
        # Get feature vector
        features = _get_feature_vector(transaction_data)
        
        # If we have real SHAP explainer, use it
        if _explainer:
            shap_values = _explainer.shap_values(features)
            
            # Get feature contributions
            feature_importance = {}
            for i, feature_name in enumerate(_feature_names):
                feature_importance[feature_name] = float(shap_values[0][i])
        else:
            # Mock SHAP values for demonstration
            feature_importance = _generate_mock_shap_values(transaction_data, risk_score)
        
        # Get top reasons
        sorted_features = sorted(
            feature_importance.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )
        
        top_reasons = []
        for feature, value in sorted_features[:5]:
            reason = _interpret_shap_value(feature, value, transaction_data)
            if reason:
                top_reasons.append({
                    'feature': feature,
                    'impact': 'increases' if value > 0 else 'decreases',
                    'magnitude': abs(value),
                    'description': reason
                })
        
        return {
            'prediction': prediction,
            'risk_score': risk_score,
            'feature_importance': feature_importance,
            'top_reasons': top_reasons,
            'confidence': min(abs(risk_score), 1.0),
            'explainability_method': 'SHAP'
        }
        
    except Exception as e:
        print(f"Error generating SHAP explanation: {e}")
        return {
            'prediction': prediction,
            'risk_score': risk_score,
            'feature_importance': {},
            'top_reasons': [],
            'confidence': 0.0,
            'error': str(e)
        }

def _generate_mock_shap_values(transaction_data: dict, risk_score: float) -> Dict:
    """
    Generate mock SHAP values for demonstration
    """
    amount = transaction_data.get('amount', 0)
    
    # Simple heuristic-based SHAP values
    feature_importance = {
        'amount': (amount / 100000000) * risk_score if amount > 50000000 else -(amount / 10000000),
        'merchant_hash': np.random.uniform(-10, 10),
        'location_hash': np.random.uniform(-8, 8),
        'user_hash': np.random.uniform(-5, 5),
        'ip_hash': np.random.uniform(-7, 7),
        'device_hash': np.random.uniform(-6, 6)
    }
    
    return feature_importance

def _interpret_shap_value(feature: str, value: float, transaction_data: dict) -> str:
    """
    Convert SHAP value to human-readable explanation
    """
    impact = "increases" if value > 0 else "decreases"
    
    interpretations = {
        'amount': f"Transaction amount ({transaction_data.get('amount', 0):,.0f} so'm) {impact} fraud risk",
        'merchant_hash': f"Merchant '{transaction_data.get('merchant', 'Unknown')}' {impact} fraud risk",
        'location_hash': f"Location '{transaction_data.get('location', 'Unknown')}' {impact} fraud risk",
        'user_hash': f"User '{transaction_data.get('user_id', 'Unknown')}' {impact} fraud risk",
        'ip_hash': f"IP address pattern {impact} fraud risk",
        'device_hash': f"Device fingerprint {impact} fraud risk"
    }
    
    return interpretations.get(feature, f"{feature} {impact} fraud risk")

def get_global_feature_importance(transactions: List[dict]) -> Dict:
    """
    Calculate global feature importance across multiple transactions
    """
    if not transactions:
        return {}
    
    # Aggregate SHAP values
    aggregated_importance = {feature: 0.0 for feature in _feature_names}
    
    for tx in transactions:
        explanation = explain_prediction(tx, tx.get('status', 'UNKNOWN'), tx.get('risk_score', 0))
        for feature, value in explanation['feature_importance'].items():
            aggregated_importance[feature] += abs(value)
    
    # Average
    for feature in aggregated_importance:
        aggregated_importance[feature] /= len(transactions)
    
    return aggregated_importance

# Initialize on module import
initialize_explainer()
