from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token
)
from app.models.models import User
from app.schemas.schemas import UserCreate, UserLogin, TokenResponse
from fastapi.security import HTTPBearer, HTTPAuthCredentials

router = APIRouter()
security = HTTPBearer()

@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    db_user = User(
        email=user_data.email,
        vorname=user_data.vorname,
        nachname=user_data.nachname,
        telefon=user_data.telefon,
        password_hash=get_password_hash(user_data.password),
        role="eltern"  # Default role for self-registration
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create token
    access_token = create_access_token(
        data={"sub": str(db_user.id), "role": db_user.role}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=db_user
    )

@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token."""
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Create token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user
    )

@router.get("/me")
def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user."""
    token = credentials.credentials
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user
