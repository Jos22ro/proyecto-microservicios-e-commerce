from sqlalchemy import Column, Integer, String
from database import Base
from pydantic import BaseModel

class Usuario(Base):
    __tablename__="usuarios"
    id=Column(Integer,primary_key=True,index=True)
    email=Column(String,unique=True,index=True,nullable=False)
    nombre=Column(String,nullable=False)
    password=Column(String,nullable=False)

class UsuarioCreate(BaseModel):
    email:str
    nombre:str
    password:str

class UsuarioMostrar(BaseModel):
    id:int
    email:str
    nombre:str
    class Config:
        orm_mode=True
