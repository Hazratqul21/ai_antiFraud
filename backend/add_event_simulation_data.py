"""
Simulation data generator for Event Analysis and Monitoring features
Adds sample ingested events, rule evaluations, and enriched contexts
"""
import sys
sys.path.append('/home/ali/AIAnti-FraudPlatform/backend')

from database import SessionLocal, engine
import models
import datetime
import random

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Get existing transactions
transactions = db.query(models.Transaction).limit(50).all()

if not transactions:
    print("No transactions found. Please run generate_simulation_data.py first")
    sys.exit(1)

print(f"Found {len(transactions)} transactions. Adding simulation data...")

# Create rule definitions
rule_templates = [
    {"rule_id": "R001", "name": "High Amount Single Transaction", "severity": "HIGH", "action": "BLOCK"},
    {"rule_id": "R002", "name": "Multiple Transactions Same Merchant", "severity": "MEDIUM", "action": "CHALLENGE"},
    {"rule_id": "R003", "name": "Unusual Location", "severity": "HIGH", "action": "BLOCK"},
    {"rule_id": "R004", "name": "New Device", "severity": "LOW", "action": "ALLOW"},
    {"rule_id": "R005", "name": "Velocity Check Failed", "severity": "HIGH", "action": "BLOCK"},
    {"rule_id": "R006", "name": "IP Reputation Low", "severity": "MEDIUM", "action": "CHALLENGE"},
]

# Generate data for each transaction
for idx, tx in enumerate(transactions):
    try:
        # 1. Create IngestedEvent
        event = models.IngestedEvent(
            event_id=f"EVT-{tx.transaction_id}",
            source_system="payment_gateway",
            channel="web" if idx % 3 == 0 else "mobile" if idx % 3 == 1 else "api",
            priority="high" if tx.status == "BLOCK" else "normal",
            event_type="transaction",
            payload={
                "transaction_id": tx.transaction_id,
                "amount": tx.amount,
                "currency": tx.currency,
                "merchant": tx.merchant
            },
            status="PROCESSED",
            processed_transaction_id=tx.id,
            received_at=tx.timestamp - datetime.timedelta(seconds=random.randint(1, 5)),
            processed_at=tx.timestamp
        )
        db.add(event)
        db.flush()
        
        # 2. Create EnrichedEventContext
        enriched = models.EnrichedEventContext(
            ingested_event_id=event.id,
            transaction_id=tx.id,
            geo_country="Uzbekistan",
            geo_city=tx.location,
            geo_coordinates=f"{random.uniform(39, 43)},{random.uniform(60, 73)}",
            device_type=random.choice(["mobile", "desktop", "tablet"]),
            device_risk_level=random.choice(["low", "medium", "high"]),
            ip_reputation=random.choice(["good", "neutral", "suspicious"]),
            ip_risk_score=random.uniform(0, 100),
            user_segment=random.choice(["regular", "vip", "new", "dormant"]),
            signals={
                "velocity_score": random.uniform(0, 100),
                "behavioral_score": random.uniform(0, 100),
                "device_fingerprint_match": random.choice([True, False])
            },
            derived_features={
                "avg_transaction_amount_30d": float(tx.amount * random.uniform(0.5, 1.5)),
                "transaction_count_24h": random.randint(1, 10),
                "merchant_frequency": random.randint(1, 50)
            },
            explanations={
                "primary_factor": "amount_anomaly" if tx.status == "BLOCK" else "normal_pattern",
                "contributing_factors": ["location", "device", "velocity"]
            }
        )
        db.add(enriched)
        
        # 3. Create Rule Evaluations (2-3 rules per transaction)
        num_rules = random.randint(2, 4)
        rules = random.sample(rule_templates, num_rules)
        
        for rule in rules:
            # Some rules match based on transaction status
            matched = 1 if (tx.status == "BLOCK" and rule["severity"] == "HIGH") else random.choice([0, 1])
            
            rule_eval = models.RuleEvaluation(
                ingested_event_id=event.id,
                transaction_id=tx.id,
                rule_id=rule["rule_id"],
                rule_name=rule["name"],
                severity=rule["severity"],
                action=rule["action"],
                reason=f"Rule {rule['rule_id']} triggered due to {rule['name'].lower()}",
                matched=matched
            )
            db.add(rule_eval)
        
        # 4. Create Automated Actions (for blocked transactions)
        if tx.status == "BLOCK":
            action = models.AutomatedAction(
                ingested_event_id=event.id,
                transaction_id=tx.id,
                action_type="BLOCK_TRANSACTION",
                status="COMPLETED",
                details={
                    "reason": "High risk score detected",
                    "triggered_rules": [r["rule_id"] for r in rules if r["severity"] == "HIGH"]
                },
                processed_at=tx.timestamp
            )
            db.add(action)
        
        # 5. Create Event Snapshot
        snapshot = models.EventSnapshot(
            ingested_event_id=event.id,
            event_id=event.event_id,
            transaction_id=tx.id,
            transaction_status=tx.status,
            risk_score=tx.risk_score.score if tx.risk_score else 0,
            amount=tx.amount,
            currency=tx.currency,
            geo_country="Uzbekistan",
            device_type=enriched.device_type,
            ip_reputation=enriched.ip_reputation,
            rule_action="BLOCK" if tx.status == "BLOCK" else "ALLOW",
            rule_ids=[r["rule_id"] for r in rules],
            metrics={
                "processing_time_ms": random.randint(10, 500),
                "enrichment_time_ms": random.randint(5, 100),
                "rule_evaluation_time_ms": random.randint(5, 50)
            }
        )
        db.add(snapshot)
        
        # 6. Create Alerts for blocked transactions (20% chance)
        if tx.status == "BLOCK" and random.random() < 0.3:
            alert = models.Alert(
                ingested_event_id=event.id,
                transaction_id=tx.id,
                severity="HIGH" if tx.risk_score and tx.risk_score.score > 800 else "MEDIUM",
                status=random.choice(["OPEN", "IN_PROGRESS", "RESOLVED"]),
                assigned_to=random.choice(["analyst_1", "analyst_2", "analyst_3", None]),
                notes=f"Suspected fraud - {tx.merchant}",
                created_at=tx.timestamp
            )
            db.add(alert)
            db.flush()
            
            # Create case for some alerts
            if alert.status in ["IN_PROGRESS", "RESOLVED"] and alert.assigned_to:
                case = models.Case(
                    alert_id=alert.id,
                    analyst=alert.assigned_to,
                    conclusion="Confirmed fraud" if random.random() < 0.6 else "False positive",
                    resolution="BLOCK_CONFIRMED" if random.random() < 0.6 else "UNBLOCK",
                    created_at=tx.timestamp + datetime.timedelta(minutes=random.randint(5, 60))
                )
                db.add(case)
        
        if (idx + 1) % 10 == 0:
            print(f"Processed {idx + 1}/{len(transactions)} transactions...")
            
    except Exception as e:
        print(f"Error processing transaction {tx.id}: {e}")
        continue

# Commit all changes
try:
    db.commit()
    print(f"\n✓ Successfully added simulation data for {len(transactions)} transactions")
    print("  - Ingested Events")
    print("  - Enriched Contexts")
    print("  - Rule Evaluations")
    print("  - Automated Actions")
    print("  - Event Snapshots")
    print("  - Alerts & Cases")
except Exception as e:
    db.rollback()
    print(f"Error committing data: {e}")
finally:
    db.close()
