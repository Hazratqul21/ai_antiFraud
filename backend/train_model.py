import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import random

def generate_synthetic_data(n_samples=10000):
    np.random.seed(42)
    
    # Features
    amounts = []
    currencies = [] # 0: USD, 1: EUR, 2: Other
    merchants = [] # 0: Known, 1: Unknown/HighRisk
    locations = [] # 0: Home, 1: Abroad
    
    # Target
    is_fraud = []
    
    for _ in range(n_samples):
        fraud = 0
        
        # Amount distribution
        if random.random() < 0.05: # 5% chance of high amount
            amount = random.uniform(5000, 20000)
        else:
            amount = random.uniform(10, 1000)
            
        # Location
        location = 0 if random.random() < 0.9 else 1
        
        # Merchant
        merchant = 0 if random.random() < 0.8 else 1
        
        # Fraud logic (synthetic patterns)
        # High amount + Abroad = High Fraud Risk
        if amount > 5000 and location == 1:
            fraud = 1 if random.random() < 0.8 else 0
        # High amount + Unknown Merchant = Medium Fraud Risk
        elif amount > 5000 and merchant == 1:
            fraud = 1 if random.random() < 0.6 else 0
        # Low amount + Abroad + Unknown Merchant = Low Fraud Risk
        elif amount < 1000 and location == 1 and merchant == 1:
            fraud = 1 if random.random() < 0.3 else 0
        # Random fraud
        elif random.random() < 0.01:
            fraud = 1
            
        amounts.append(amount)
        locations.append(location)
        merchants.append(merchant)
        is_fraud.append(fraud)
        
    df = pd.DataFrame({
        "amount": amounts,
        "location_code": locations,
        "merchant_code": merchants,
        "is_fraud": is_fraud
    })
    
    return df

def train():
    print("Generating synthetic data...")
    df = generate_synthetic_data()
    
    X = df[["amount", "location_code", "merchant_code"]]
    y = df["is_fraud"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest model...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = clf.predict(X_test)
    print(classification_report(y_test, y_pred))
    
    print("Saving model to model.pkl...")
    joblib.dump(clf, "model.pkl")
    print("Done.")

if __name__ == "__main__":
    train()
