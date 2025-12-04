# mailer.py
import os
import jwt
import datetime
import aiosmtplib
from email.message import EmailMessage
from dotenv import load_dotenv

# Cargamos variables (o impórtalas de tu config.py si prefieres)
load_dotenv()

SECRET_KEY = os.environ.get('SECRET_KEY', 'secret_key_por_defecto') 
TOKEN_EXPIRATION_HOURS = 1
MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
MAIL_SERVER = os.environ.get('MAIL_SERVER')
MAIL_PORT = int(os.environ.get('MAIL_PORT', '587'))
MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') == 'True'

def create_verification_token(email: str) -> str:
    payload = {
        'email': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

async def send_email_async(subject: str, recipients: list, html_content: str):
    message = EmailMessage()
    message["From"] = MAIL_USERNAME
    message["To"] = ", ".join(recipients)
    message["Subject"] = subject
    message.set_content(html_content, subtype='html')

    # Lógica de envío (Gmail vs Otros)
    try:
        if MAIL_SERVER == "smtp.gmail.com":
            await aiosmtplib.send(
                message,
                hostname=MAIL_SERVER,
                port=MAIL_PORT,
                start_tls=True,
                username=MAIL_USERNAME,
                password=MAIL_PASSWORD
            )
        else:
            await aiosmtplib.send(
                message,
                hostname=MAIL_SERVER,
                port=MAIL_PORT,
                use_tls=MAIL_USE_TLS,
                username=MAIL_USERNAME,
                password=MAIL_PASSWORD
            )
        print(f"✅ Correo enviado a {recipients}")
    except Exception as e:
        print(f"❌ Error enviando correo: {e}")

async def send_verification_email(user_email: str, base_url: str):
    """
    Esta es la función principal que llamará FastAPI en segundo plano.
    """
    token = create_verification_token(user_email)
    # Construimos el link usando la URL base que recibimos del request
    verification_link = f"{base_url}/auth/verify/{token}"

    subject = "Verifica tu cuenta"
    email_html = f"""
    <html>
    <body>
        <h1 style="color: #007bff;">Bienvenido</h1>
        <p>Haz clic para verificar tu cuenta:</p>
        <a href="{verification_link}" style="padding: 10px; background: #007bff; color: white;">Verificar</a>
    </body>
    </html>
    """
    await send_email_async(subject, [user_email], email_html)