# ML Model Training Commands
# Barcha ML modellarni o'qitish uchun buyruqlar

# 1. Backend papkasiga o'tish
cd backend

# 2. Virtual environment aktivlashtirish
source venv/bin/activate

# 3. Ilg'or ML modellarni o'qitish (XGBoost, LightGBM, Random Forest)
# Bu 50,000 ta synthetic tranzaksiya yaratadi va 3 ta modelni o'qitadi
# Kutish vaqti: 2-5 daqiqa (kompyuter quvvatiga bog'liq)
python train_advanced_model.py

# Natija: Quyidagi fayllar yaratiladi:
# - model_xgboost.pkl (XGBoost model)
# - model_lightgbm.pkl (LightGBM model)
# - model_rf.pkl (Random Forest model)
# - scaler.pkl (Feature scaler)
# - feature_columns.pkl (Feature names)
# - ensemble_config.pkl (Ensemble weights)

# 4. Backend serverni ishga tushirish
uvicorn main:app --reload --port 8000

# 5. Yangi terminalda frontend ishga tushirish
cd ../frontend
npm run dev

# 6. Test tranzaksiya yuborish (yangi terminalda)
curl -X POST "http://127.0.0.1:8000/transactions/" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "tx_high_risk",
    "user_id": "user_999",
    "amount": 25000,
    "currency": "USD",
    "merchant": "UnknownStore",
    "ip_address": "203.0.113.1",
    "location": "International",
    "device_id": "new_device_123"
  }'

# Kutilayotgan natija:
# {
#   "status": "BLOCK",
#   "risk_score": {
#     "score": 850-950,
#     "confidence": 0.85-0.95,
#     "reason": "High fraud probability (Ensemble ML)",
#     "model_details": {
#       "xgb_probability": 0.85+,
#       "lgb_probability": 0.83+,
#       "rf_probability": 0.80+
#     }
#   }
# }
