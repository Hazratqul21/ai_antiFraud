"""
Initialize database and create test user
"""
import models
import database
import bcrypt

# Force create all tables
models.Base.metadata.create_all(bind=database.engine)

# Create database session
db = database.SessionLocal()

try:
    # Check if user exists
    existing = db.query(models.User).filter(models.User.username == "engineer").first()
    
    if existing:
        print("✅ User 'engineer' already exists!")
        print(f"   Email: {existing.email}")
        print(f"   Role: {existing.role}")
    else:
        # Direct bcrypt hash
        password_hash = "$2b$12$TWKRC925WvD0u..ujlG/ce1anrlwuzKdddvcLwQjRKRgfOLvDF/nu"
        
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
        
        print("✅ User created successfully!")
        print(f"   Username: {new_user.username}")
        print(f"   Email: {new_user.email}")
        print(f"   Role: {new_user.role}")
        print(f"   Password: Xazrat571")
        print("\n🚀 Login at: http://localhost:5173/login")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
