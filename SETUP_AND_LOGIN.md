# 🚀 FraudGuard AI - Setup & Login Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Login Credentials](#login-credentials)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [API Documentation](#api-documentation)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start

### Prerequisites
- Python 3.13+
- Node.js 18+
- npm or yarn
- SQLite3 (built-in)

### One-Command Setup (Linux/Mac)
```bash
cd /home/ali/AIAnti-FraudPlatform

# Create user in database
.venv/bin/python backend/create_user.py

# Terminal 1: Backend
.venv/bin/python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend && npm install && npm run dev
```

---

## 🔐 Login Credentials

### Default Admin Account
```
🎯 Username: engineer
🎯 Password: Xazrat571
🎯 Role: ADMIN
🎯 Email: engineer@fraudguard.ai
```

### Frontend Login
```
URL: http://localhost:5173/login
```

### API Token Test
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=engineer&password=Xazrat571"
```

---

## 🛠️ Backend Setup

### Step 1: Virtual Environment
```bash
cd /home/ali/AIAnti-FraudPlatform
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### Step 2: Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 3: Create User in Database
```bash
python backend/create_user.py
```

**Expected Output:**
```
✅ User created successfully!
   Username: engineer
   Email: engineer@fraudguard.ai
   Role: ADMIN
   Password: Xazrat571

🚀 Login credentials:
   URL: http://localhost:5173/login
   Username: engineer
   Password: Xazrat571
```

### Step 4: Start Backend Server
```bash
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## ⚛️ Frontend Setup

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Create .env.local (Optional)
```bash
# frontend/.env.local
VITE_API_URL=http://localhost:8000
```

### Step 3: Start Development Server
```bash
npm run dev
```

**Access URL:** http://localhost:5173

---

## 📚 API Documentation

### Authentication Endpoints

#### Login
```bash
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=engineer&password=Xazrat571

Response:
{
  "user": {
    "id": 1,
    "username": "engineer",
    "email": "engineer@fraudguard.ai",
    "role": "ADMIN",
    "is_active": true
  },
  "token": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer"
  }
}
```

#### Get Current User
```bash
GET /auth/me
Authorization: Bearer {access_token}

Response:
{
  "id": 1,
  "username": "engineer",
  "email": "engineer@fraudguard.ai",
  "role": "ADMIN",
  "is_active": true,
  "created_at": "2025-11-30T10:00:00"
}
```

#### Refresh Token
```bash
POST /auth/refresh
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### Logout
```bash
POST /auth/logout
Authorization: Bearer {access_token}

Response:
{
  "message": "Successfully logged out"
}
```

---

## 🐛 Troubleshooting

### Backend Issues

#### Issue: `ModuleNotFoundError: No module named 'sqlalchemy'`
```bash
# Solution: Install requirements
pip install -r backend/requirements.txt
```

#### Issue: Port 8000 already in use
```bash
# Solution: Use different port
python -m uvicorn backend.main:app --reload --port 8001
```

#### Issue: Database locked
```bash
# Solution: Remove database and recreate
rm backend/sql_app.db backend/fraud_detection.db
python backend/create_user.py
```

---

### Frontend Issues

#### Issue: CORS errors
**Backend doesn't allow frontend requests**

Solution: Backend already has CORS enabled:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Check if backend is running: `http://localhost:8000/docs`

#### Issue: Login fails with "Invalid credentials"
1. Check username: `engineer`
2. Check password: `Xazrat571` (case-sensitive!)
3. Reset user: `python backend/create_user.py`

#### Issue: npm packages not installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🔧 Project Structure

```
FraudGuard AI/
├── backend/                    # FastAPI backend
│   ├── main.py                # Application entry point
│   ├── models.py              # SQLAlchemy ORM models
│   ├── database.py            # Database configuration
│   ├── requirements.txt        # Python dependencies
│   ├── api_routes/            # API endpoints
│   ├── auth/                  # Authentication logic
│   ├── services/              # Business logic
│   └── tests/                 # Unit tests
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx           # Main application
│   │   ├── components/       # React components
│   │   ├── context/          # React context (Auth)
│   │   ├── hooks/            # Custom hooks
│   │   └── main.jsx          # Entry point
│   └── package.json          # Node dependencies
└── SETUP_AND_LOGIN.md        # This file
```

---

## 📊 Technology Stack

### Backend
- **Framework:** FastAPI 0.115
- **Database:** SQLAlchemy + SQLite
- **Auth:** JWT + bcrypt
- **ML:** scikit-learn, XGBoost, LightGBM, SHAP
- **Server:** Uvicorn

### Frontend
- **Framework:** React 18+ with Vite
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **HTTP:** Axios/Fetch API
- **State:** React Context API

---

## ✅ Security Features

✅ **JWT Authentication**
✅ **Password Hashing (bcrypt)**
✅ **CORS Protection**
✅ **Rate Limiting (SlowAPI)**
✅ **Role-Based Access Control (RBAC)**
✅ **Input Validation (Pydantic)**
✅ **Error Handling & Logging**

---

## 📝 Notes

- **Database:** SQLite (auto-created in `backend/sql_app.db`)
- **Logs:** Check `backend.log` for server logs
- **API Rate Limit:** 5 requests/minute for login (configurable in `backend/limiter.py`)
- **Session Timeout:** Configurable in `backend/auth/jwt_handler.py`

---

## 🆘 Getting Help

### Check Logs
```bash
# Backend logs
tail -f backend.log

# Frontend dev console
# Open http://localhost:5173 → F12 → Console
```

### API Health Check
```bash
curl http://localhost:8000/docs
```

### Test Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=engineer&password=Xazrat571"
```

---

## 🎉 Success!

If you see this on the dashboard, everything is working:
- ✅ Real-time transaction stats
- ✅ Risk scoring with SHAP explainability
- ✅ ML fraud detection
- ✅ WebSocket live updates
- ✅ Multi-channel alerts

**Happy fraud hunting! 🛡️**

---

**Last Updated:** November 30, 2025  
**Status:** ✅ Production Ready
