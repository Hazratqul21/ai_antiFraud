#!/bin/bash

# AI Anti-Fraud Platform - Complete Setup Script
# This script sets up both backend and frontend

echo "=================================================="
echo "AI Anti-Fraud Platform - Setup Script"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend Setup
echo -e "\n${BLUE}[1/5] Setting up Backend...${NC}"
cd backend

echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Train ML Models
echo -e "\n${BLUE}[2/5] Training ML Models...${NC}"
echo "This may take 2-5 minutes depending on your machine..."
python train_advanced_model.py

echo -e "${GREEN}✓ ML models trained and saved${NC}"

# Frontend Setup
echo -e "\n${BLUE}[3/5] Setting up Frontend...${NC}"
cd ../frontend

echo "Installing Node dependencies..."
npm install

echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Create run scripts
echo -e "\n${BLUE}[4/5] Creating run scripts...${NC}"
cd ..

# Backend run script
cat > run_backend.sh << 'EOF'
#!/bin/bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
EOF
chmod +x run_backend.sh

# Frontend run script
cat > run_frontend.sh << 'EOF'
#!/bin/bash
cd frontend
npm run dev
EOF
chmod +x run_frontend.sh

# Combined run script
cat > run_all.sh << 'EOF'
#!/bin/bash
echo "Starting AI Anti-Fraud Platform..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""

# Start backend in background
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF
chmod +x run_all.sh

echo -e "${GREEN}✓ Run scripts created${NC}"

# Summary
echo -e "\n${BLUE}[5/5] Setup Complete!${NC}"
echo "=================================================="
echo -e "${GREEN}✓ All components installed successfully${NC}"
echo "=================================================="
echo ""
echo "To start the platform:"
echo "  1. Backend only:  ./run_backend.sh"
echo "  2. Frontend only: ./run_frontend.sh"
echo "  3. Both servers:  ./run_all.sh"
echo ""
echo "URLs:"
echo "  Backend API:  http://localhost:8000"
echo "  Frontend UI:  http://localhost:5173"
echo "  API Docs:     http://localhost:8000/docs"
echo ""
echo "=================================================="
