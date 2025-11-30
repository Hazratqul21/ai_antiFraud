#!/bin/bash

# AI Anti-Fraud Platform - Backend va Frontend ishga tushirish

echo "🚀 AI Anti-Fraud Platform ishga tushirilmoqda..."

# Backend setup
echo "📦 Backend dependencies o'rnatilmoqda..."
cd /home/ali/AIAnti-FraudPlatform

# Virtual environment yaratish
if [ ! -d ".venv" ]; then
    echo "Virtual environment yaratilmoqda..."
    python3 -m venv .venv
fi

# Virtual environment faollashtirish
source .venv/bin/activate

# Dependencies o'rnatish
echo "Dependencies o'rnatilmoqda..."
pip install --upgrade pip --quiet
pip install pydantic==2.10.6 pydantic-core==2.27.2 pydantic-settings==2.7.0 --quiet
pip install fastapi-mail==1.4.1 --quiet
pip install python-jose[cryptography] passlib[bcrypt] slowapi --quiet
pip install fastapi==0.115.11 uvicorn==0.32.0 sqlalchemy --quiet
pip install scikit-learn pandas numpy python-multipart --quiet

echo "✅ Dependencies o'rnatildi!"

# Backend ishga tushirish (background)
echo "🔧 Backend ishga tushirilmoqda..."
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Frontend allaqachon ishlamoqda, faqat status ko'rsatamiz
echo "✅ Frontend allaqachon http://localhost:5173 da ishlamoqda"
echo "✅ Backend http://localhost:8000 da ishga tushdi (PID: $BACKEND_PID)"
echo ""
echo "🎉 Platform tayyor!"
echo "📱 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:8000"
echo "👤 Login: engineer / Xazrat571"
echo ""
echo "Backend to'xtatish uchun: kill $BACKEND_PID"
