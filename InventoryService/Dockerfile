# Usar una imagen de Rust más reciente
FROM rust:latest as builder

# Crear un nuevo proyecto
WORKDIR /usr/src/app

# Copiar solo los archivos necesarios para la caché de dependencias
COPY Cargo.toml Cargo.lock ./

# Crear una estructura de proyecto temporal
RUN mkdir -p src && \
    echo "fn main() {}" > src/main.rs && \
    echo "pub fn dummy() {}" > src/lib.rs && \
    cargo build --release

# Copiar el resto del código fuente
COPY . .

# Reconstruir la aplicación
RUN touch src/main.rs && \
    # Usar una variable de entorno dummy para la compilación
    DATABASE_URL=postgres://dummy:password@localhost:5434/dummy \
    SQLX_OFFLINE=true \
    cargo build --release

# Imagen final
FROM debian:bookworm-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copiar el binario desde el builder
COPY --from=builder /usr/src/app/target/release/inventory_service /usr/local/bin/

# Puerto expuesto
EXPOSE 3000

# Variables de entorno (se pueden sobreescribir)
ENV RUST_LOG=info
ENV HOST=0.0.0.0
ENV PORT=3000

# Comando de inicio
CMD ["inventory_service"]