from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db, create_tables
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.models.token import Token
from app.services.auth import AuthService
from app.config.settings import settings

# Crear aplicación FastAPI
app = FastAPI(
    title="Auth Service",
    description="Microservicio de Autenticación",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear tablas al iniciar
@app.on_event("startup")
def on_startup():
    create_tables()

# Endpoints públicos
@app.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Registro de nuevo usuario"""
    auth_service = AuthService(db)
    user = auth_service.register_user(user_data)
    
    return {
        "message": "Usuario registrado exitosamente",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }

@app.post("/login", response_model=Token)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Login de usuario"""
    auth_service = AuthService(db)
    return auth_service.login_user(credentials)

# Endpoints protegidos
@app.get("/me", response_model=dict)
def get_current_user(
    authorization: str = None,
    db: Session = Depends(get_db)
):
    """Obtiene información del usuario actual"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorización requerido"
        )
    
    token = authorization.split("Bearer ")[1]
    auth_service = AuthService(db)
    user = auth_service.get_current_user(token)
    
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at
    }

@app.post("/verify-token")
def verify_token_endpoint(
    authorization: str = None,
    db: Session = Depends(get_db)
):
    """Verifica si un token es válido"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorización requerido"
        )
    
    token = authorization.split("Bearer ")[1]
    auth_service = AuthService(db)
    
    try:
        user = auth_service.get_current_user(token)
        return {
            "valid": True,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }
    except HTTPException:
        return {"valid": False}

# Health check
@app.get("/health")
def health_check():
    """Endpoint para verificar el estado del servicio"""
    return {
        "status": "healthy",
        "service": "auth-service",
        "version": "1.0.0"
    }

@app.get("/")
def read_root():
    """Endpoint raíz"""
    return {
        "message": "Auth Service - Microservicio de Autenticación",
        "endpoints": {
            "register": "/register",
            "login": "/login",
            "me": "/me",
            "verify-token": "/verify-token",
            "health": "/health"
        }
    }