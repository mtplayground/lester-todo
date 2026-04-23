use axum::routing::{delete, get};
use axum::Router;
use sqlx::SqlitePool;

use crate::handlers::admin::{clear_completed_todos, get_admin_stats};
use crate::handlers::todo::{create_todo, delete_todo, list_todos, update_todo};

pub fn api_routes() -> Router<SqlitePool> {
    Router::new()
        .route("/api/admin/stats", get(get_admin_stats))
        .route("/api/admin/todos/completed", delete(clear_completed_todos))
        .route("/api/todos", get(list_todos).post(create_todo))
        .route(
            "/api/todos/:id",
            axum::routing::patch(update_todo).delete(delete_todo),
        )
}
