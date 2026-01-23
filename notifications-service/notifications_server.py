#!/usr/bin/env python3
"""
Notifications Service - Python Implementation
Replaces Go service with better CORS handling and email functionality
"""

import json
import sys
import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime
import threading
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/notifications.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class NotificationHandler(BaseHTTPRequestHandler):
    
    def log_request(self, method, path, status_code=200, message=""):
        """Log incoming requests for debugging"""
        origin = self.headers.get('Origin', 'unknown')
        logger.info(f"[{method}] {path} from {origin} - Status: {status_code} - {message}")
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.log_request('OPTIONS', self.path, 204, "CORS preflight")
        
        # CORS headers for preflight
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', self._get_cors_origin())
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization')
        self.send_header('Access-Control-Expose-Headers', 'Content-Length')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests"""
        self.log_request('POST', self.path, 200, "Processing notification")
        
        # CORS headers
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', self._get_cors_origin())
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization')
        self.send_header('Access-Control-Expose-Headers', 'Content-Length')
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.end_headers()
        
        # Parse URL
        parsed_path = urlparse(self.path)
        
        # Only handle /api/v1/notify endpoint
        if parsed_path.path == '/api/v1/notify':
            try:
                # Read request body
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length == 0:
                    self.wfile.write(json.dumps({
                        'error': 'Request body is required'
                    }).encode('utf-8'))
                    return
                
                post_data = self.rfile.read(content_length)
                
                # Parse JSON
                data = json.loads(post_data.decode('utf-8'))
                
                # Validate required fields
                required_fields = ['event', 'email', 'order_id']
                for field in required_fields:
                    if field not in data:
                        error_msg = f'Missing required field: {field}'
                        logger.error(f"[VALIDATION] {error_msg}")
                        self.wfile.write(json.dumps({
                            'error': error_msg
                        }).encode('utf-8'))
                        return
                
                # Extract data
                event = data['event']
                email = data['email']
                order_id = data['order_id']
                extra_data = data.get('extra_data', '')
                
                # Log the notification request
                logger.info(f"[NOTIFICATION] Event: {event}, Email: {email}, Order ID: {order_id}, Extra: {extra_data}")
                
                # Send email in background thread (non-blocking)
                email_thread = threading.Thread(
                    target=self.send_notification_email,
                    args=(event, email, order_id, extra_data),
                    daemon=True
                )
                email_thread.start()
                
                # Immediate response
                response = {
                    'success': True,
                    'message': 'Notificación enviada correctamente',
                    'timestamp': datetime.now().isoformat(),
                    'event': event,
                    'order_id': order_id
                }
                
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except json.JSONDecodeError as e:
                error_msg = f'Invalid JSON: {str(e)}'
                logger.error(f"[JSON_ERROR] {error_msg}")
                self.wfile.write(json.dumps({
                    'error': error_msg
                }).encode('utf-8'))
                
            except Exception as e:
                error_msg = f'Internal server error: {str(e)}'
                logger.error(f"[SERVER_ERROR] {error_msg}")
                self.wfile.write(json.dumps({
                    'error': error_msg
                }).encode('utf-8'))
        else:
            error_msg = 'Endpoint not found'
            logger.error(f"[NOT_FOUND] {error_msg}: {parsed_path.path}")
            self.wfile.write(json.dumps({
                'error': error_msg
            }).encode('utf-8'))
    
    def do_GET(self):
        """Handle GET requests for health check and status"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/v1/notify':
            # Health check for the notify endpoint
            self.log_request('GET', self.path, 200, "Health check")
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', self._get_cors_origin())
            self.end_headers()
            
            health_response = {
                'status': 'healthy',
                'service': 'notifications-service',
                'version': '1.0.0',
                'timestamp': datetime.now().isoformat(),
                'endpoints': {
                    'POST /api/v1/notify': 'Send notification',
                    'GET /api/v1/notify': 'Health check'
                }
            }
            
            self.wfile.write(json.dumps(health_response, indent=2).encode('utf-8'))
            
        elif parsed_path.path == '/health':
            # Simple health check
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', self._get_cors_origin())
            self.end_headers()
            
            self.wfile.write(json.dumps({
                'status': 'ok',
                'service': 'notifications-service'
            }).encode('utf-8'))
            
        elif parsed_path.path == '/':
            # Root endpoint
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', self._get_cors_origin())
            self.end_headers()
            
            self.wfile.write(json.dumps({
                'service': 'Notifications Service',
                'version': '1.0.0',
                'status': 'running',
                'endpoints': {
                    'POST /api/v1/notify': 'Send notification',
                    'GET /api/v1/notify': 'Health check',
                    'GET /health': 'Simple health check'
                }
            }).encode('utf-8'))
            
        else:
            self.send_response(404)
            self.end_headers()
    
    def _get_cors_origin(self):
        """Get appropriate CORS origin"""
        origin = self.headers.get('Origin', '')
        
        # In development, allow all origins
        if os.getenv('NODE_ENV', 'development') == 'development':
            return '*'
        
        # In production, allow specific origins
        allowed_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
        
        if origin in allowed_origins:
            return origin
        
        # Default to first allowed origin
        return allowed_origins[0] if allowed_origins else '*'
    
    def send_notification_email(self, event, email, order_id, extra_data):
        """Send notification email based on event type"""
        try:
            # Email configuration from environment
            smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
            smtp_port = int(os.getenv('SMTP_PORT', '587'))
            email_from = os.getenv('EMAIL_FROM', 'angel2296rojas@gmail.com')
            email_password = os.getenv('EMAIL_PASSWORD', 'tmwq uabq htxb tgzr')
            
            logger.info(f"[EMAIL] Preparing email for {email} - Event: {event}")
            
            # Create message based on event
            if event == 'order_created':
                subject = f'¡Recibimos tu pedido #{order_id}!'
                body = f'''Hola {email},

¡Buenas noticias! Hemos recibido tu solicitud de pedido #{order_id}.

📋 Detalles del pedido:
• ID del Pedido: {order_id}
• Estado: Recibido
• Próximo paso: Esperando confirmación de pago

Estamos procesando tu pedido y te notificaremos cuando el pago sea confirmado.

Gracias por tu confianza en nuestro servicio.

Atentamente,
El Equipo de Ventas
'''
            
            elif event == 'payment_confirmed':
                subject = f'✅ Pago Aprobado - Pedido #{order_id}'
                body = f'''¡Excelentes noticias, {email}!

Tu pago ha sido procesado exitosamente para el pedido #{order_id}.

💰 Detalles del pago:
• ID del Pedido: {order_id}
• Monto: {extra_data}
• Estado: Pagado y Aprobado
• Próximo paso: Preparación del envío

📦 Tu paquete está siendo preparado y te enviaremos una notificación cuando esté en camino.

Gracias por tu compra!

Atentamente,
El Equipo de Ventas
'''
            
            elif event == 'status_changed':
                subject = f'📦 Actualización de Pedido #{order_id}'
                body = f'''Hola {email},

Hay una actualización importante sobre tu pedido #{order_id}.

🔄 Estado Actual: {extra_data}

Tu pedido está avanzando en nuestro sistema de procesamiento. Te mantendremos informado sobre cada paso importante.

Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.

Gracias por tu paciencia.

Atentamente,
El Equipo de Soporte
'''
            
            else:
                subject = f'📧 Notificación - Pedido #{order_id}'
                body = f'''Hola {email},

Hay una actualización sobre tu pedido #{order_id}.

Evento: {event}
Información adicional: {extra_data}

Gracias por tu compra.

Atentamente,
El Equipo de Ventas
'''
            
            # Create email message
            msg = MIMEMultipart()
            msg['From'] = email_from
            msg['To'] = email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            # Send email
            logger.info(f"[EMAIL] Connecting to SMTP server: {smtp_host}:{smtp_port}")
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
            server.login(email_from, email_password)
            
            logger.info(f"[EMAIL] Sending email to {email}")
            server.send_message(msg)
            server.quit()
            
            logger.info(f"[EMAIL] ✅ Email sent successfully to {email} for event {event}")
            
        except Exception as e:
            logger.error(f"[EMAIL] ❌ Failed to send email: {str(e)}")
            # Don't raise exception so API response is still successful

