from fastapi import FastAPI, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from database import Base, engine
from models import Usuario, UsuarioCreate, UsuarioMostrar
from auth import hash_password, verify_password, crear_token, usuario_actual, get_db
from fastapi.security import OAuth2PasswordRequestForm
from email_verification import send_verification_email, verify_email_token
from fastapi.responses import HTMLResponse
from datetime import datetime

app = FastAPI()

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

@app.post("/register", response_model=UsuarioMostrar)
async def registrar(u: UsuarioCreate, request: Request, db: Session = Depends(get_db)):
    # Verificar si el email ya existe
    existe = db.query(Usuario).filter(Usuario.email == u.email).first()
    if existe:
        raise HTTPException(status_code=400, detail="Correo ya registrado")
    
    # Crear nuevo usuario (no verificado inicialmente)
    nuevo = Usuario(
        email=u.email,
        nombre=u.nombre,
        password=hash_password(u.password),
        verificado=False  # Por defecto no verificado
    )
    
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    
    # Enviar correo de verificación
    base_url = str(request.base_url).rstrip('/')
    try:
        await send_verification_email(u.email, u.nombre, base_url)
    except Exception as e:
        # Si falla el envío de correo, eliminamos el usuario
        db.delete(nuevo)
        db.commit()
        raise HTTPException(
            status_code=500, 
            detail="Error al enviar correo de verificación. Intenta nuevamente."
        )
    
    return nuevo

@app.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == form.username).first()
    
    if not user or not verify_password(form.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    # Verificar si el email está verificado
    if not user.verificado:
        raise HTTPException(
            status_code=401, 
            detail="Por favor verifica tu correo electrónico antes de iniciar sesión"
        )
    
    token = crear_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/verify-email/{token}", response_class=HTMLResponse)
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Endpoint para verificar el email mediante el token"""
    try:
        # Verificar el token
        user_email = verify_email_token(token)
        
        # Buscar usuario
        user = db.query(Usuario).filter(Usuario.email == user_email).first()
        if not user:
            return HTMLResponse(
                content="""
                <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #dc3545;">❌ Error: Usuario no encontrado</h1>
                    <p>El usuario asociado a este enlace no existe.</p>
                </body>
                </html>
                """,
                status_code=404
            )
        
        # Marcar como verificado
        if not user.verificado:
            user.verificado = True
            user.fecha_verificacion = datetime.utcnow()
            db.commit()
        
        # Respuesta HTML de éxito
        html_response = f"""
        <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <div style="max-width: 500px; margin: 0 auto; background: #f8f9fa; padding: 30px; border-radius: 10px;">
                <h1 style="color: #28a745;">✅ ¡Email Verificado!</h1>
                <p>Tu cuenta <strong>{user_email}</strong> ha sido verificada correctamente.</p>
                <p>Ahora puedes iniciar sesión en la aplicación.</p>
                <div style="margin-top: 30px;">
                    <a href="/docs" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Ir a la API</a>
                </div>
            </div>
        </body>
        </html>
        """
        return HTMLResponse(content=html_response, status_code=200)
        
    except HTTPException as e:
        return HTMLResponse(
            content=f"""
            <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #dc3545;">❌ Error de Verificación</h1>
                <p>{e.detail}</p>
                <p><a href="/docs">Volver a la documentación</a></p>
            </body>
            </html>
            """,
            status_code=e.status_code
        )

@app.get("/protegido")
def protegido(user = Depends(usuario_actual)):
    return {"mensaje": f"Hola {user.nombre}, acceso correcto."}

# Endpoint para reenviar verificación
@app.post("/resend-verification")
async def resend_verification(email: str, request: Request, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if user.verificado:
        raise HTTPException(status_code=400, detail="El usuario ya está verificado")
    
    base_url = str(request.base_url).rstrip('/')
    await send_verification_email(user.email, user.nombre, base_url)
    
    return {"message": "Correo de verificación reenviado"}

# Endpoint para ver estado del usuario
@app.get("/user-status/{email}")
def user_status(email: str, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {
        "email": user.email,
        "verificado": user.verificado,
        "fecha_creacion": user.fecha_creacion,
        "fecha_verificacion": user.fecha_verificacion
    }

@app.get("/")
def root():
    return {"message": "Sistema de autenticación con verificación de email"}