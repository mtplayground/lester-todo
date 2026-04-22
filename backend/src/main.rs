use std::io;
use std::net::SocketAddr;

use axum::{routing::get, Router};

mod config;

#[tokio::main]
async fn main() -> io::Result<()> {
    let config = config::Config::load().map_err(io::Error::other)?;
    let database_kind = config
        .database_url
        .split(':')
        .next()
        .filter(|value| !value.is_empty())
        .unwrap_or("configured");

    let app = Router::new().route("/", get(|| async { "lester-todo backend is running" }));

    let address = SocketAddr::from(([0, 0, 0, 0], config.port));
    let listener = tokio::net::TcpListener::bind(address).await?;

    println!(
        "listening on http://{address} (static dir: {}, database: {database_kind})",
        config.static_dir.display(),
    );

    axum::serve(listener, app).await
}
