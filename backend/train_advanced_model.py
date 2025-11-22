"""
Advanced ML Training Pipeline for Fraud Detection
Uses XGBoost, LightGBM, and ensemble methods to achieve 90%+ accuracy
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, roc_auc_score, precision_recall_curve
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
import xgboost as xgb
import lightgbm as lgb
import joblib
import random

def generate_advanced_synthetic_data(n_samples=50000):
    """Generate more realistic synthetic fraud data with complex patterns"""
    np.random.seed(42)
    random.seed(42)
    
    data = []
    
    for _ in range(n_samples):
        # Base features
        amount = np.random.lognormal(5, 2)  # More realistic amount distribution
        hour_of_day = random.randint(0, 23)
        day_of_week = random.randint(0, 6)
        
        # Location features
        location_risk = random.choice([0, 1, 2])  # 0: Home, 1: Domestic, 2: International
        location_change_speed = np.random.exponential(1)  # Speed of location change
        
        # Merchant features
        merchant_category = random.randint(0, 10)  # Different merchant types
        merchant_risk_score = random.random()
        
        # User behavior features
        avg_transaction_amount = np.random.lognormal(4, 1.5)
        transaction_frequency = np.random.poisson(5)  # Transactions per day
        days_since_last_transaction = np.random.exponential(2)
        
        # Device features
        device_change = random.choice([0, 1])  # New device?
        ip_change = random.choice([0, 1])  # New IP?
        
        # Time-based features
        is_night = 1 if hour_of_day < 6 or hour_of_day > 22 else 0
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # Derived features
        amount_deviation = abs(amount - avg_transaction_amount) / (avg_transaction_amount + 1)
        velocity_flag = 1 if transaction_frequency > 10 else 0
        
        # Complex fraud patterns
        fraud = 0
        fraud_score = 0
        
        # Pattern 1: High amount + International + Night time
        if amount > 5000 and location_risk == 2 and is_night:
            fraud_score += 0.7
            
        # Pattern 2: Rapid location change + Device change
        if location_change_speed > 3 and device_change:
            fraud_score += 0.6
            
        # Pattern 3: High merchant risk + IP change
        if merchant_risk_score > 0.7 and ip_change:
            fraud_score += 0.5
            
        # Pattern 4: Unusual amount for user
        if amount_deviation > 3:
            fraud_score += 0.4
            
        # Pattern 5: High velocity
        if velocity_flag and amount > 1000:
            fraud_score += 0.3
            
        # Pattern 6: Weekend + Night + High amount
        if is_weekend and is_night and amount > 3000:
            fraud_score += 0.4
            
        # Determine fraud based on score with some randomness
        if fraud_score > 0.8:
            fraud = 1 if random.random() < 0.95 else 0
        elif fraud_score > 0.5:
            fraud = 1 if random.random() < 0.7 else 0
        elif fraud_score > 0.3:
            fraud = 1 if random.random() < 0.4 else 0
        else:
            fraud = 1 if random.random() < 0.02 else 0  # Base fraud rate
            
        data.append({
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
            'velocity_flag': velocity_flag,
            'is_fraud': fraud
        })
    
    return pd.DataFrame(data)

def train_ensemble_model():
    """Train an ensemble of models for maximum accuracy"""
    print("=" * 60)
    print("ADVANCED FRAUD DETECTION ML PIPELINE")
    print("=" * 60)
    
    # Generate data
    print("\n[1/6] Generating advanced synthetic dataset...")
    df = generate_advanced_synthetic_data(50000)
    print(f"   Dataset size: {len(df)}")
    print(f"   Fraud rate: {df['is_fraud'].mean()*100:.2f}%")
    
    # Prepare features
    feature_cols = [col for col in df.columns if col != 'is_fraud']
    X = df[feature_cols]
    y = df['is_fraud']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Handle class imbalance with SMOTE
    print("\n[2/6] Applying SMOTE for class balancing...")
    smote = SMOTE(random_state=42)
    X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
    print(f"   Original training size: {len(X_train)}")
    print(f"   Balanced training size: {len(X_train_balanced)}")
    
    # Scale features
    print("\n[3/6] Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_balanced)
    X_test_scaled = scaler.transform(X_test)
    
    # Train XGBoost
    print("\n[4/6] Training XGBoost model...")
    xgb_model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=7,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric='logloss'
    )
    xgb_model.fit(X_train_scaled, y_train_balanced)
    xgb_pred = xgb_model.predict(X_test_scaled)
    xgb_proba = xgb_model.predict_proba(X_test_scaled)[:, 1]
    
    # Train LightGBM
    print("\n[5/6] Training LightGBM model...")
    lgb_model = lgb.LGBMClassifier(
        n_estimators=200,
        max_depth=7,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )
    lgb_model.fit(X_train_scaled, y_train_balanced)
    lgb_pred = lgb_model.predict(X_test_scaled)
    lgb_proba = lgb_model.predict_proba(X_test_scaled)[:, 1]
    
    # Train Random Forest
    print("\n[6/6] Training Random Forest model...")
    rf_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        random_state=42
    )
    rf_model.fit(X_train_scaled, y_train_balanced)
    rf_pred = rf_model.predict(X_test_scaled)
    rf_proba = rf_model.predict_proba(X_test_scaled)[:, 1]
    
    # Ensemble predictions (weighted average)
    print("\n" + "=" * 60)
    print("ENSEMBLE PREDICTION (Weighted Average)")
    print("=" * 60)
    ensemble_proba = (0.4 * xgb_proba + 0.4 * lgb_proba + 0.2 * rf_proba)
    ensemble_pred = (ensemble_proba > 0.5).astype(int)
    
    # Evaluation
    print("\n--- XGBoost Performance ---")
    print(classification_report(y_test, xgb_pred))
    print(f"ROC-AUC: {roc_auc_score(y_test, xgb_proba):.4f}")
    
    print("\n--- LightGBM Performance ---")
    print(classification_report(y_test, lgb_pred))
    print(f"ROC-AUC: {roc_auc_score(y_test, lgb_proba):.4f}")
    
    print("\n--- Random Forest Performance ---")
    print(classification_report(y_test, rf_pred))
    print(f"ROC-AUC: {roc_auc_score(y_test, rf_proba):.4f}")
    
    print("\n--- ENSEMBLE Performance ---")
    print(classification_report(y_test, ensemble_pred))
    print(f"ROC-AUC: {roc_auc_score(y_test, ensemble_proba):.4f}")
    
    # Save models
    print("\n" + "=" * 60)
    print("SAVING MODELS")
    print("=" * 60)
    joblib.dump(xgb_model, "model_xgboost.pkl")
    joblib.dump(lgb_model, "model_lightgbm.pkl")
    joblib.dump(rf_model, "model_rf.pkl")
    joblib.dump(scaler, "scaler.pkl")
    joblib.dump(feature_cols, "feature_columns.pkl")
    
    # Save ensemble weights
    ensemble_config = {
        'xgb_weight': 0.4,
        'lgb_weight': 0.4,
        'rf_weight': 0.2
    }
    joblib.dump(ensemble_config, "ensemble_config.pkl")
    
    print("✓ Saved: model_xgboost.pkl")
    print("✓ Saved: model_lightgbm.pkl")
    print("✓ Saved: model_rf.pkl")
    print("✓ Saved: scaler.pkl")
    print("✓ Saved: feature_columns.pkl")
    print("✓ Saved: ensemble_config.pkl")
    print("\n" + "=" * 60)
    print("TRAINING COMPLETE!")
    print("=" * 60)

if __name__ == "__main__":
    train_ensemble_model()
