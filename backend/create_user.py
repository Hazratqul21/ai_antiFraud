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
        print("✏️ Updating user 'engineer'...")
        hashed_password = get_password_hash("Xazrat571")
        existing_user.hashed_password = hashed_password
        existing_user.is_active = True
        db.commit()
        db.refresh(existing_user)
        print("✅ User 'engineer' updated successfully!")
        print(f"   Username: {existing_user.username}")
        print(f"   Email: {existing_user.email}")
        print(f"   Role: {existing_user.role}")
        print(f"   Password: Xazrat571")
    else:
        # Create new user
        password = "Xazrat571"
        new_user = models.User(
            username="engineer",
            email="engineer@fraudguard.ai",
            hashed_password=get_password_hash(password),
            full_name="Engineer",
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
        print(f"   Password: Xazrat571")
        
    print("\n🚀 Login credentials:")
    print("   URL: http://localhost:5173/login")
    print("   Username: engineer")
    print("   Password: Xazrat571")
        
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
