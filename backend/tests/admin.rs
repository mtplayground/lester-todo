use std::fs;

use axum::body::{to_bytes, Body};
use axum::http::{Request, StatusCode};
use backend::{build_app, db, models::todo::Todo};
use serde::Deserialize;
use serde_json::json;
use sqlx::sqlite::SqlitePoolOptions;
use tempfile::TempDir;
use tower::util::ServiceExt;

struct TestContext {
    app: axum::Router,
    _static_dir: TempDir,
}

#[derive(Debug, Deserialize)]
struct AdminStatsResponse {
    total: i64,
    active: i64,
    completed: i64,
    oldest_created_at: Option<String>,
    newest_created_at: Option<String>,
}

#[derive(Debug, Deserialize)]
struct BulkDeleteResponse {
    deleted: u64,
}

async fn setup() -> Result<TestContext, Box<dyn std::error::Error + Send + Sync>> {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await?;

    db::run_migrations(&pool).await?;

    let static_dir = tempfile::tempdir()?;
    fs::write(static_dir.path().join("index.html"), "<!doctype html><title>test</title>")?;

    Ok(TestContext {
        app: build_app(pool, static_dir.path().to_path_buf()),
        _static_dir: static_dir,
    })
}

async fn create_todo(
    app: &axum::Router,
    title: &str,
) -> Result<Todo, Box<dyn std::error::Error + Send + Sync>> {
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/todos")
                .header("content-type", "application/json")
                .body(Body::from(json!({ "title": title }).to_string()))?,
        )
        .await?;

    assert_eq!(response.status(), StatusCode::CREATED);

    let body = to_bytes(response.into_body(), usize::MAX).await?;

    Ok(serde_json::from_slice::<Todo>(&body)?)
}

async fn update_todo_completed(
    app: &axum::Router,
    id: i64,
    completed: bool,
) -> Result<Todo, Box<dyn std::error::Error + Send + Sync>> {
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("PATCH")
                .uri(format!("/api/todos/{id}"))
                .header("content-type", "application/json")
                .body(Body::from(json!({ "completed": completed }).to_string()))?,
        )
        .await?;

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX).await?;

    Ok(serde_json::from_slice::<Todo>(&body)?)
}

async fn list_todos(
    app: &axum::Router,
) -> Result<Vec<Todo>, Box<dyn std::error::Error + Send + Sync>> {
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/todos")
                .body(Body::empty())?,
        )
        .await?;

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX).await?;

    Ok(serde_json::from_slice::<Vec<Todo>>(&body)?)
}

async fn fetch_admin_stats(
    app: &axum::Router,
) -> Result<AdminStatsResponse, Box<dyn std::error::Error + Send + Sync>> {
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/admin/stats")
                .body(Body::empty())?,
        )
        .await?;

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX).await?;

    Ok(serde_json::from_slice::<AdminStatsResponse>(&body)?)
}

async fn clear_completed(
    app: &axum::Router,
) -> Result<BulkDeleteResponse, Box<dyn std::error::Error + Send + Sync>> {
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri("/api/admin/todos/completed")
                .body(Body::empty())?,
        )
        .await?;

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX).await?;

    Ok(serde_json::from_slice::<BulkDeleteResponse>(&body)?)
}

async fn delete_all(
    app: &axum::Router,
) -> Result<BulkDeleteResponse, Box<dyn std::error::Error + Send + Sync>> {
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri("/api/admin/todos")
                .body(Body::empty())?,
        )
        .await?;

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX).await?;

    Ok(serde_json::from_slice::<BulkDeleteResponse>(&body)?)
}

#[tokio::test]
async fn admin_stats_empty_table() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let context = setup().await?;

    let stats = fetch_admin_stats(&context.app).await?;

    assert_eq!(stats.total, 0);
    assert_eq!(stats.active, 0);
    assert_eq!(stats.completed, 0);
    assert_eq!(stats.oldest_created_at, None);
    assert_eq!(stats.newest_created_at, None);

    Ok(())
}

#[tokio::test]
async fn admin_stats_reflect_varied_todos(
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let context = setup().await?;

    let first = create_todo(&context.app, "First").await?;
    let second = create_todo(&context.app, "Second").await?;
    let third = create_todo(&context.app, "Third").await?;

    update_todo_completed(&context.app, first.id, true).await?;
    update_todo_completed(&context.app, third.id, true).await?;

    let stats = fetch_admin_stats(&context.app).await?;
    let timestamps = [
        first.created_at.clone(),
        second.created_at.clone(),
        third.created_at.clone(),
    ];
    let expected_oldest = timestamps.iter().min().cloned();
    let expected_newest = timestamps.iter().max().cloned();

    assert_eq!(stats.total, 3);
    assert_eq!(stats.active, 1);
    assert_eq!(stats.completed, 2);
    assert_eq!(stats.oldest_created_at, expected_oldest);
    assert_eq!(stats.newest_created_at, expected_newest);

    Ok(())
}

#[tokio::test]
async fn clear_completed_returns_zero_for_empty_table(
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let context = setup().await?;

    let response = clear_completed(&context.app).await?;
    let todos = list_todos(&context.app).await?;

    assert_eq!(response.deleted, 0);
    assert!(todos.is_empty());

    Ok(())
}

#[tokio::test]
async fn clear_completed_deletes_only_completed_todos(
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let context = setup().await?;

    let active = create_todo(&context.app, "Keep active").await?;
    let completed_one = create_todo(&context.app, "Complete one").await?;
    let completed_two = create_todo(&context.app, "Complete two").await?;

    update_todo_completed(&context.app, completed_one.id, true).await?;
    update_todo_completed(&context.app, completed_two.id, true).await?;

    let response = clear_completed(&context.app).await?;
    let todos = list_todos(&context.app).await?;

    assert_eq!(response.deleted, 2);
    assert_eq!(todos.len(), 1);
    assert_eq!(todos[0].id, active.id);
    assert!(!todos[0].completed);

    Ok(())
}

#[tokio::test]
async fn delete_all_returns_zero_for_empty_table(
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let context = setup().await?;

    let response = delete_all(&context.app).await?;
    let todos = list_todos(&context.app).await?;

    assert_eq!(response.deleted, 0);
    assert!(todos.is_empty());

    Ok(())
}

#[tokio::test]
async fn delete_all_removes_every_todo() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let context = setup().await?;

    let first = create_todo(&context.app, "First").await?;
    let second = create_todo(&context.app, "Second").await?;
    update_todo_completed(&context.app, first.id, true).await?;
    update_todo_completed(&context.app, second.id, false).await?;

    let response = delete_all(&context.app).await?;
    let todos = list_todos(&context.app).await?;
    let stats = fetch_admin_stats(&context.app).await?;

    assert_eq!(response.deleted, 2);
    assert!(todos.is_empty());
    assert_eq!(stats.total, 0);
    assert_eq!(stats.active, 0);
    assert_eq!(stats.completed, 0);

    Ok(())
}
