# lester-todo

`lester-todo` is a full-stack todo application with a Rust backend and a React frontend.

## Stack

- Backend: Rust, Axum, SQLx, SQLite
- Frontend: React, Vite, TypeScript, Tailwind CSS
- Data fetching: TanStack Query
- Container workflow: multi-stage Docker build + Docker Compose

## Repository layout

```text
.
├── backend/
│   ├── migrations/
│   ├── src/
│   ├── tests/
│   ├── Cargo.toml
│   └── Cargo.lock
├── frontend/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Local development

### Backend

```bash
cd backend
export DATABASE_URL=sqlite://lester-todo.db
export PORT=8080
export STATIC_DIR=../frontend/dist
cargo run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API endpoints

- `GET /api/health`
- `GET /api/todos`
- `POST /api/todos`
- `PATCH /api/todos/:id`
- `DELETE /api/todos/:id`

## Docker

### Build the image

```bash
docker build -t lester-todo:latest .
```

### Run with Compose

```bash
docker compose up --build
```

The app is served on `http://localhost:8080`.

### Stop the stack

```bash
docker compose down
```

### Verify SQLite persistence across restarts

1. Start the stack with `docker compose up --build`.
2. Create one or more todos in the UI at `http://localhost:8080`.
3. Stop the stack with `docker compose down`.
4. Start it again with `docker compose up`.
5. Reload the page and confirm the todos are still present.

The persistence is backed by the named Docker volume declared in [docker-compose.yml](/workspace/docker-compose.yml) as `lester_todo_data`.

## Container configuration

- `Dockerfile`
  Three stages: frontend build, backend build, runtime image.
- `docker-compose.yml`
  Runs the backend service and mounts a named `/data` volume for SQLite.
- Runtime environment
  `DATABASE_URL=sqlite:///data/lester-todo.db`
  `PORT=8080`
  `STATIC_DIR=/app/frontend/dist`

## Notes

- The backend serves the built frontend assets in production.
- The frontend dev server is intended for local iteration, while Docker Compose uses the production build.
