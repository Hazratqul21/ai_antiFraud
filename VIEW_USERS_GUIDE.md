# 📊 DATABASE USERS VIEWER

## 🚀 Parollarni va login ma'lumotlarini ko'rish

### Qadim 1: Dastur'ni ishlatish

```bash
cd /home/ali/AIAnti-FraudPlatform
python view_users.py
```

### Expected Output:
```
====================================================================
📊 USERS IN DATABASE
====================================================================
+----+----------+----------------------------+--------+--------+------------+
| ID | Username | Email                      | Role   | Active | Created At |
+----+----------+----------------------------+--------+--------+------------+
| 1  | engineer | engineer@fraudguard.ai     | ADMIN  | ✅ Yes | 2025-11-30 |
+----+----------+----------------------------+--------+--------+------------+

✅ Total users: 1
```

---

## 🔐 Login Credentials Ko'rish

### SQL Ko'rish (SQLite Client)
```bash
# SQLite3 client ochish
sqlite3 backend/sql_app.db

# Users table'ni ko'rish
SELECT id, username, email, role, is_active FROM users;

# Barchasi ko'rish
SELECT * FROM users;

# Exit
.exit
```

### Python Script (Mas'laha)
```bash
# Barcha users
python view_users.py

# Bitta user
python -c "
import sqlite3
conn = sqlite3.connect('backend/sql_app.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM users WHERE username=\"engineer\"')
print(cursor.fetchone())
conn.close()
"
```

---

## ✅ Login Credentials

**Default Admin Account:**
```
Username:  engineer
Password:  Xazrat571
Email:     engineer@fraudguard.ai
Role:      ADMIN
Status:    Active ✅
```

---

## 🔧 User Boshqa Qilish

### Yangi User Yaratish
```bash
python backend/create_user.py
```

### Parolni O'zgartirish
```bash
python -c "
import sys
sys.path.insert(0, 'backend')
from models import User, UserRole
from database import SessionLocal
from auth.password import get_password_hash

db = SessionLocal()
user = db.query(User).filter(User.username == 'engineer').first()
if user:
    user.hashed_password = get_password_hash('NewPassword123')
    db.commit()
    print('✅ Password changed!')
else:
    print('❌ User not found')
db.close()
"
```

### User Role O'zgartirish
```bash
python -c "
import sys
sys.path.insert(0, 'backend')
from models import User, UserRole
from database import SessionLocal

db = SessionLocal()
user = db.query(User).filter(User.username == 'engineer').first()
if user:
    user.role = UserRole.ADMIN.value
    db.commit()
    print(f'✅ Role changed to {user.role}')
else:
    print('❌ User not found')
db.close()
"
```

---

## 🧪 Testing Commands

### Backend API Test
```bash
# Login API
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=engineer&password=Xazrat571"

# Get current user
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer <access_token>"
```

### Frontend Login Test
```
URL: http://localhost:5173/login
Username: engineer
Password: Xazrat571
```

---

## 📝 NOTES

- Parollar **hashed** shaklida database'da saqlanadi
- Parolni ko'ra olmaysiz, faqat hash'ni ko'rishingiz mumkin
- `view_users.py` script parol ko'rsatmaydi, faqat user info
- Login test qilish uchun credentials'ni to'g'ri kiritish kerak

---

**Happy login! 🛡️**
