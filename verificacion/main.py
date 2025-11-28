import os
import jwt
import datetime
import aiosmtplib
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, EmailStr
from urllib.parse import urljoin
from email.message import EmailMessage

# 1. Cargar variables de entorno
load_dotenv()

# --- Configuración CORREGIDA ---
SECRET_KEY = os.environ.get('SECRET_KEY')
TOKEN_EXPIRATION_HOURS = 1

# Configuración de Correo
MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
MAIL_SERVER = os.environ.get('MAIL_SERVER')

# CORRECCIÓN: Usamos un valor predeterminado de TIPO CADENA ('587') 
# para asegurarnos de que int() no reciba None si la clave no se carga.
MAIL_PORT = int(os.environ.get('MAIL_PORT', '587'))
MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') == 'True'

# ⚠️ Verificación básica de configuración
if not SECRET_KEY:
    raise ValueError("SECRET_KEY no está definida. Revisa tu archivo .env.")
if not (MAIL_USERNAME and MAIL_PASSWORD):
    print("ADVERTENCIA: Las credenciales de correo (MAIL_USERNAME o MAIL_PASSWORD) no están definidas.")


# --- Inicialización de FastAPI ---
app = FastAPI()

# --- Base de Datos Simulada (Diccionario) ---
USERS = {} # Ejemplo: {'test@mail.com': {'password': 'hashed_pwd', 'verified': False}}

# --- Modelos Pydantic para Validar Datos de Entrada ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str

# --- Funciones de Utilidad ---

def create_verification_token(email: str) -> str:
    """Genera un token JWT con la expiración y el email del usuario."""
    payload = {
        'email': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRATION_HOURS)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

async def send_email_async(subject: str, recipients: list, html_content: str):
    """Envía el correo electrónico de forma asíncrona - VERSIÓN CORREGIDA"""
    try:
        message = EmailMessage()
        message["From"] = MAIL_USERNAME
        message["To"] = ", ".join(recipients)
        message["Subject"] = subject
        message.set_content(html_content, subtype='html')

        print(f"📧 Intentando enviar correo a: {recipients}")
        print(f"🔧 Configuración: {MAIL_SERVER}:{MAIL_PORT}, TLS: {MAIL_USE_TLS}")

        # ✅ CORRECCIÓN CRÍTICA: Configuración específica para Gmail
        if MAIL_SERVER == "smtp.gmail.com":
            # Para Gmail, usa STARTTLS en puerto 587
            await aiosmtplib.send(
                message,
                hostname=MAIL_SERVER,
                port=MAIL_PORT,
                start_tls=True,  # ✅ CORREGIDO: start_tls en lugar de use_tls para Gmail
                username=MAIL_USERNAME,
                password=MAIL_PASSWORD,
                timeout=30
            )
        else:
            # Para otros servidores SMTP
            await aiosmtplib.send(
                message,
                hostname=MAIL_SERVER,
                port=MAIL_PORT,
                use_tls=MAIL_USE_TLS,
                username=MAIL_USERNAME,
                password=MAIL_PASSWORD
            )
            
        print(f"✅ Correo enviado exitosamente a {recipients}")
        
    except aiosmtplib.SMTPException as e:
        print(f"❌ Error SMTP al enviar correo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al enviar el correo de verificación. Revisa la configuración SMTP."
        )
    except Exception as e:
        print(f"❌ Error inesperado al enviar correo: {e}")
        # Para debugging, imprime información útil
        print(f"🔍 Debug - USERNAME: {MAIL_USERNAME}, SERVER: {MAIL_SERVER}, PORT: {MAIL_PORT}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor al enviar correo."
        )

