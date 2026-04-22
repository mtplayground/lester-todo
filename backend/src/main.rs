use std::net::SocketAddr;

use axum::http::{header, HeaderValue, Method};
use axum::routing::get;
use axum::Router;
use tower_http::cors::{AllowOrigin, CorsLayer};
use tower_http::services::{ServeDir, ServeFile};

mod config;
mod db;
pub mod error;
pub mod models;
pub mod repo;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let config = config::Config::load()?;
    let database_kind = config
        .database_url
        .split(':')
        .next()
        .filter(|value| !value.is_empty())
        .unwrap_or("configured");
    let pool = db::connect(&config.database_url).await?;
    db::run_migrations(&pool).await?;
    let static_dir = config.static_dir.clone();
    let static_service =
        ServeDir::new(static_dir.clone()).not_found_service(ServeFile::new(static_dir.join("index.html")));

    let app = Router::new()
        .route("/api/health", get(|| async { "lester-todo backend is running" }))
        .fallback_service(static_service)
        .layer(build_cors_layer());

    let address = SocketAddr::from(([0, 0, 0, 0], config.port));
    let listener = tokio::net::TcpListener::bind(address).await?;

    println!(
        "listening on http://{address} (static dir: {}, database: {database_kind})",
        config.static_dir.display(),
    );

    axum::serve(listener, app).await?;

    Ok(())
}

fn build_cors_layer() -> CorsLayer {
    let allowed_origins = AllowOrigin::list([
        HeaderValue::from_static("http://localhost:5173"),
        HeaderValue::from_static("http://127.0.0.1:5173"),
        HeaderValue::from_static("http://0.0.0.0:5173"),
        HeaderValue::from_static("http://localhost:8080"),
        HeaderValue::from_static("http://127.0.0.1:8080"),
        HeaderValue::from_static("http://0.0.0.0:8080"),
    ]);

    CorsLayer::new()
        .allow_origin(allowed_origins)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::ACCEPT,
            header::AUTHORIZATION,
            header::CONTENT_TYPE,
        ])
}
