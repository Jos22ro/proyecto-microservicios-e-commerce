import hashlib, secrets
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from database import SessionLocal
from models import Usuario

SECRET_KEY="SECRET_123"
ALGORITHM="HS256"
oauth2_scheme=OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password:str):
    salt=secrets.token_hex(16)
    h=hashlib.sha256((password+salt).encode()).hexdigest()
    return f"{salt}${h}"

def verify_password(password:str, stored:str):
    salt,hashed=stored.split("$")
    check=hashlib.sha256((password+salt).encode()).hexdigest()
    return check==hashed

def crear_token(data:dict):
    payload=data.copy()
    payload["exp"]=datetime.utcnow()+timedelta(hours=1)
    return jwt.encode(payload,SECRET_KEY,algorithm=ALGORITHM)

def usuario_actual(token:str=Depends(oauth2_scheme), db=Depends(get_db)):
    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        email=payload.get("sub")
    except JWTError:
        raise HTTPException(401,"Token inválido")
    user=db.query(Usuario).filter(Usuario.email==email).first()
    if not user:
        raise HTTPException(401,"Usuario no encontrado")
    return user
