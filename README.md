# lester-todo

`lester-todo` is a full-stack todo application with a Rust backend and a React frontend.

## Current status

Issue #1 establishes the repository baseline:

- repo-level `.gitignore`
- `backend/` Rust binary crate
- Axum HTTP server listening on `0.0.0.0:8080`

## Repository layout

```text
.
├── backend/
│   ├── Cargo.toml
│   └── src/
│       └── main.rs
└── README.md
```

## Run the backend

```bash
cd backend
cargo run
```

The server responds on `GET /` with a simple health message.
