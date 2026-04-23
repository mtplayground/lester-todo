use sqlx::SqlitePool;

use crate::models::todo::{NewTodo, Todo, UpdateTodo};

#[derive(Debug, sqlx::FromRow)]
pub struct TodoStats {
    pub total: i64,
    pub active: i64,
    pub completed: i64,
    pub oldest_created_at: Option<String>,
    pub newest_created_at: Option<String>,
}

pub async fn list(pool: &SqlitePool) -> Result<Vec<Todo>, sqlx::Error> {
    sqlx::query_as::<_, Todo>(
        r#"
        SELECT id, title, completed, created_at, updated_at
        FROM todos
        ORDER BY created_at DESC, id DESC
        "#,
    )
    .fetch_all(pool)
    .await
}

pub async fn stats(pool: &SqlitePool) -> Result<TodoStats, sqlx::Error> {
    sqlx::query_as::<_, TodoStats>(
        r#"
        SELECT
            COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END), 0) AS active,
            COALESCE(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END), 0) AS completed,
            MIN(created_at) AS oldest_created_at,
            MAX(created_at) AS newest_created_at
        FROM todos
        "#,
    )
    .fetch_one(pool)
    .await
}

pub async fn create(pool: &SqlitePool, new_todo: &NewTodo) -> Result<Todo, sqlx::Error> {
    sqlx::query_as::<_, Todo>(
        r#"
        INSERT INTO todos (title)
        VALUES (?)
        RETURNING id, title, completed, created_at, updated_at
        "#,
    )
    .bind(&new_todo.title)
    .fetch_one(pool)
    .await
}

pub async fn get(pool: &SqlitePool, id: i64) -> Result<Option<Todo>, sqlx::Error> {
    sqlx::query_as::<_, Todo>(
        r#"
        SELECT id, title, completed, created_at, updated_at
        FROM todos
        WHERE id = ?
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await
}

pub async fn update(
    pool: &SqlitePool,
    id: i64,
    changes: &UpdateTodo,
) -> Result<Option<Todo>, sqlx::Error> {
    sqlx::query_as::<_, Todo>(
        r#"
        UPDATE todos
        SET
            title = COALESCE(?, title),
            completed = COALESCE(?, completed),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING id, title, completed, created_at, updated_at
        "#,
    )
    .bind(&changes.title)
    .bind(changes.completed)
    .bind(id)
    .fetch_optional(pool)
    .await
}

pub async fn delete(pool: &SqlitePool, id: i64) -> Result<bool, sqlx::Error> {
    let result = sqlx::query(
        r#"
        DELETE FROM todos
        WHERE id = ?
        "#,
    )
    .bind(id)
    .execute(pool)
    .await?;

    Ok(result.rows_affected() > 0)
}
