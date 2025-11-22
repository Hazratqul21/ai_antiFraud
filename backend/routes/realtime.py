from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, database
from websocket_manager import manager
import json
import asyncio

router = APIRouter(prefix="/realtime", tags=["Real-time"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates
    Clients connect here to receive live transaction and alert updates
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Echo back or handle client messages
            if message.get("type") == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@router.get("/stream-stats")
async def get_streaming_stats(db: Session = Depends(get_db)):
    """
    Get current stats for real-time dashboard
    This endpoint is called periodically or via WebSocket
    """
    total = db.query(func.count(models.Transaction.id)).scalar()
    blocked = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.status == "BLOCK"
    ).scalar()
    challenged = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.status == "CHALLENGE"
    ).scalar()
    allowed = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.status == "ALLOW"
    ).scalar()
    
    fraud_rate = (blocked / total * 100) if total > 0 else 0
    
    return {
        "total": total,
        "blocked": blocked,
        "challenged": challenged,
        "allowed": allowed,
        "fraud_rate": fraud_rate
    }

async def broadcast_new_transaction(transaction_data: dict):
    """
    Helper function to broadcast new transaction to all connected clients
    Called after a new transaction is created
    """
    await manager.broadcast_transaction(transaction_data)

async def broadcast_fraud_alert(alert_data: dict):
    """
    Helper function to broadcast fraud alert
    Called when high-risk transaction detected
    """
    await manager.broadcast_alert(alert_data)
