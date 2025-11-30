#!/bin/bash
# 🚀 QUICK COMMANDS FOR LOGIN & DATABASE

echo "🎯 FraudGuard AI - Quick Commands"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1️⃣ VIEW ALL USERS IN DATABASE${NC}"
echo "   python view_users.py"
echo ""

echo -e "${BLUE}2️⃣ CREATE/UPDATE ADMIN USER${NC}"
echo "   python backend/create_user.py"
echo ""

echo -e "${BLUE}3️⃣ TEST LOGIN VIA API${NC}"
echo "   curl -X POST 'http://localhost:8000/auth/login' \\"
echo "     -H 'Content-Type: application/x-www-form-urlencoded' \\"
echo "     -d 'username=engineer&password=Xazrat571'"
echo ""

echo -e "${BLUE}4️⃣ START BACKEND${NC}"
echo "   .venv/bin/python -m uvicorn backend.main:app --reload"
echo ""

echo -e "${BLUE}5️⃣ START FRONTEND${NC}"
echo "   cd frontend && npm run dev"
echo ""

echo -e "${BLUE}6️⃣ LOGIN WEB INTERFACE${NC}"
echo "   URL: http://localhost:5173/login"
echo "   Username: engineer"
echo "   Password: Xazrat571"
echo ""

echo -e "${YELLOW}📊 LOGIN CREDENTIALS${NC}"
echo "   ├─ Username: engineer"
echo "   ├─ Password: Xazrat571"
echo "   ├─ Email: engineer@fraudguard.ai"
echo "   └─ Role: ADMIN"
echo ""

echo -e "${GREEN}✅ Ready to go!${NC}"
