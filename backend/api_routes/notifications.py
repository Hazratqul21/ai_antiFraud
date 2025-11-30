from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List
import models
from auth.dependencies import get_current_user
from database import get_db
from services.email_service import send_fraud_alert_email, send_daily_report_email
from services.telegram_service import send_fraud_alert_telegram, send_stats_update_telegram, test_telegram_connection

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class EmailRecipients(BaseModel):
    recipients: List[EmailStr]

class TelegramTestRequest(BaseModel):
    message: str = "Test message from FraudGuard AI"

@router.post("/test-email")
async def test_email_notification(
    data: EmailRecipients,
    current_user: models.User = Depends(get_current_user)
):
    """
    Send test email to verify configuration
    """
    test_transaction = {
        "transaction_id": "TEST-12345",
        "amount": 50000000,
        "user_id": "test_user",
        "merchant": "Test Merchant",
        "location": "Tashkent",
        "ip_address": "192.168.1.1",
        "timestamp": "2025-01-21 12:00:00"
    }
    
    result = await send_fraud_alert_email(
        recipients=data.recipients,
        transaction_data=test_transaction,
        risk_score=95.5
    )
    
    return {
        "success": result,
        "message": "Test email sent" if result else "Failed to send email"
    }

@router.post("/test-telegram")
async def test_telegram_notification(current_user: models.User = Depends(get_current_user)):
    """
    Test Telegram bot connection and send test message
    """
    result = await test_telegram_connection()
    return result

@router.post("/send-fraud-alert")
async def send_fraud_alert(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Send fraud alert for specific transaction via email and Telegram
    """
    # Get transaction
    transaction = db.query(models.Transaction).filter(
        models.Transaction.transaction_id == transaction_id
    ).first()
    
    if not transaction:
        return {"success": False, "error": "Transaction not found"}
    
    # Get risk score
    risk = db.query(models.RiskScore).filter(
        models.RiskScore.transaction_id == transaction.id
    ).first()
    
    risk_score = risk.score if risk else 0.0
    
    transaction_data = {
        "transaction_id": transaction.transaction_id,
        "amount": transaction.amount,
        "user_id": transaction.user_id,
        "merchant": transaction.merchant,
        "location": transaction.location,
        "ip_address": transaction.ip_address,
        "timestamp": str(transaction.timestamp)
    }
    
    # Send via Telegram
    telegram_result = await send_fraud_alert_telegram(transaction_data, risk_score)
    
    return {
        "success": telegram_result,
        "message": "Alerts sent successfully" if telegram_result else "Failed to send alerts"
    }

@router.get("/settings")
async def get_notification_settings(current_user: models.User = Depends(get_current_user)):
    """
    Get notification settings for current user
    """
    # In production, this would fetch from database
    return {
        "email_enabled": True,
        "telegram_enabled": True,
        "email_recipients": ["admin@example.com"],
        "alert_threshold": 80.0,
        "daily_report": True
    }

@router.post("/settings")
async def update_notification_settings(
    settings: dict,
    current_user: models.User = Depends(get_current_user)
):
    """
    Update notification settings
    """
    # In production, save to database
    return {
        "success": True,
        "settings": settings
    }
