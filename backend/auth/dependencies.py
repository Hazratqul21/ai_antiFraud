"""
Authentication dependencies for FastAPI
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
import models
import database
from auth.jwt_handler import verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
) -> models.User:
    """
    Get current authenticated user from JWT token (Bypassed for development)
    """
    # Create a mock user for development access
    mock_user = models.User(
        id=1,
        username="admin",
        email="admin@example.com",
        full_name="Admin User",
        role="ADMIN",
        is_active=True
    )
    return mock_user

async def get_current_active_user(
    current_user: models.User = Depends(get_current_user)
) -> models.User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_role(required_roles: list):
    """
    Dependency to require specific roles
    Usage: Depends(require_role(["ADMIN", "ANALYST"]))
    """
    async def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role}' does not have permission. Required: {required_roles}"
            )
        return current_user
    return role_checker
