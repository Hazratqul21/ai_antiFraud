"""
Initialize database and create test user
"""
import models
import database
import bcrypt
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Force create all tables
models.Base.metadata.create_all(bind=database.engine)

# Create database session
db = database.SessionLocal()

try:
    # Check if user exists
    existing = db.query(models.User).filter(models.User.username == "engineer").first()
    
    if existing:
        logger.info("✅ User 'engineer' already exists!")
        logger.info(f"   Email: {existing.email}")
        logger.info(f"   Role: {existing.role}")
    else:
        # Get password from environment variable
        admin_password = os.getenv('ADMIN_PASSWORD')
        
        if not admin_password:
            logger.warning("⚠️  ADMIN_PASSWORD environment variable not set!")
            logger.warning("⚠️  Please set ADMIN_PASSWORD before running this script.")
            logger.warning("⚠️  Example: export ADMIN_PASSWORD='YourSecurePassword123'")
            exit(1)
        
        # Hash the password
        password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user
        new_user = models.User(
            username="engineer",
            email="engineer@fraudguard.ai",
            hashed_password=password_hash,
            full_name="Engineer Ali",
            role=models.UserRole.ADMIN,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info("✅ User created successfully!")
        logger.info(f"   Username: {new_user.username}")
        logger.info(f"   Email: {new_user.email}")
        logger.info(f"   Role: {new_user.role}")
        logger.info("\n🚀 Login at: http://localhost:5173/login")
        
except Exception as e:
    logger.error(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
