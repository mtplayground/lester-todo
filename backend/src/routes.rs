use axum::routing::get;
use axum::Router;
use sqlx::SqlitePool;

use crate::handlers::todo::{create_todo, list_todos};

pub fn api_routes() -> Router<SqlitePool> {
    Router::new().route("/api/todos", get(list_todos).post(create_todo))
}
