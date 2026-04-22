use std::fs;

use axum::body::{to_bytes, Body};
use axum::http::{Request, StatusCode};
use backend::{build_app, db, models::todo::Todo};
use serde_json::{json, Value};
use sqlx::sqlite::SqlitePoolOptions;
use tempfile::TempDir;
use tower::util::ServiceExt;

struct TestContext {
    app: axum::Router,
    _static_dir: TempDir,
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

#[tokio::test]
async fn create_and_list_todos() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let context = setup().await?;

    let created = create_todo(&context.app, "  Buy milk  ").await?;
    assert_eq!(created.title, "Buy milk");
    assert!(!created.completed);

    let response = context
        .app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/todos")
                .body(Body::empty())?,
        )
        .await?;

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX).await?;
    let todos = serde_json::from_slice::<Vec<Todo>>(&body)?;

    assert_eq!(todos.len(), 1);
    assert_eq!(todos[0].title, "Buy milk");

    Ok(())
}

#[tokio::test]
async fn update_todo_happy_path() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let context = setup().await?;
    let created = create_todo(&context.app, "Ship feature").await?;

    let response = context
        .app
        .clone()
        .oneshot(
            Request::builder()
                .method("PATCH")
                .uri(format!("/api/todos/{}", created.id))
                .header("content-type", "application/json")
                .body(Body::from(
                    json!({
                        "title": "Ship finished feature",
                        "completed": true
                    })
                    .to_string(),
                ))?,
        )
        .await?;

    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX).await?;
    let updated = serde_json::from_slice::<Todo>(&body)?;

    assert_eq!(updated.title, "Ship finished feature");
    assert!(updated.completed);

    Ok(())
}

#[tokio::test]
async fn delete_todo_happy_path() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let context = setup().await?;
    let created = create_todo(&context.app, "Delete me").await?;

    let response = context
        .app
        .clone()
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri(format!("/api/todos/{}", created.id))
                .body(Body::empty())?,
        )
        .await?;

    assert_eq!(response.status(), StatusCode::NO_CONTENT);

    let list_response = context
        .app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/todos")
                .body(Body::empty())?,
        )
        .await?;

    let body = to_bytes(list_response.into_body(), usize::MAX).await?;
    let todos = serde_json::from_slice::<Vec<Todo>>(&body)?;

    assert!(todos.is_empty());

    Ok(())
}

#[tokio::test]
async fn returns_validation_and_not_found_errors(
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let context = setup().await?;

    let invalid_create = context
        .app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/todos")
                .header("content-type", "application/json")
                .body(Body::from(json!({ "title": "   " }).to_string()))?,
        )
        .await?;

    assert_eq!(invalid_create.status(), StatusCode::BAD_REQUEST);

    let invalid_patch = context
        .app
        .clone()
        .oneshot(
            Request::builder()
                .method("PATCH")
                .uri("/api/todos/999")
                .header("content-type", "application/json")
                .body(Body::from(json!({ "completed": true }).to_string()))?,
        )
        .await?;

    assert_eq!(invalid_patch.status(), StatusCode::NOT_FOUND);

    let invalid_delete = context
        .app
        .clone()
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri("/api/todos/999")
                .body(Body::empty())?,
        )
        .await?;

    assert_eq!(invalid_delete.status(), StatusCode::NOT_FOUND);

    let body = to_bytes(invalid_create.into_body(), usize::MAX).await?;
    let payload = serde_json::from_slice::<Value>(&body)?;
    assert_eq!(payload["error"]["code"], "bad_request");

    Ok(())
}
