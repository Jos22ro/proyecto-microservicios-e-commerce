from datetime import datetime, timezone
import random

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import models, schemas
from database import get_db
from security import get_password_hash, verify_password, create_access_token, get_current_user, require_role
from config import settings

router = APIRouter()

VERIFICATION_CODES: dict[str, str] = {}
VERIFICATION_CODE_LENGTH = 6


def generate_verification_code() -> str:
    return f"{random.randint(0, 10**VERIFICATION_CODE_LENGTH - 1):06d}"

@router.post("/register", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    role = db.query(models.Role).filter(models.Role.name == "customer").first()
    if not role:
        raise HTTPException(status_code=500, detail="Default role 'customer' not configured")

    user = models.User(
        username=user_in.username,
        email=user_in.email,
        phone_number=user_in.phone_number,
        password_hash=get_password_hash(user_in.password),
        role_id=role.id,
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        msg = str(e.orig).lower()
        if "users_email_key" in msg or "email" in msg:
            raise HTTPException(status_code=400, detail="Email already registered")
        if "users_phone_number_key" in msg or "phone" in msg:
            raise HTTPException(status_code=400, detail="Phone number already registered")
        if "users_username_key" in msg or "username" in msg:
            raise HTTPException(status_code=400, detail="Username already registered")
        raise HTTPException(status_code=400, detail="Could not create user")
    db.refresh(user)

    # Generar y almacenar código de verificación en memoria (para desarrollo)
    code = generate_verification_code()
    VERIFICATION_CODES[user.username] = code
    print(f"[AUTH SERVICE] Verification code for {user.username} ({user.email}): {code}")

    return user


@router.post("/login", response_model=schemas.AuthResponse)
def login(response: Response, credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Incorrect email or password {credentials.email} & {credentials.password}")

    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not verified")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")
    user.last_login_at = datetime.now(timezone.utc)
    db.add(user)
    db.commit()

    role_name = user.role.name if user.role else "customer"

    access_token = create_access_token(data={"sub": user.id, "role": role_name})

    response.set_cookie(
        key=settings.access_token_cookie_name,
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
    )
    response.set_cookie(
        key=settings.role_cookie_name,
        value=role_name,
        httponly=False,
        secure=settings.cookie_secure,
        samesite="lax",
    )
    return schemas.AuthResponse(access_token=access_token, user=user)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=settings.access_token_cookie_name,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
    )
    response.delete_cookie(
        key=settings.role_cookie_name,
        httponly=False,
        secure=settings.cookie_secure,
        samesite="lax",
    )

    return {"detail": "Logged out"}


@router.post("/verify-code", response_model=schemas.AuthResponse)
def verify_code(payload: schemas.VerificationCode, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    expected_code = VERIFICATION_CODES.get(user.username)
    if not expected_code or expected_code != payload.code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification code")

    user.is_verified = True
    db.add(user)
    db.commit()
    db.refresh(user)

    # Consumir el código
    VERIFICATION_CODES.pop(user.username, None)

    role_name = user.role.name if user.role else "customer"
    access_token = create_access_token(data={"sub": user.id, "role": role_name})

    response.set_cookie(
        key=settings.access_token_cookie_name,
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
    )
    response.set_cookie(
        key=settings.role_cookie_name,
        value=role_name,
        httponly=False,
        secure=settings.cookie_secure,
        samesite="lax",
    )

    return schemas.AuthResponse(access_token=access_token, user=user)


@router.post("/resend-code")
def resend_code(payload: schemas.VerificationRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    code = generate_verification_code()
    VERIFICATION_CODES[user.username] = code
    print(f"[AUTH SERVICE] Resent verification code for {user.username} ({user.email}): {code}")

    return {"detail": "Verification code resent"}


@router.get("/me", response_model=schemas.UserRead)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.get("/admin-only", response_model=schemas.UserRead)
def admin_only(current_user: models.User = Depends(require_role("admin"))):
    return current_user