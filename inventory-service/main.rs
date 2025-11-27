use std::net::SocketAddr;
use std::sync::Arc;

use axum::{routing::get, Router};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use crate::autenticacion::ClaveJwtCompartida;

mod autenticacion;
mod base_datos;
mod rutas_inventario;

#[derive(Clone)]
pub struct EstadoAplicacion {
    pub repositorio_inventario: base_datos::RepositorioInventario,
    pub clave_jwt: ClaveJwtCompartida,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Cargar variables de entorno desde .env (si existe)
    dotenv().ok();

    // Inicializar logging
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            std::env::var("RUST_LOG")
                .unwrap_or_else(|_| "inventory_service=debug,tower_http=debug".into()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Leer configuración básica
    let puerto_servidor: u16 = std::env::var("INVENTORY_PORT")
        .unwrap_or_else(|_| "3002".into())
        .parse()
        .expect("INVENTORY_PORT debe ser un número");

    let url_base_datos =
        std::env::var("DATABASE_URL").expect("DATABASE_URL debe estar definida");
    
    let clave_jwt = ClaveJwtCompartida::desde_entorno()
        .expect("JWT_SECRET debe estar definida");

    // Crear pool de conexión a Postgres
    let pool_conexiones = PgPoolOptions::new()
        .max_connections(5)
        .connect(&url_base_datos)
        .await?;

    // TODO: aplicar migraciones si las necesitas (sqlx::migrate!())
    // Crear repositorio de inventario y estado compartido
    let repositorio_inventario = base_datos::RepositorioInventario::nuevo(pool_conexiones);
    let estado_aplicacion = EstadoAplicacion {
        repositorio_inventario,
        clave_jwt,
    };

    // Construir router
    let aplicacion = Router::new()
        .route("/health", get(revision_salud))
        .route(
            "/api/inventario/productos/:id/stock",
            get(rutas_inventario::obtener_stock_producto),
        )
        .route(
            "/api/inventario/productos/:id/aumentar",
            axum::routing::post(rutas_inventario::aumentar_stock_producto),
        )
        .route(
            "/api/inventario/productos/:id/disminuir",
            axum::routing::post(rutas_inventario::disminuir_stock_producto),
        )
        .with_state(estado_aplicacion);

    let direccion_servidor = SocketAddr::from(([0, 0, 0, 0], puerto_servidor));
    tracing::info!("Iniciando inventory-service en {}", direccion_servidor);

    let listener = tokio::net::TcpListener::bind(direccion_servidor).await?;
    axum::serve(listener, aplicacion).await?;

    Ok(())
}

async fn revision_salud() -> &'static str {
    "OK"
}
