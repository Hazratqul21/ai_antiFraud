from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models, database
from routes import transactions, dashboard, analytics, reports, ingestion, event_base, cockpit, event_analysis, monitoring, investigation, web_traffic, realtime, currency, auth, notifications, export as export_routes, ml

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="FraudGuard AI - Anti-Fraud Platform API",
    description="""
    🛡️ **FraudGuard AI** is an enterprise-grade fraud detection platform powered by advanced machine learning.
    
    ## Features
    * **Real-time Fraud Detection** - ML-powered transaction analysis
    * **SHAP Explainability** - Understand why transactions are flagged
    * **WebSocket Updates** - Live dashboard streaming
    * **Multi-channel Alerts** - Email & Telegram notifications
    * **Rich Analytics** - 3D visualizations, network graphs, heatmaps
    * **Export Capabilities** - PDF & Excel reports
    * **Role-based Access** - JWT authentication with RBAC
    
    ## Authentication
    Most endpoints require JWT authentication. Use `/auth/login` to obtain a token.
    
    **Built with ❤️ by AI Foundry - School21**
    """,
    version="2.0.0",
    contact={
        "name": "AI Foundry Team",
        "url": "https://school21.uz",
        "email": "support@fraudguard.ai"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    },
    openapi_tags=[
        {"name": "Dashboard", "description": "Main dashboard statistics and recent transactions"},
        {"name": "Transactions", "description": "Transaction management and operations"},
        {"name": "Analytics", "description": "Advanced analytics and visualizations"},
        {"name": "Reports", "description": "Report generation and export"},
        {"name": "Authentication", "description": "User authentication and authorization"},
        {"name": "Notifications", "description": "Email and Telegram alert system"},
        {"name": "Export", "description": "PDF and Excel export functionality"},
        {"name": "Machine Learning", "description": "ML model insights and SHAP explanations"},
        {"name": "Currency", "description": "Real-time currency exchange rates"},
        {"name": "Real-time", "description": "WebSocket streaming endpoints"},
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(reports.router)
app.include_router(ingestion.router)
app.include_router(event_base.router)
app.include_router(cockpit.router)
app.include_router(event_analysis.router)
app.include_router(monitoring.router)
app.include_router(investigation.router)
app.include_router(web_traffic.router)
app.include_router(realtime.router)
app.include_router(currency.router)
app.include_router(auth.router)
app.include_router(notifications.router)
app.include_router(export_routes.router)
app.include_router(ml.router)

@app.get("/")
def read_root():
    return {"message": "AI Anti-Fraud Platform API is running"}
