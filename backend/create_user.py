"""
Create a user account for the anti-fraud platform
"""
import models
import database
from auth.password import get_password_hash

# Create database session
db = database.SessionLocal()

try:
    # Check if user already exists
    existing_user = db.query(models.User).filter(
        models.User.username == "engineer"
    ).first()
    
    if existing_user:
        print("❌ User 'engineer' already exists!")
        print(f"   Email: {existing_user.email}")
        print(f"   Role: {existing_user.role}")
    else:
        # Create new user
        password = "Xazrat_ali571".encode('utf-8')[:72].decode('utf-8')  # Truncate to 72 bytes
        new_user = models.User(
            username="engineer",
            email="engineer@fraudguard.ai",
            hashed_password=get_password_hash(password),
            full_name="Engineer Ali",
            role=models.UserRole.ADMIN,  # Admin role
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print("✅ User created successfully!")
        print(f"   Username: {new_user.username}")
        print(f"   Email: {new_user.email}")
        print(f"   Role: {new_user.role}")
        print(f"   Password: Xazrat_ali571")
        print("\n🚀 You can now login at http://localhost:5173/login")
        
except Exception as e:
    print(f"❌ Error creating user: {e}")
    db.rollback()
finally:
    db.close()