class NotificationServer:
    """Enhanced notification server with better configuration"""
    
    def __init__(self, host='0.0.0.0', port=8082):
        self.host = host
        self.port = port
        self.server = None
        self.running = False
    
    def start(self):
        """Start the notification server"""
        try:
            self.server = HTTPServer((self.host, self.port), NotificationHandler)
            self.running = True
            
            logger.info(f"🚀 Notifications Service starting on {self.host}:{self.port}")
            logger.info(f"📧 SMTP Server: {os.getenv('SMTP_HOST', 'smtp.gmail.com')}:{os.getenv('SMTP_PORT', '587')}")
            logger.info(f"🔗 Health Check: http://{self.host}:{self.port}/api/v1/notify")
            logger.info(f"🌍 CORS Origins: {os.getenv('CORS_ORIGINS', 'http://localhost:3000')}")
            logger.info(f"📊 Environment: {os.getenv('NODE_ENV', 'development')}")
            
            self.server.serve_forever()
            
        except KeyboardInterrupt:
            logger.info("🛑 Server stopped by user")
            self.stop()
        except Exception as e:
            logger.error(f"❌ Server error: {str(e)}")
            self.stop()
    
    def stop(self):
        """Stop the notification server"""
        if self.server and self.running:
            self.running = False
            self.server.shutdown()
            logger.info("🛑 Server stopped")

def main():
    """Main entry point"""
    # Configuration from environment
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 8082'))
    
    # Create and start server
    server = NotificationServer(host, port)
    server.start()

if __name__ == '__main__':
    main()