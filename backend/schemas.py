from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TransactionBase(BaseModel):
    transaction_id: str
    user_id: str
    amount: float
    currency: str = "USD"
    merchant: str
    ip_address: str
    location: str
    device_id: str
    timestamp: Optional[datetime] = None
    avg_transaction_amount: Optional[float] = None
    transaction_frequency: Optional[int] = None
    days_since_last_transaction: Optional[int] = None
    device_change: Optional[int] = 0
    ip_change: Optional[int] = 0
    location_change_speed: Optional[float] = None
    velocity_flag: Optional[int] = 0
    metadata: Optional[dict] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    status: str
    
    class Config:
        orm_mode = True

class RiskScoreResponse(BaseModel):
    score: float
    confidence: float
    reason: str
    
    class Config:
        orm_mode = True

class TransactionWithRisk(TransactionResponse):
    risk_score: Optional[RiskScoreResponse] = None

class TransactionEvent(BaseModel):
    event_id: str
    source_system: str
    channel: Optional[str] = None
    priority: Optional[str] = "normal"
    ingestion_timestamp: Optional[datetime] = None
    transaction: TransactionCreate

class IngestTransactionResponse(BaseModel):
    event_id: str
    status: str
    transaction_id: Optional[int] = None
    message: str


class EnrichedContextResponse(BaseModel):
    geo_country: Optional[str]
    geo_city: Optional[str]
    device_type: Optional[str]
    device_risk_level: Optional[str]
    ip_reputation: Optional[str]
    ip_risk_score: Optional[float]
    user_segment: Optional[str]
    signals: dict
    derived_features: dict
    explanations: dict
