# AI Anti-Fraud Platform - Installation Guide

## O'zbekcha Ko'rsatmalar

### 1. Loyihani Yangi Kompyuterga Ko'chirish

```bash
# Loyihani zip qilish (hozirgi kompyuterda)
cd /home/ali
zip -r AIAnti-FraudPlatform.zip AIAnti-FraudPlatform/

# Yangi kompyuterga ko'chirib, ochish
unzip AIAnti-FraudPlatform.zip
cd AIAnti-FraudPlatform
```

### 2. Avtomatik O'rnatish (Tavsiya etiladi)

```bash
# Barcha kutubxonalarni o'rnatish va ML modellarni o'qitish
chmod +x setup.sh
./setup.sh
```

Bu script:
- Python virtual environment yaratadi
- Barcha Python kutubxonalarni o'rnatadi
- ML modellarni o'qitadi (2-5 daqiqa)
- Frontend kutubxonalarini o'rnatadi
- Ishga tushirish scriptlarini yaratadi

### 3. Qo'lda O'rnatish

Agar avtomatik script ishlamasa:

#### Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python train_advanced_model.py
```

#### Frontend:
```bash
cd frontend
npm install
```

### 4. Ishga Tushirish

#### Variant 1: Ikkalasini birga
```bash
./run_all.sh
```

#### Variant 2: Alohida
```bash
# Terminal 1 - Backend
./run_backend.sh

# Terminal 2 - Frontend
./run_frontend.sh
```

### 5. Tekshirish

Browser ochib quyidagi manzilga kiring:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 6. Test Tranzaksiya Yuborish

```bash
curl -X POST "http://127.0.0.1:8000/transactions/" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "test_001",
    "user_id": "user_123",
    "amount": 15000,
    "currency": "USD",
    "merchant": "TestStore",
    "ip_address": "192.168.1.1",
    "location": "Tashkent, Uzbekistan",
    "device_id": "device_001"
  }'
```

---

## English Instructions

### 1. Transfer Project to New Computer

```bash
# Zip the project (on current computer)
cd /home/ali
zip -r AIAnti-FraudPlatform.zip AIAnti-FraudPlatform/

# Transfer and unzip on new computer
unzip AIAnti-FraudPlatform.zip
cd AIAnti-FraudPlatform
```

### 2. Automatic Installation (Recommended)

```bash
# Install all dependencies and train ML models
chmod +x setup.sh
./setup.sh
```

This script will:
- Create Python virtual environment
- Install all Python dependencies
- Train ML models (2-5 minutes)
- Install frontend dependencies
- Create run scripts

### 3. Manual Installation

If automatic script doesn't work:

#### Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python train_advanced_model.py
```

#### Frontend:
```bash
cd frontend
npm install
```

### 4. Running the Platform

#### Option 1: Both servers together
```bash
./run_all.sh
```

#### Option 2: Separately
```bash
# Terminal 1 - Backend
./run_backend.sh

# Terminal 2 - Frontend
./run_frontend.sh
```

### 5. Verification

Open browser and navigate to:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 6. Send Test Transaction

```bash
curl -X POST "http://127.0.0.1:8000/transactions/" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "test_001",
    "user_id": "user_123",
    "amount": 15000,
    "currency": "USD",
    "merchant": "TestStore",
    "ip_address": "192.168.1.1",
    "location": "New York, USA",
    "device_id": "device_001"
  }'
```

---

## Troubleshooting / Muammolarni Hal Qilish

### Python kutubxonalari o'rnatilmayapti
```bash
# pip ni yangilang
pip install --upgrade pip

# Agar torch juda katta bo'lsa, CPU versiyasini o'rnating
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

### Port band
```bash
# Agar 8000 port band bo'lsa, boshqa portdan foydalaning
uvicorn main:app --reload --port 8001
```

### npm install sekin ishlayapti
```bash
# npm cache ni tozalang
npm cache clean --force
npm install
```

---

## System Requirements / Tizim Talablari

**Minimum:**
- CPU: 2 cores
- RAM: 4GB
- Disk: 2GB free space
- Python 3.8+
- Node.js 16+

**Recommended:**
- CPU: 4+ cores
- RAM: 8GB+
- Disk: 5GB free space
- Python 3.10+
- Node.js 18+
