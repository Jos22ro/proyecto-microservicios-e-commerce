from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.services.security import verify_password, get_password_hash, create_access_token
from app.config.settings import settings

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register_user(self, user_data: UserCreate) -> User:
        """Registra un nuevo usuario"""
        # Verificar si el usuario ya existe
        existing_user = self.db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        
        # Crear nuevo usuario
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed_password
        )
        
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return db_user

    def authenticate_user(self, credentials: UserLogin) -> User:
        """Autentica un usuario con email y contraseña"""
        user = self.db.query(User).filter(User.email == credentials.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas"
            )
        
        if not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas"
            )
        
        return user

    def login_user(self, credentials: UserLogin) -> dict:
        """Realiza login y genera token JWT"""
        user = self.authenticate_user(credentials)
        
        # Crear token de acceso
        access_token = create_access_token(
            data={"sub": user.email, "user_id": user.id}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }

    def get_current_user(self, token: str) -> User:
        """Obtiene el usuario actual desde el token JWT"""
        from app.services.security import verify_token
        
        payload = verify_token(token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado"
            )
        
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        
        if email is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        user = self.db.query(User).filter(User.email == email, User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )
        
        return user