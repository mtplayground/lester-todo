use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;
use sqlx::SqlitePool;

use crate::error::ApiError;
use crate::models::todo::{NewTodo, Todo, UpdateTodo};
use crate::repo;

#[derive(Debug, serde::Deserialize)]
pub struct CreateTodoRequest {
    pub title: String,
}

#[derive(Debug, Default, serde::Deserialize)]
pub struct UpdateTodoRequest {
    pub title: Option<String>,
    pub completed: Option<bool>,
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

pub async fn update_todo(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateTodoRequest>,
) -> Result<Json<Todo>, ApiError> {
    let title = match payload.title {
        Some(title) => {
            let trimmed = title.trim();

            if trimmed.is_empty() {
                return Err(ApiError::bad_request("title must not be empty"));
            }

            Some(trimmed.to_owned())
        }
        None => None,
    };

    if title.is_none() && payload.completed.is_none() {
        return Err(ApiError::bad_request("request must include at least one field to update"));
    }

    let todo = repo::todo::update(
        &pool,
        id,
        &UpdateTodo {
            title,
            completed: payload.completed,
        },
    )
    .await?
    .ok_or_else(|| ApiError::not_found("todo not found"))?;

    Ok(Json(todo))
}
