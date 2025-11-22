"""
Email Notification Service
Sends email alerts for high-risk transactions
"""
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from typing import List
import os

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "fraudguard@example.com"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "your-password"),
    MAIL_FROM = os.getenv("MAIL_FROM", "fraudguard@example.com"),
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

fast_mail = FastMail(conf)

async def send_fraud_alert_email(
    recipients: List[str],
    transaction_data: dict,
    risk_score: float
):
    """
    Send email alert for high-risk transaction
    """
    html_content = f"""
    <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
                .container {{ background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }}
                .alert {{ background-color: #fee; border-left: 4px solid #f44; padding: 15px; margin: 20px 0; }}
                .details {{ background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                .detail-row {{ margin: 10px 0; }}
                .label {{ font-weight: bold; color: #555; }}
                .value {{ color: #333; }}
                .risk-high {{ color: #f44; font-weight: bold; font-size: 24px; }}
                .footer {{ text-align: center; color: #888; font-size: 12px; margin-top: 30px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚨 Fraud Alert</h1>
                    <p>High-Risk Transaction Detected</p>
                </div>
                
                <div class="alert">
                    <h2>⚠️ Immediate Action Required</h2>
                    <p>A transaction with high fraud risk has been detected and requires your review.</p>
                </div>
                
                <div class="details">
                    <h3>Transaction Details</h3>
                    <div class="detail-row">
                        <span class="label">Transaction ID:</span>
                        <span class="value">{transaction_data.get('transaction_id', 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Amount:</span>
                        <span class="value">{transaction_data.get('amount', 0):,.2f} so'm</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">User:</span>
                        <span class="value">{transaction_data.get('user_id', 'Unknown')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Merchant:</span>
                        <span class="value">{transaction_data.get('merchant', 'Unknown')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Location:</span>
                        <span class="value">{transaction_data.get('location', 'Unknown')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">IP Address:</span>
                        <span class="value">{transaction_data.get('ip_address', 'Unknown')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Risk Score:</span>
                        <span class="risk-high">{risk_score:.1f}%</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin: 25px 0;">
                    <a href="http://localhost:5173" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Review in Dashboard
                    </a>
                </div>
                
                <div class="footer">
                    <p>This is an automated alert from FraudGuard AI Anti-Fraud Platform</p>
                    <p>AI Foundry powered by School21</p>
                </div>
            </div>
        </body>
    </html>
    """
    
    message = MessageSchema(
        subject=f"🚨 Fraud Alert - High Risk Transaction ({transaction_data.get('transaction_id', 'Unknown')})",
        recipients=recipients,
        body=html_content,
        subtype="html"
    )
    
    try:
        await fast_mail.send_message(message)
        print(f"✅ Fraud alert email sent to {recipients}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False

async def send_daily_report_email(recipients: List[str], report_data: dict):
    """
    Send daily fraud detection summary report
    """
    html_content = f"""
    <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
                .container {{ background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }}
                .stats {{ display: flex; justify-content: space-around; margin: 25px 0; }}
                .stat-box {{ text-align: center; padding: 15px; background-color: #f9f9f9; border-radius: 8px; flex: 1; margin: 0 10px; }}
                .stat-value {{ font-size: 32px; font-weight: bold; color: #667eea; }}
                .stat-label {{ color: #666; margin-top: 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📊 Daily Fraud Detection Report</h1>
                    <p>{report_data.get('date', 'Today')}</p>
                </div>
                
                <div class="stats">
                    <div class="stat-box">
                        <div class="stat-value">{report_data.get('total_transactions', 0):,}</div>
                        <div class="stat-label">Total Transactions</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" style="color: #f44;">{report_data.get('blocked', 0):,}</div>
                        <div class="stat-label">Blocked</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" style="color: #fa0;">{report_data.get('fraud_rate', 0):.1f}%</div>
                        <div class="stat-label">Fraud Rate</div>
                    </div>
                </div>
                
                <p style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:5173" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Full Report
                    </a>
                </p>
            </div>
        </body>
    </html>
    """
    
    message = MessageSchema(
        subject=f"📊 Daily Fraud Detection Report - {report_data.get('date', 'Today')}",
        recipients=recipients,
        body=html_content,
        subtype="html"
    )
    
    try:
        await fast_mail.send_message(message)
        print(f"✅ Daily report sent to {recipients}")
        return True
    except Exception as e:
        print(f"❌ Failed to send report: {e}")
        return False
