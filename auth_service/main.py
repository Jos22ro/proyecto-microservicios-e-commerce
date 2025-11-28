from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from database import Base, engine
from models import Usuario, UsuarioMostrar, UsuarioCreate
from auth import hash_password, verify_password, crear_token, usuario_actual, get_db
from fastapi.security import OAuth2PasswordRequestForm

app=FastAPI()
Base.metadata.create_all(bind=engine)

@app.post("/register", response_model=UsuarioMostrar)
def registrar(u:UsuarioCreate, db:Session=Depends(get_db)):
    existe=db.query(Usuario).filter(Usuario.email==u.email).first()
    if existe:
        raise HTTPException(400,"Correo ya registrado")
    nuevo=Usuario(
        email=u.email,
        nombre=u.nombre,
        password=hash_password(u.password)
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@app.post("/login")
def login(form:OAuth2PasswordRequestForm=Depends(), db:Session=Depends(get_db)):
    user=db.query(Usuario).filter(Usuario.email==form.username).first()
    if not user or not verify_password(form.password,user.password):
        raise HTTPException(401,"Credenciales incorrectas")
    token=crear_token({"sub":user.email})
    return {"access_token":token,"token_type":"bearer"}

@app.get("/protegido")
def protegido(user=Depends(usuario_actual)):
    return {"mensaje":f"Hola {user.nombre}, acceso correcto."}
