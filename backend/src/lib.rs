use std::path::PathBuf;

use axum::http::{header, HeaderValue, Method};
use axum::routing::get;
use axum::Router;
use sqlx::SqlitePool;
use tower_http::cors::{AllowOrigin, CorsLayer};
use tower_http::services::{ServeDir, ServeFile};

pub mod config;
pub mod db;
pub mod error;
pub mod handlers;
pub mod models;
pub mod repo;
pub mod routes;

pub fn build_app(pool: SqlitePool, static_dir: PathBuf) -> Router {
    let static_service =
        ServeDir::new(static_dir.clone()).not_found_service(ServeFile::new(static_dir.join("index.html")));

    Router::new()
        .route("/api/health", get(|| async { "lester-todo backend is running" }))
        .merge(routes::api_routes())
        .fallback_service(static_service)
        .with_state(pool)
        .layer(build_cors_layer())
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
