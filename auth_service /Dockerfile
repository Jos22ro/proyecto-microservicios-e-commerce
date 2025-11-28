# 1. Imagen Base Ligera
# Usamos una imagen de Python ligera que incluye las librerías necesarias
FROM python:3.11-slim

# 2. Configuración del Entorno
# Establecer variables de entorno para FastAPI/Uvicorn
ENV PYTHONUNBUFFERED 1
ENV FASTAPI_ENV production
ENV PORT 8000

# 3. Establecer el Directorio de Trabajo dentro del Contenedor
WORKDIR /app

# 4. Instalación de Dependencias (Optimización por Caching)
# Copiamos solo el archivo de requerimientos primero para que Docker lo cachee
COPY requirements.txt .

# Instalar dependencias
# --no-cache-dir reduce el tamaño de la imagen
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 5. Copiar el Código de la Aplicación
# Copiar todos los archivos de tu proyecto al directorio /app
# Se incluye main.py, auth.py, database.py, models.py, etc.
COPY . . 

# 6. Comando de Ejecución
# Iniciar la aplicación Uvicorn (servidor ASGI)
# main:app le dice a Uvicorn que busque la instancia 'app' en el módulo 'main.py'
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]