import os
import jwt
import datetime
import aiosmtplib
from dotenv import load_dotenv
from fastapi import HTTPException, status
from urllib.parse import urljoin
from email.message import EmailMessage
from sqlalchemy.orm import Session

# Cargar variables de entorno
load_dotenv()

# Configuración
SECRET_KEY = os.environ.get('SECRET_KEY')
TOKEN_EXPIRATION_HOURS = 24  # 24 horas para verificación

# Configuración de Correo
MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
MAIL_SERVER = os.environ.get('MAIL_SERVER')
MAIL_PORT = int(os.environ.get('MAIL_PORT', '587'))
MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') == 'True'

# Verificación de configuración
if not SECRET_KEY:
    raise ValueError("SECRET_KEY no está definida en .env")

# --- Funciones de Verificación ---

def create_verification_token(email: str) -> str:
    """Genera un token JWT para verificación de email."""
    payload = {
        'email': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRATION_HOURS),
        'type': 'email_verification'
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

async def send_email_async(subject: str, recipients: list, html_content: str):
    """Envía correo electrónico de forma asíncrona."""
    try:
        message = EmailMessage()
        message["From"] = MAIL_USERNAME
        message["To"] = ", ".join(recipients)
        message["Subject"] = subject
        message.set_content(html_content, subtype='html')

        await aiosmtplib.send(
            message,
            hostname=MAIL_SERVER,
            port=MAIL_PORT,
            use_tls=MAIL_USE_TLS,
            username=MAIL_USERNAME,
            password=MAIL_PASSWORD
        )
        print(f"✅ Correo enviado exitosamente a {recipients}")
    except Exception as e:
        print(f"❌ Error al enviar correo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al enviar el correo de verificación."
        )

async def send_verification_email(user_email: str, user_name: str, base_url: str):
    """Envía el correo de verificación."""
    token = create_verification_token(user_email)
    verification_path = f"/verify-email/{token}"
    verification_link = urljoin(base_url, verification_path)

    subject = "Verifica tu cuenta - Confirma tu correo electrónico"
    
    email_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">¡Bienvenido, {user_name}!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Verifica tu correo electrónico</h2>
            <p>Gracias por registrarte en nuestra plataforma. Para activar tu cuenta, por favor verifica tu dirección de correo electrónico.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{verification_link}" style="background-color: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
                    ✅ Verificar mi Correo
                </a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">
                {verification_link}
            </p>
            
            <p><strong>El enlace expirará en {TOKEN_EXPIRATION_HOURS} horas.</strong></p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #666; font-size: 12px;">
                Si no solicitaste este registro, por favor ignora este mensaje.
            </p>
        </div>
    </body>
    </html>
    """
    
    await send_email_async(subject, [user_email], html_content=email_html)

def verify_email_token(token: str) -> str:
    """Verifica y decodifica el token de verificación de email."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        
        if payload.get('type') != 'email_verification':
            raise HTTPException(status_code=400, detail="Token inválido")
            
        return payload.get('email')
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="El enlace de verificación ha expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Token de verificación inválido")