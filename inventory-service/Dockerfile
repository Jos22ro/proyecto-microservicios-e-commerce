# Etapa de build
FROM rust:1.79-slim AS builder

WORKDIR /app

# --- CORRECCIÓN 1: Instalar dependencias de compilación MÁS EXTENSAS ---
# Se añaden build-essential y librerías comunes de base de datos (Postgres, SQLite)
# que a menudo causan el exit code 101 si faltan en la etapa de compilación.
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    build-essential \
    libpq-dev \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# 1. Copiar manifiestos para la capa de CACHE de dependencias
COPY Cargo.toml Cargo.lock ./

# 2. Crear un archivo main.rs dummy para compilar dependencias
RUN mkdir -p src && echo "fn main() {}" > src/main.rs

# Construir dependencias. Esto generará la carpeta target con las deps compiladas.
RUN cargo build --release

# 3. Preparar para el código real
# Eliminamos el main dummy y su huella.
RUN rm src/main.rs

# 4. Copiar el código fuente real
COPY . .

# --- CORRECCIÓN 2: Actualizar timestamps ---
# Aseguramos que Cargo detecte el código fuente nuevo y lo compile.
RUN touch src/main.rs

# Compilar el binario real.
RUN cargo build --release

# --- Fin de la Etapa de Build ---

# Etapa de runtime
FROM debian:bookworm-slim AS runtime

# --- CORRECCIÓN 3: Runtime optimizado ---
# Se reemplaza 'libssl-dev' (desarrollo) por 'libssl3' (runtime) para una imagen más ligera.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar binario desde la etapa de build
# NOTA: Asegúrate de que el nombre 'inventory-service' coincide con el 
# nombre [package] name = "..." en tu Cargo.toml
COPY --from=builder /app/target/release/inventory-service /app/inventory-service

ENV INVENTORY_PORT=3002
EXPOSE 3002

CMD ["/app/inventory-service"]