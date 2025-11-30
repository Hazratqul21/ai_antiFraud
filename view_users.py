#!/usr/bin/env python3
"""
View all users in the database
Displays: ID, Username, Email, Role, Is_Active, Created At
"""

import sys
import sqlite3

# Database path
DB_PATH = "backend/sql_app.db"

def print_table(headers, rows):
    """Print a simple ASCII table"""
    # Calculate column widths
    widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            widths[i] = max(widths[i], len(str(cell)))
    
    # Print header
    separator = "+" + "+".join("-" * (w + 2) for w in widths) + "+"
    header_row = "|" + "|".join(f" {h:<{widths[i]}} " for i, h in enumerate(headers)) + "|"
    
    print(separator)
    print(header_row)
    print(separator)
    
    # Print rows
    for row in rows:
        row_str = "|" + "|".join(f" {str(cell):<{widths[i]}} " for i, cell in enumerate(row)) + "|"
        print(row_str)
    
    print(separator)

def view_users():
    """View all users from database"""
    try:
        # Connect to database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Query users
        cursor.execute("""
            SELECT 
                id,
                username,
                email,
                role,
                is_active,
                created_at
            FROM users
            ORDER BY id DESC
        """)
        
        users = cursor.fetchall()
        
        if not users:
            print("❌ No users found in database!")
            print("\n📝 Create a user first:")
            print("   python backend/create_user.py")
            conn.close()
            return
        
        # Prepare table data
        headers = ["ID", "Username", "Email", "Role", "Active", "Created At"]
        
        # Format rows
        table_data = []
        for user in users:
            user_id, username, email, role, is_active, created_at = user
            active_status = "✅ Yes" if is_active else "❌ No"
            created_date = created_at[:10] if created_at else "N/A"
            table_data.append([
                user_id,
                username,
                email,
                role,
                active_status,
                created_date
            ])
        
        # Print table
        print("\n" + "="*120)
        print("📊 USERS IN DATABASE")
        print("="*120)
        print_table(headers, table_data)
        print("="*120)
        print(f"\n✅ Total users: {len(users)}\n")
        
        conn.close()
        
    except sqlite3.OperationalError as e:
        print(f"❌ Database error: {e}")
        print(f"\n📝 Database file not found: {DB_PATH}")
        print("\nCreate database first:")
        print("  python backend/create_user.py")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    view_users()
