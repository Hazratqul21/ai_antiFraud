"""
Telegram Bot Notification Service
Sends alerts to Telegram channel/group
"""
import os
from telegram import Bot
from telegram.constants import ParseMode
import asyncio

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_BOT_TOKEN_HERE")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "YOUR_CHAT_ID_HERE")

# Initialize bot
bot = None
if TELEGRAM_BOT_TOKEN != "YOUR_BOT_TOKEN_HERE":
    bot = Bot(token=TELEGRAM_BOT_TOKEN)

async def send_fraud_alert_telegram(transaction_data: dict, risk_score: float):
    """
    Send fraud alert to Telegram channel
    """
    if not bot:
        print("⚠️ Telegram bot not configured")
        return False
    
    message = f"""
🚨 *FRAUD ALERT* 🚨

⚠️ High-risk transaction detected!

*Transaction Details:*
├ 🆔 ID: `{transaction_data.get('transaction_id', 'N/A')}`
├ 💰 Amount: *{transaction_data.get('amount', 0):,.0f} so'm*
├ 👤 User: `{transaction_data.get('user_id', 'Unknown')}`
├ 🏪 Merchant: `{transaction_data.get('merchant', 'Unknown')}`
├ 📍 Location: `{transaction_data.get('location', 'Unknown')}`
├ 🌐 IP: `{transaction_data.get('ip_address', 'Unknown')}`
└ 🎯 Risk Score: *{risk_score:.1f}%*

⏰ Time: {transaction_data.get('timestamp', 'N/A')}

🔗 [Review in Dashboard](http://localhost:5173)
    """
    
    try:
        await bot.send_message(
            chat_id=TELEGRAM_CHAT_ID,
            text=message,
            parse_mode=ParseMode.MARKDOWN
        )
        print(f"✅ Telegram alert sent for transaction {transaction_data.get('transaction_id')}")
        return True
    except Exception as e:
        print(f"❌ Failed to send Telegram alert: {e}")
        return False

async def send_stats_update_telegram(stats: dict):
    """
    Send statistics update to Telegram
    """
    if not bot:
        return False
    
    message = f"""
📊 *FraudGuard AI Stats Update*

🔢 Total Transactions: *{stats.get('total', 0):,}*
✅ Allowed: *{stats.get('allowed', 0):,}*
⚠️ Under Review: *{stats.get('challenged', 0):,}*
🚫 Blocked: *{stats.get('blocked', 0):,}*

📈 Fraud Rate: *{stats.get('fraud_rate', 0):.2f}%*

⏰ {stats.get('time', 'Now')}
    """
    
    try:
        await bot.send_message(
            chat_id=TELEGRAM_CHAT_ID,
            text=message,
            parse_mode=ParseMode.MARKDOWN
        )
        print("✅ Stats update sent to Telegram")
        return True
    except Exception as e:
        print(f"❌ Failed to send stats: {e}")
        return False

async def test_telegram_connection():
    """
    Test Telegram bot connection
    """
    if not bot:
        return {"success": False, "error": "Bot not configured"}
    
    try:
        me = await bot.get_me()
        await bot.send_message(
            chat_id=TELEGRAM_CHAT_ID,
            text=f"✅ *FraudGuard AI Bot Active*\n\nBot: @{me.username}\nReady to send alerts!",
            parse_mode=ParseMode.MARKDOWN
        )
        return {
            "success": True,
            "bot_username": me.username,
            "bot_name": me.first_name
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
