from datetime import datetime, timezone
import os
import jwt
import os
import jwt

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, BackgroundTasks
from fastapi.responses import HTMLResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import models, schemas
from database import get_db
from security import get_password_hash, verify_password, create_access_token, get_current_user, require_role
from config import settings

# --- IMPORTANTE: Importamos tu lógica de correo ---
# Asegúrate de que el archivo mailer.py esté en la misma carpeta
from mailer import send_verification_email

# --- IMPORTANTE: Importamos tu lógica de correo ---
# Asegúrate de que el archivo mailer.py esté en la misma carpeta
from mailer import send_verification_email

router = APIRouter()

@router.post("/register", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: schemas.UserCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Verificar si el rol 'customer' existe
    role = db.query(models.Role).filter(models.Role.name == "customer").first()
    if not role:
        raise HTTPException(
            status_code=500,
            detail="Default role 'customer' not configured"
        )

    # Crear el usuario
    user = models.User(
        username=user_in.username,
        email=user_in.email,
        phone_number=user_in.phone_number,
        password_hash=get_password_hash(user_in.password),
        role_id=role.id,
        is_active=False  # El usuario debe verificar su correo primero
    )

    # Guardar el usuario en la base de datos
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        # Para desarrollo, usar localhost en lugar de host.docker.internal
        base_url = "http://localhost:8001"

        # Enviar correo de verificación en segundo plano
        background_tasks.add_task(
            send_verification_email,
            user_email=user.email,
            base_url=base_url
        )  
        
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig).lower()
        if "users_email_key" in error_msg or "email" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        if "users_phone_number_key" in error_msg or "phone" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="Phone number already registered"
            )
        if "users_username_key" in error_msg or "username" in error_msg:
            raise HTTPException(
                status_code=400,
                detail="Username already registered"
            )
        raise HTTPException(
            status_code=400,
            detail="Could not create user"
        )

    return user


@router.post("/login", response_model=schemas.Token)
def login(response: Response, credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

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

    return schemas.Token(access_token=access_token)


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


@router.get("/me", response_model=schemas.UserRead)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.get("/admin-only", response_model=schemas.UserRead)
def admin_only(current_user: models.User = Depends(require_role("admin"))):
    return current_user


# --- NUEVO ENDPOINT DE VERIFICACIÓN ---
@router.get("/verify/{token}", response_class=HTMLResponse)
def verify_email_token(token: str, db: Session = Depends(get_db)):
    """
    Valida el token recibido por correo y activa al usuario.
    """
    # IMPORTANTE: Debe ser la misma clave que usaste en mailer.py
    SECRET_KEY_MAILER = os.environ.get('SECRET_KEY', 'secret_key_por_defecto')

    try:
        # Decodificamos el token
        payload = jwt.decode(token, SECRET_KEY_MAILER, algorithms=['HS256'])
        email = payload.get('email')

        # Buscamos al usuario
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
             return HTMLResponse(
                 content="<h1 style='color:red'>Error: Usuario no encontrado</h1>", 
                 status_code=404
             )

        # Activamos al usuario (si ya estaba activo, no pasa nada)
        user.is_active = True 
        db.add(user)
        db.commit()

        return HTMLResponse(
            content="""
            <div style='display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;'>
                <h1 style='color:green'>¡Cuenta Verificada!</h1>
                <p>Tu correo ha sido confirmado exitosamente.</p>
                <a href="/" style='padding:10px 20px; background:#007bff; color:white; text-decoration:none; border-radius:5px;'>Ir al Inicio</a>
            </div>
            """, 
            status_code=200
        )

    except jwt.ExpiredSignatureError:
        return HTMLResponse(
            content="<h1 style='color:red'>El enlace de verificación ha expirado.</h1>", 
            status_code=400
        )
    except jwt.InvalidTokenError:
        return HTMLResponse(
            content="<h1 style='color:red'>Enlace de verificación inválido.</h1>", 
            status_code=400
        )