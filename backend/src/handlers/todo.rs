use axum::extract::State;
use axum::http::StatusCode;
use axum::Json;
use sqlx::SqlitePool;

use crate::error::ApiError;
use crate::models::todo::{NewTodo, Todo};
use crate::repo;

#[derive(Debug, serde::Deserialize)]
pub struct CreateTodoRequest {
    pub title: String,
}

pub async fn list_todos(State(pool): State<SqlitePool>) -> Result<Json<Vec<Todo>>, ApiError> {
    let todos = repo::todo::list(&pool).await?;

    Ok(Json(todos))
}

pub async fn create_todo(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateTodoRequest>,
) -> Result<(StatusCode, Json<Todo>), ApiError> {
    let title = payload.title.trim();

    if title.is_empty() {
        return Err(ApiError::bad_request("title must not be empty"));
    }

    let todo = repo::todo::create(
        &pool,
        &NewTodo {
            title: title.to_owned(),
        },
    )
    .await?;

    Ok((StatusCode::CREATED, Json(todo)))
}
