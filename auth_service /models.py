from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base
from pydantic import BaseModel
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String, nullable=False)
    password = Column(String, nullable=False)
    # NUEVOS CAMPOS para verificación
    verificado = Column(Boolean, default=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_verificacion = Column(DateTime, nullable=True)

class UsuarioCreate(BaseModel):
    email: str
    nombre: str
    password: str

class UsuarioMostrar(BaseModel):
    id: int
    email: str
    nombre: str
    verificado: bool  # NUEVO: incluir estado de verificación
    
    class Config:
        from_attributes = True  # Cambiado de orm_mode a from_attributes