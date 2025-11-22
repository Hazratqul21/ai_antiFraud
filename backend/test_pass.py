"""
Test password verification
"""
import bcrypt
from auth.password import verify_password

stored_hash = "$2b$12$TWKRC925WvD0u..ujlG/ce1anrlwuzKdddvcLwQjRKRgfOLvDF/nu"
password = "Xazrat571"

print(f"Testing password: {password}")
print(f"Stored hash: {stored_hash}")

# Test with bcrypt directly
try:
    result1 = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
    print(f"✅ Bcrypt direct: {result1}")
except Exception as e:
    print(f"❌ Bcrypt error: {e}")

# Test with passlib
try:
    result2 = verify_password(password, stored_hash)
    print(f"✅ Passlib verify: {result2}")
except Exception as e:
    print(f"❌ Passlib error: {e}")
