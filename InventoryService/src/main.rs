mod db;
mod handlers;
mod models;
mod order_logic;
mod routes;
mod seed;
mod stock_logic; // New module declaration

// use axum::serve;  // Eliminado ya que no se usará
use db::Db;
use dotenvy::dotenv;
use routes::create_router;
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    dotenv().ok();

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let db: Db = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to Postgres.");

    // Call the seeding function
    seed::seed_db(&db).await;

    // Configurar CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = create_router(db).layer(cors);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], 8002));
    println!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
