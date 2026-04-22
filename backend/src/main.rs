use std::io;
use std::net::SocketAddr;

use axum::{routing::get, Router};

#[tokio::main]
async fn main() -> io::Result<()> {
    let app = Router::new().route("/", get(|| async { "lester-todo backend is running" }));

    let address = SocketAddr::from(([0, 0, 0, 0], 8080));
    let listener = tokio::net::TcpListener::bind(address).await?;

    println!("listening on http://{address}");

    axum::serve(listener, app).await
}
