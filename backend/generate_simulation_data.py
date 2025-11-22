"""
Generate a large volume of realistic transaction records for MVP demonstration
"""
import random
import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import ml_engine

TOTAL_TRANSACTIONS = 300_000
BATCH_SIZE = 5_000

# Clear existing data
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

# Realistic data pools
MERCHANTS = [
    "Korzinka.uz", "Texnomart", "Shopify", "Walmart", "Target", "Best Buy", "Apple Store",
    "Google Play", "Steam", "Netflix", "Spotify", "Uber", "Lyft", "Airbnb",
    "Booking.com", "Expedia", "Starbucks", "McDonald's", "Subway", "Domino's",
    "Nike", "Adidas", "Zara", "H&M", "Macy's", "Nordstrom", "Costco", "Home Depot",
    "Lowe's", "Petco", "Chewy", "Wayfair", "Etsy", "Alibaba", "AliExpress",
    "SuperStore", "TechMart", "GameStop", "Office Depot", "Staples"
]

LOCATIONS = [
    "Tashkent", "Samarkand", "Bukhara", "Khiva",
    "Namangan", "Andijan", "Fergana", "Nukus",
    "Karshi", "Termez", "Urgench", "Jizzakh"
]

FIRST_NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor",
    "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Sanchez",
    "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King"
]

def generate_ip():
    return f"{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}"

def generate_device_id():
    devices = ["iPhone", "Android", "Desktop", "Tablet", "Laptop"]
    return f"{random.choice(devices)}_{random.randint(1000, 9999)}"

def generate_user_id():
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    num = random.randint(1, 999)
    return f"{first.lower()}_{last.lower()}_{num:03d}"

def generate_amount():
    # Realistic transaction amounts in UZS (Uzbek So'm)
    # 1 USD ≈ 12,500 UZS
    if random.random() < 0.05:  # 5% high-value transactions
        return round(random.uniform(62_500_000, 625_000_000), 2)
    elif random.random() < 0.15:  # 15% medium-value
        return round(random.uniform(6_250_000, 62_500_000), 2)
    else:  # 80% normal transactions
        return round(random.uniform(125_000, 6_250_000), 2)

def generate_timestamp(days_ago_range=180):
    """Generate timestamp within last N days"""
    now = datetime.datetime.utcnow()
    days_ago = random.randint(0, days_ago_range)
    hours_ago = random.randint(0, 23)
    minutes_ago = random.randint(0, 59)
    seconds_ago = random.randint(0, 59)
    
    return now - datetime.timedelta(
        days=days_ago,
        hours=hours_ago,
        minutes=minutes_ago,
        seconds=seconds_ago
    )

def create_transaction_batch(db: Session, batch_size=1000):
    """Create a batch of transactions"""
    transactions = []
    
    for i in range(batch_size):
        timestamp = generate_timestamp()
        amount = generate_amount()
        user_id = generate_user_id()
        merchant = random.choice(MERCHANTS)
        location = random.choice(LOCATIONS)
        
        # Prepare transaction data for ML engine
        hour_of_day = timestamp.hour
        day_of_week = timestamp.weekday()
        
        transaction_data = {
            "transaction_id": f"TXN{random.randint(100000, 999999)}{timestamp.strftime('%Y%m%d%H%M%S')}{i:04d}",
            "user_id": user_id,
            "amount": amount,
            "currency": "USD",
            "merchant": merchant,
            "ip_address": generate_ip(),
            "location": location,
            "device_id": generate_device_id(),
            "timestamp": timestamp,
            "hour_of_day": hour_of_day,
            "day_of_week": day_of_week,
            "avg_transaction_amount": random.uniform(100, 1000),
            "transaction_frequency": random.randint(1, 20),
            "days_since_last_transaction": random.randint(0, 30),
            "device_change": random.choice([0, 1]),
            "ip_change": random.choice([0, 1]),
            "location_change_speed": random.uniform(0, 2)
        }
        
        # Create transaction
        db_transaction = models.Transaction(
            transaction_id=transaction_data["transaction_id"],
            user_id=user_id,
            amount=amount,
            currency="UZS",
            merchant=merchant,
            ip_address=transaction_data["ip_address"],
            location=location,
            device_id=transaction_data["device_id"],
            timestamp=timestamp,
            status="PENDING"
        )
        
        # Calculate risk using ML engine
        try:
            risk_result = ml_engine.ml_engine.predict(transaction_data)
            
            # Determine status based on risk score
            if risk_result["score"] > 800:
                db_transaction.status = "BLOCK"
            elif risk_result["score"] > 500:
                db_transaction.status = "CHALLENGE"
            else:
                db_transaction.status = "ALLOW"
            
            # Create risk score
            db_risk = models.RiskScore(
                transaction_id=None,  # Will be set after commit
                score=risk_result["score"],
                confidence=risk_result["confidence"],
                reason=risk_result["reason"]
            )
            
            transactions.append((db_transaction, db_risk))
        except Exception as e:
            # Fallback if ML engine fails
            db_transaction.status = "ALLOW"
            db_risk = models.RiskScore(
                transaction_id=None,
                score=random.randint(0, 300),
                confidence=0.9,
                reason="Normal Activity (Fallback)"
            )
            transactions.append((db_transaction, db_risk))
    
    # Bulk insert transactions
    db.add_all([t[0] for t in transactions])
    db.commit()
    
    # Now add risk scores with proper transaction_id
    for db_transaction, db_risk in transactions:
        db_risk.transaction_id = db_transaction.id
        db.add(db_risk)
    
    db.commit()
    
    return len(transactions)

def main():
    print("🚀 Starting simulation data generation...")
    print(f"📊 Generating {TOTAL_TRANSACTIONS:,} transactions...")
    
    db = SessionLocal()
    total_created = 0
    
    base_batches = TOTAL_TRANSACTIONS // BATCH_SIZE
    remainder = TOTAL_TRANSACTIONS % BATCH_SIZE
    total_batches = base_batches + (1 if remainder else 0)
    progress_interval = max(1, total_batches // 10)
    
    try:
        for batch_num in range(1, total_batches + 1):
            current_batch_size = BATCH_SIZE if batch_num <= base_batches else remainder
            created = create_transaction_batch(db, current_batch_size)
            total_created += created
            
            if batch_num % progress_interval == 0 or batch_num == total_batches:
                print(f"✅ Progress: {batch_num}/{total_batches} batches ({total_created:,} transactions created)")
        
        # Get final statistics
        total = db.query(models.Transaction).count()
        blocked = db.query(models.Transaction).filter(models.Transaction.status == "BLOCK").count()
        challenged = db.query(models.Transaction).filter(models.Transaction.status == "CHALLENGE").count()
        allowed = db.query(models.Transaction).filter(models.Transaction.status == "ALLOW").count()
        pending = db.query(models.Transaction).filter(models.Transaction.status == "PENDING").count()
        
        print("\n" + "="*60)
        print("✅ Simulation Complete!")
        print("="*60)
        print(f"📈 Total Transactions: {total:,}")
        print(f"🚫 Blocked: {blocked:,} ({blocked/total*100:.2f}%)")
        print(f"⚠️  Under Review: {challenged:,} ({challenged/total*100:.2f}%)")
        print(f"✅ Approved: {allowed:,} ({allowed/total*100:.2f}%)")
        if pending:
            print(f"🕒 Pending: {pending:,} ({pending/total*100:.2f}%)")
        print(f"📊 Fraud Rate: {blocked/total*100:.2f}%")
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()

