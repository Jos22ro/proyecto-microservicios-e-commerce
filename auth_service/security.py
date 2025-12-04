from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config import settings
from database import get_db
import models, schemas

pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    # Asegurarse que 'sub' sea un string según el estándar JWT
    if 'sub' in to_encode and not isinstance(to_encode['sub'], str):
        to_encode['sub'] = str(to_encode['sub'])
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def decode_access_token(token: str) -> schemas.TokenData:
    try:
        print(f"[DEBUG] Decoding token: {token[:20]}...")
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        print(f"[DEBUG] Token payload: {payload}")
        user_id = payload.get("sub")
        role: str = payload.get("role")
        print(f"[DEBUG] Extracted user_id: {user_id} (type: {type(user_id)}), role: {role}")
        # Convertir user_id a entero si viene como string
        if isinstance(user_id, str):
            try:
                user_id = int(user_id)
            except ValueError:
                print(f"[DEBUG] Cannot convert user_id '{user_id}' to integer")
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user_id in token")
        if user_id is None or role is None:
            print("[DEBUG] Invalid token payload: missing user_id or role")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        return schemas.TokenData(user_id=user_id, role=role)
    except JWTError as e:
        print(f"[DEBUG] JWT decode error: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate token")

def get_token_from_request(request: Request, token: Optional[str] = Depends(oauth2_scheme)) -> str:
    print(f"[DEBUG] Headers received: {dict(request.headers)}")
    print(f"[DEBUG] Cookies received: {request.cookies}")
    print(f"[DEBUG] Looking for cookie: {settings.access_token_cookie_name}")
    
    if token:
        print(f"[DEBUG] Found Bearer token: {token[:20]}...")
        return token
    
    cookie_token = request.cookies.get(settings.access_token_cookie_name)
    print(f"[DEBUG] Cookie token value: {cookie_token}")
    
    if not cookie_token:
        print("[DEBUG] No token found in Authorization header or cookies")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    return cookie_token

def get_current_user(
    token: str = Depends(get_token_from_request),
    db: Session = Depends(get_db),
) -> models.User:
    token_data = decode_access_token(token)
    print(f"[DEBUG] Searching for user with id: {token_data.user_id}")
    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    print(f"[DEBUG] User found: {user}")
    if not user:
        print("[DEBUG] User not found in database")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        print("[DEBUG] User is inactive")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")
    print(f"[DEBUG] User {user.username} is active and authenticated")
    return user

def require_role(required_role: str):
    def role_dependency(current_user: models.User = Depends(get_current_user)):
        if not current_user.role or current_user.role.name != required_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user

    return role_dependency