use axum::extract::State;
use axum::Json;
use serde::Serialize;
use sqlx::SqlitePool;

use crate::error::ApiError;
use crate::repo;

#[derive(Debug, Serialize)]
pub struct AdminStatsResponse {
    pub total: i64,
    pub active: i64,
    pub completed: i64,
    pub oldest_created_at: Option<String>,
    pub newest_created_at: Option<String>,
}

pub async fn get_admin_stats(
    State(pool): State<SqlitePool>,
) -> Result<Json<AdminStatsResponse>, ApiError> {
    let stats = repo::todo::stats(&pool).await?;

    Ok(Json(AdminStatsResponse {
        total: stats.total,
        active: stats.active,
        completed: stats.completed,
        oldest_created_at: stats.oldest_created_at,
        newest_created_at: stats.newest_created_at,
    }))
}