async def send_verification_email(user_email: str, base_url: str):
    """Crea el token, genera el link y envía el correo."""
    
    token = create_verification_token(user_email)
    
    verification_path = f"/verify/{token}"
    verification_link = urljoin(base_url, verification_path)

    # ✅ CORRECCIÓN: Imprimir enlace en consola para testing
    print(f"🔗 ENLACE DE VERIFICACIÓN PARA {user_email}:")
    print(f"📧 {verification_link}")
    print("=" * 60)

    subject = "Verifica tu cuenta - App FastAPI"
    email_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h1 style="color: #007bff;">Verificación de Correo Electrónico</h1>
        <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="{verification_link}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Verificar mi Correo</a>
        <p style="margin-top: 20px; color: #666;">El enlace expirará en {TOKEN_EXPIRATION_HOURS} hora(s).</p>
        <hr>
        <p style="color: #999; font-size: 12px;">Si no solicitaste este registro, por favor ignora este mensaje.</p>
    </body>
    </html>
    """
    
    try:
        await send_email_async(subject, [user_email], html_content=email_html)
    except Exception as e:
        print(f"⚠️ No se pudo enviar el correo, pero el usuario fue registrado.")
        print(f"🔗 Usa este enlace para verificar manualmente: {verification_link}")

# --- Rutas (Endpoints) ---

@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserRegister, request: Request):
    """Ruta de registro: almacena el usuario y envía el correo de verificación."""
    
    email = user.email
    password = user.password

    if email in USERS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya está registrado."
        )

    # CORRECCIÓN: En un caso real, aquí deberías hashear la contraseña
    USERS[email] = {'password': password, 'verified': False} 

    # CORRECCIÓN: Obtenemos la URL base dinámicamente del request
    base_url = str(request.base_url).rstrip('/')
    
    await send_verification_email(email, base_url)
    
    return {
        "message": "Registro exitoso. Revisa tu correo para verificar tu cuenta.",
        "debug_info": "Si no recibes el correo, revisa la consola del servidor para el enlace de verificación."
    }


@app.get("/verify/{token}", response_class=HTMLResponse)
async def verify_email(token: str):
    """Ruta a la que el usuario accede para verificar su cuenta."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_email = payload.get('email')
        
        if user_email not in USERS:
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
        
        USERS[user_email]['verified'] = True
        
        html_response = f"""
        <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #28a745;">✅ ¡Verificación Exitosa!</h1>
            <p>Tu cuenta <strong>{user_email}</strong> ha sido verificada correctamente.</p>
            <p>Ya puedes iniciar sesión en la aplicación.</p>
            <div style="margin-top: 30px;">
                <a href="/" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Ir al Inicio</a>
            </div>
        </body>
        </html>
        """
        return HTMLResponse(content=html_response, status_code=200)
        
    except jwt.ExpiredSignatureError:
        return HTMLResponse(
            content="""
            <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #dc3545;">❌ Error: Enlace Expirado</h1>
                <p>El enlace de verificación ha expirado.</p>
                <p>Por favor, solicita un nuevo enlace de verificación.</p>
            </body>
            </html>
            """, 
            status_code=400
        )
    except jwt.InvalidTokenError:
        return HTMLResponse(
            content="""
            <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #dc3545;">❌ Error: Enlace Inválido</h1>
                <p>El enlace de verificación no es válido.</p>
            </body>
            </html>
            """, 
            status_code=400
        )
    except Exception as e:
        print(f"Error de verificación: {e}")
        return HTMLResponse(
            content="""
            <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #dc3545;">❌ Error Interno del Servidor</h1>
                <p>Ha ocurrido un error inesperado. Por favor, intenta más tarde.</p>
            </body>
            </html>
            """, 
            status_code=500
        )

@app.get('/status/{email}')
async def check_status(email: str):
    """Muestra el estado de verificación de un usuario (para debug)."""
    user_data = USERS.get(email)
    if not user_data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    return {"email": email, "verified": user_data['verified']}

# Ruta de inicio para testing
@app.get("/")
async def root():
    return {"message": "Sistema de verificación de correo funcionando correctamente"}

# --- Ejecución ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)