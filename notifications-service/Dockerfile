# Enhanced Notifications Service Dockerfile
# Uses Python 3.11 for better performance and features

FROM python:3.11-slim

# Set environment variables for better configuration
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NODE_ENV=development \
    PORT=8082 \
    HOST=0.0.0.0

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy application code
COPY notifications_server.py .

# Create logs directory with proper permissions
RUN mkdir -p /app/logs

# Install Python dependencies (if requirements.txt exists)
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8082

# Enhanced health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8082/health')" || exit 1

# Run the application
CMD ["python", "notifications_server.py"]