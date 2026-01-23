# Notifications Service

Servicio de notificaciones por correo electrónico escrito en Go que gestiona el envío de correos para diferentes eventos del sistema de pedidos.

## Arquitectura

- **Lenguaje**: Go 1.25
- **Framework**: Gin Web Framework
- **SMTP**: Gmail (configurable)
- **Docker**: Multi-stage build

## Funcionalidades

### Eventos Soportados

1. **`order_created`**: Confirmación de pedido
   - Envía un correo cuando se crea un nuevo pedido
   - Informa al cliente que se ha recibido su solicitud

2. **`payment_confirmed`**: Confirmación de pago
   - Envía un correo cuando el pago es aprobado
   - Incluye el monto del pago exitoso

3. **`status_changed`**: Cambio de estado del pedido
   - Envía un correo cuando cambia el estado de un pedido
   - Incluye el nuevo estado (enviado, entregado, etc.)

## API Endpoints

### POST `/api/v1/notify`

Envía una notificación por correo electrónico.

**Request Body:**
```json
{
  "event": "order_created",
  "email": "cliente@ejemplo.com", 
  "order_id": 12345,
  "extra_data": "Información adicional (opcional)"
}
```

**Eventos válidos:**
- `order_created`
- `payment_confirmed` 
- `status_changed`

## Configuración

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|----------|
| `SMTP_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `EMAIL_FROM` | Correo remitente | Requerido |
| `EMAIL_PASSWORD` | Contraseña/App Password | Requerido |
| `PORT` | Puerto del servicio | `8082` |
| `HOST` | Host del servicio | `0.0.0.0` |
| `LOG_LEVEL` | Nivel de log | `info` |

### Configuración Gmail

Para usar con Gmail, necesitas:

1. **Habilitar 2FA** en tu cuenta Google
2. **Generar App Password**:
   - Ve a tu cuenta Google > Seguridad
   - Contraseñas de aplicaciones
   - Genera una nueva contraseña
   - Úsala en `EMAIL_PASSWORD`

## Uso con Docker

### Construcción
```bash
docker build -t notifications-service .
```

### Ejecución
```bash
docker run -p 8082:8082 \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e EMAIL_FROM=tu-correo@gmail.com \
  -e EMAIL_PASSWORD=tu-app-password \
  notifications-service
```

### Health Check
```bash
curl http://localhost:8082/api/v1/notify
```

## Ejemplos de Uso

### Notificación de Pedido Creado
```bash
curl -X POST http://localhost:8082/api/v1/notify \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order_created",
    "email": "cliente@ejemplo.com",
    "order_id": 12345
  }'
```

### Notificación de Pago Confirmado
```bash
curl -X POST http://localhost:8082/api/v1/notify \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment_confirmed", 
    "email": "cliente@ejemplo.com",
    "order_id": 12345,
    "extra_data": "$150.00"
  }'
```

### Notificación de Cambio de Estado
```bash
curl -X POST http://localhost:8082/api/v1/notify \
  -H "Content-Type: application/json" \
  -d '{
    "event": "status_changed",
    "email": "cliente@ejemplo.com", 
    "order_id": 12345,
    "extra_data": "SHIPPED"
  }'
```

## Despliegue con Docker Compose

El servicio está incluido en el `docker-compose.yml` principal:

```yaml
notifications_service:
  build: ./notifications-service
  ports:
    - "8082:8082"
  environment:
    - SMTP_HOST=smtp.gmail.com
    - SMTP_PORT=587
    - EMAIL_FROM=tu-correo@gmail.com
    - EMAIL_PASSWORD=tu-app-password
```

## Estructura del Proyecto

```
notifications-service/
├── Dockerfile
├── .env
├── go.mod
├── go.sum
├── main.go          # Entry point y routing
├── handlers.go      # HTTP handlers
├── models.go        # Data structures  
├── service.go       # Business logic (SMTP)
└── README.md        # This file
```

## Logging

El servicio logs todos los eventos en consola:

```
---------------------------------------------------
[EMAIL] Enviando Confirmación de Pedido a: cliente@ejemplo.com
ASUNTO: ¡Recibimos tu pedido #12345!
CUERPO: Hola. Hemos recibido tu solicitud de pedido.
---------------------------------------------------
```

## Seguridad

- Las credenciales de email se manejan mediante variables de entorno
- Validación de formato de email obligatoria
- Logs sin información sensible
- Health check endpoint sin datos sensibles

## Monitoreo

- Health check: `/api/v1/notify` (GET/HEAD)
- Logs estructurados para debugging
- Códigos de estado HTTP adecuados

## Contribuciones

1. Fork del proyecto
2. Feature branch (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Pull Request