# Docker Compose para Notifications Service

Este archivo te permite levantar el notifications-service de forma independiente o en conjunto con otros servicios.

## 🚀 Uso

### Levantar el servicio
```bash
# En modo desarrollo
docker-compose up -d notifications-service

# Con logs visibles
docker-compose up notifications-service

# En modo producción
NODE_ENV=production docker-compose up -d notifications-service
```

### Variables de Entorno

Puedes crear un archivo `.env` o pasar variables directamente:

```bash
# .env (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_FROM=tu-correo@gmail.com
EMAIL_PASSWORD=tu-app-password
PORT=8082
NODE_ENV=development
```

## 🔗 Endpoints

- **API**: `http://localhost:8082/api/v1/notify`
- **Health Check**: `GET http://localhost:8082/api/v1/notify`

## 📋 Comandos Útiles

```bash
# Ver logs del servicio
docker-compose logs -f notifications-service

# Reiniciar el servicio
docker-compose restart notifications-service

# Detener el servicio
docker-compose down notifications-service

# Construir imagen desde cambios
docker-compose build notifications-service
```

## 🌐 Red

El servicio se conecta a la red externa `microservices_network` para poder comunicarse con otros microservicios.

Si la red no existe, créala:
```bash
docker network create microservices_network
```

## 🗄️ Base de Datos (Opcional)

Hay una configuración comentada para PostgreSQL si en el futuro necesitas persistencia de datos.

## 📧 SMTP Configuration

El servicio está configurado por defecto para Gmail. Para usarlo:

1. Habilita 2FA en tu cuenta Google
2. Genera una App Password
3. Configura las variables de entorno con tus credenciales

## 🛡️ Security Features

- Health checks automáticos
- Logs rotativos
- Variables de entorno para credenciales
- Network isolation

## 🐛 Troubleshooting

### Si no puedes conectarte al servicio:
```bash
# Verificar que esté corriendo
docker-compose ps

# Ver logs de errores
docker-compose logs notifications-service

# Probar conexión local
curl http://localhost:8082/api/v1/notify
```

### Si los emails no llegan:
1. Verifica las credenciales de SMTP
2. Revisa que el App Password sea correcto
3. Mira los logs del servicio para errores
4. Verifica que no esté en carpeta de spam