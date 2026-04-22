use std::path::Path;

use sqlx::migrate::{MigrateError, Migrator};
use sqlx::sqlite::SqlitePoolOptions;
use sqlx::SqlitePool;

pub async fn connect(database_url: &str) -> Result<SqlitePool, sqlx::Error> {
    SqlitePoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await
}

pub async fn run_migrations(pool: &SqlitePool) -> Result<(), MigrateError> {
    let migrations_path = Path::new(env!("CARGO_MANIFEST_DIR")).join("migrations");
    let migrator = Migrator::new(migrations_path.as_path()).await?;

    migrator.run(pool).await
}
