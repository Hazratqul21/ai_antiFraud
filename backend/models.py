from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum

class TransactionStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CHALLENGED = "CHALLENGED"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True)
    user_id = Column(String, index=True)
    amount = Column(Float)
    currency = Column(String, default="USD")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    merchant = Column(String)
    ip_address = Column(String)
    location = Column(String)
    device_id = Column(String)
    
    status = Column(String, default=TransactionStatus.PENDING.value)
    
    risk_score = relationship("RiskScore", back_populates="transaction", uselist=False)
    ingested_events = relationship("IngestedEvent", back_populates="transaction")
    enriched_contexts = relationship("EnrichedEventContext", back_populates="transaction")
    rule_evaluations = relationship("RuleEvaluation", back_populates="transaction")
    automated_actions = relationship("AutomatedAction", back_populates="transaction")

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    score = Column(Float) # 0 to 1000
    confidence = Column(Float) # 0.0 to 1.0
    reason = Column(String) # e.g., "High Amount", "ML Prediction"
    
    transaction = relationship("Transaction", back_populates="risk_score")

class IngestedEventStatus(str, enum.Enum):
    RECEIVED = "RECEIVED"
    PROCESSING = "PROCESSING"
    PROCESSED = "PROCESSED"
    FAILED = "FAILED"

class IngestedEvent(Base):
    __tablename__ = "ingested_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String, unique=True, index=True, nullable=False)
    source_system = Column(String, nullable=False)
    channel = Column(String, nullable=True)
    priority = Column(String, default="normal")
    event_type = Column(String, nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(String, default=IngestedEventStatus.RECEIVED.value)
    processing_error = Column(Text, nullable=True)
    processed_transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    received_at = Column(DateTime, default=datetime.datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    transaction = relationship("Transaction", back_populates="ingested_events")
    enriched_context = relationship("EnrichedEventContext", back_populates="event", uselist=False)
    rule_evaluations = relationship("RuleEvaluation", back_populates="event")
    automated_actions = relationship("AutomatedAction", back_populates="event")
    event_snapshot = relationship("EventSnapshot", back_populates="event", uselist=False)


class EnrichedEventContext(Base):
    __tablename__ = "enriched_event_contexts"

    id = Column(Integer, primary_key=True, index=True)
    ingested_event_id = Column(Integer, ForeignKey("ingested_events.id"), unique=True, nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    geo_country = Column(String)
    geo_city = Column(String)
    geo_coordinates = Column(String)
    device_type = Column(String)
    device_risk_level = Column(String)
    ip_reputation = Column(String)
    ip_risk_score = Column(Float)
    user_segment = Column(String)
    signals = Column(JSON)
    derived_features = Column(JSON)
    explanations = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    event = relationship("IngestedEvent", back_populates="enriched_context")
    transaction = relationship("Transaction", back_populates="enriched_contexts", uselist=False)


class RuleEvaluation(Base):
    __tablename__ = "rule_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    ingested_event_id = Column(Integer, ForeignKey("ingested_events.id"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    rule_id = Column(String, nullable=False)
    rule_name = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    action = Column(String, nullable=False)
    reason = Column(Text)
    matched = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    event = relationship("IngestedEvent", back_populates="rule_evaluations")
    transaction = relationship("Transaction", back_populates="rule_evaluations")


class AutomatedAction(Base):
    __tablename__ = "automated_actions"

    id = Column(Integer, primary_key=True, index=True)
    ingested_event_id = Column(Integer, ForeignKey("ingested_events.id"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    action_type = Column(String, nullable=False)
    status = Column(String, default="QUEUED")
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    event = relationship("IngestedEvent", back_populates="automated_actions")
    transaction = relationship("Transaction", back_populates="automated_actions")


class EventSnapshot(Base):
    __tablename__ = "event_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    ingested_event_id = Column(Integer, ForeignKey("ingested_events.id"), unique=True, nullable=False)
    event_id = Column(String, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    transaction_status = Column(String)
    risk_score = Column(Float)
    amount = Column(Float)
    currency = Column(String)
    geo_country = Column(String)
    device_type = Column(String)
    ip_reputation = Column(String)
    rule_action = Column(String)
    rule_ids = Column(JSON)
    metrics = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    event = relationship("IngestedEvent", back_populates="event_snapshot")
    transaction = relationship("Transaction")


class EventMetric(Base):
    __tablename__ = "event_metrics"

    id = Column(Integer, primary_key=True, index=True)
    metric_date = Column(DateTime, index=True)
    total_events = Column(Integer, default=0)
    blocked_events = Column(Integer, default=0)
    challenged_events = Column(Integer, default=0)
    allowed_events = Column(Integer, default=0)
    avg_amount = Column(Float, default=0.0)
    avg_risk_score = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class AlertStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    ingested_event_id = Column(Integer, ForeignKey("ingested_events.id"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    severity = Column(String, nullable=False)
    status = Column(String, default=AlertStatus.OPEN.value)
    assigned_to = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    event = relationship("IngestedEvent")
    transaction = relationship("Transaction")


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False)
    analyst = Column(String, nullable=True)
    conclusion = Column(Text, nullable=True)
    resolution = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    alert = relationship("Alert")


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    ANALYST = "ANALYST"
    VIEWER = "VIEWER"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default=UserRole.ANALYST.value)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    mfa_secret = Column(String, nullable=True)  # For 2FA
    mfa_enabled = Column(Integer, default=0)

