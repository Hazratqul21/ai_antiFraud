#!/usr/bin/env python3
"""
Fix test data to have realistic fraud rates
- 70% APPROVED
- 20% BLOCKED  
- 5% CHALLENGED
- 5% PENDING
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
import random
from dotenv import load_dotenv

load_dotenv()

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def fix_transaction_statuses():
    """Update transaction statuses to realistic distribution"""
    db = SessionLocal()
    
    try:
        # Get all transactions
        transactions = db.query(models.Transaction).all()
        total = len(transactions)
        
        print(f"📊 Found {total} transactions")
        print(f"🔄 Updating statuses...")
        
        # Calculate counts for each status
        approved_count = int(total * 0.70)  # 70%
        blocked_count = int(total * 0.20)   # 20%
        challenged_count = int(total * 0.05) # 5%
        pending_count = total - approved_count - blocked_count - challenged_count  # remaining ~5%
        
        # Shuffle transactions for random distribution
        random.shuffle(transactions)
        
        # Assign statuses
        for i, tx in enumerate(transactions):
            if i < approved_count:
                tx.status = models.TransactionStatus.APPROVED.value
            elif i < approved_count + blocked_count:
                tx.status = models.TransactionStatus.BLOCKED.value
            elif i < approved_count + blocked_count + challenged_count:
                tx.status = models.TransactionStatus.CHALLENGED.value
            else:
                tx.status = models.TransactionStatus.PENDING.value
        
        db.commit()
        
        # Verify distribution
        approved = db.query(models.Transaction).filter(
            models.Transaction.status == models.TransactionStatus.APPROVED.value
        ).count()
        blocked = db.query(models.Transaction).filter(
            models.Transaction.status == models.TransactionStatus.BLOCKED.value
        ).count()
        challenged = db.query(models.Transaction).filter(
            models.Transaction.status == models.TransactionStatus.CHALLENGED.value
        ).count()
        pending = db.query(models.Transaction).filter(
            models.Transaction.status == models.TransactionStatus.PENDING.value
        ).count()
        
        print(f"\n✅ Status distribution updated:")
        print(f"   ✓ APPROVED:   {approved:,} ({approved/total*100:.1f}%)")
        print(f"   ✓ BLOCKED:    {blocked:,} ({blocked/total*100:.1f}%)")
        print(f"   ✓ CHALLENGED: {challenged:,} ({challenged/total*100:.1f}%)")
        print(f"   ✓ PENDING:    {pending:,} ({pending/total*100:.1f}%)")
        print(f"\n📈 New fraud rate: {blocked/total*100:.1f}%")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Fixing test data...")
    print("=" * 50)
    fix_transaction_statuses()
    print("=" * 50)
    print("✅ Done!")
