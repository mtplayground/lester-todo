use std::net::SocketAddr;

use backend::{build_app, config, db};

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
    let app = build_app(pool.clone(), config.static_dir.clone());

    let address = SocketAddr::from(([0, 0, 0, 0], config.port));
    let listener = tokio::net::TcpListener::bind(address).await?;

    println!(
        "listening on http://{address} (static dir: {}, database: {database_kind})",
        config.static_dir.display(),
    );

    axum::serve(listener, app).await?;

    Ok(())
}
