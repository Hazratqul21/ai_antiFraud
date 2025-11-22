"""
Advanced ML Engine for Fraud Detection
Supports ensemble predictions from XGBoost, LightGBM, and Random Forest
"""
import joblib
import numpy as np
import os
from typing import Dict

class MLEngine:
    def __init__(self):
        self.models_loaded = False
        self.use_ensemble = False
        
        # Try to load ensemble models
        try:
            model_dir = os.path.dirname(__file__)
            self.xgb_model = joblib.load(os.path.join(model_dir, "model_xgboost.pkl"))
            self.lgb_model = joblib.load(os.path.join(model_dir, "model_lightgbm.pkl"))
            self.rf_model = joblib.load(os.path.join(model_dir, "model_rf.pkl"))
            self.scaler = joblib.load(os.path.join(model_dir, "scaler.pkl"))
            self.feature_columns = joblib.load(os.path.join(model_dir, "feature_columns.pkl"))
            self.ensemble_config = joblib.load(os.path.join(model_dir, "ensemble_config.pkl"))
            
            self.models_loaded = True
            self.use_ensemble = True
            print("✓ Ensemble models loaded successfully!")
        except Exception as e:
            print(f"⚠ Ensemble models not found, using rule-based fallback: {e}")
            self.use_ensemble = False

    def extract_features(self, transaction_data: dict) -> np.ndarray:
        """Extract and engineer features from transaction data"""
        # Base features
        amount = transaction_data.get("amount", 0)
        
        # Time features (if available, otherwise use defaults)
        hour_of_day = transaction_data.get("hour_of_day", 12)
        day_of_week = transaction_data.get("day_of_week", 3)
        
        # Location features
        location = transaction_data.get("location", "")
        location_risk = 0  # Default: Home
        if "international" in location.lower() or "abroad" in location.lower():
            location_risk = 2
        elif location:
            location_risk = 1
            
        # Merchant features
        merchant = transaction_data.get("merchant", "")
        merchant_category = hash(merchant) % 11  # Simple hash to category
        merchant_risk_score = 0.3  # Default medium risk
        
        # User behavior (use defaults for now, in production these would come from user history)
        avg_transaction_amount = transaction_data.get("avg_transaction_amount", 500)
        transaction_frequency = transaction_data.get("transaction_frequency", 5)
        days_since_last_transaction = transaction_data.get("days_since_last_transaction", 1)
        
        # Device features
        device_id = transaction_data.get("device_id", "")
        device_change = transaction_data.get("device_change", 0)
        ip_address = transaction_data.get("ip_address", "")
        ip_change = transaction_data.get("ip_change", 0)
        
        # Derived features
        location_change_speed = transaction_data.get("location_change_speed", 0.5)
        is_night = 1 if hour_of_day < 6 or hour_of_day > 22 else 0
        is_weekend = 1 if day_of_week >= 5 else 0
        amount_deviation = abs(amount - avg_transaction_amount) / (avg_transaction_amount + 1)
        velocity_flag = 1 if transaction_frequency > 10 else 0
        
        # Create feature vector in the same order as training
        features = {
            'amount': amount,
            'hour_of_day': hour_of_day,
            'day_of_week': day_of_week,
            'location_risk': location_risk,
            'location_change_speed': location_change_speed,
            'merchant_category': merchant_category,
            'merchant_risk_score': merchant_risk_score,
            'avg_transaction_amount': avg_transaction_amount,
            'transaction_frequency': transaction_frequency,
            'days_since_last_transaction': days_since_last_transaction,
            'device_change': device_change,
            'ip_change': ip_change,
            'is_night': is_night,
            'is_weekend': is_weekend,
            'amount_deviation': amount_deviation,
            'velocity_flag': velocity_flag
        }
        
        # Return as array in correct order
        if self.use_ensemble:
            return np.array([[features[col] for col in self.feature_columns]])
        else:
            return features

    def predict_ensemble(self, features: np.ndarray) -> Dict:
        """Make ensemble prediction"""
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Get predictions from each model
        xgb_proba = self.xgb_model.predict_proba(features_scaled)[0, 1]
        lgb_proba = self.lgb_model.predict_proba(features_scaled)[0, 1]
        rf_proba = self.rf_model.predict_proba(features_scaled)[0, 1]
        
        # Weighted ensemble
        ensemble_proba = (
            self.ensemble_config['xgb_weight'] * xgb_proba +
            self.ensemble_config['lgb_weight'] * lgb_proba +
            self.ensemble_config['rf_weight'] * rf_proba
        )
        
        # Convert to score (0-1000)
        score = int(ensemble_proba * 1000)
        confidence = max(xgb_proba, lgb_proba, rf_proba)  # Use max as confidence
        
        # Determine reason
        if score > 800:
            reason = "High fraud probability (Ensemble ML)"
        elif score > 500:
            reason = "Medium fraud probability (Ensemble ML)"
        else:
            reason = "Low fraud probability (Ensemble ML)"
            
        return {
            "score": score,
            "confidence": float(confidence),
            "reason": reason,
            "model_details": {
                "xgb_probability": float(xgb_proba),
                "lgb_probability": float(lgb_proba),
                "rf_probability": float(rf_proba),
                "ensemble_probability": float(ensemble_proba)
            }
        }

    def predict_rule_based(self, features: dict) -> Dict:
        """Fallback rule-based prediction"""
        amount = features.get("amount", 0)
        
        if amount > 10000:
            return {"score": 900, "confidence": 0.95, "reason": "High Amount (Rule-based)"}
        elif amount > 5000:
            return {"score": 600, "confidence": 0.8, "reason": "Medium Amount (Rule-based)"}
        else:
            return {"score": np.random.randint(0, 100), "confidence": 0.9, "reason": "Normal Activity (Rule-based)"}

    def predict(self, transaction_data: dict) -> dict:
        """
        Main prediction method
        Returns a risk score (0-1000) and confidence (0.0-1.0)
        """
        features = self.extract_features(transaction_data)
        
        if self.use_ensemble:
            return self.predict_ensemble(features)
        else:
            return self.predict_rule_based(features)

# Global instance
ml_engine = MLEngine()
