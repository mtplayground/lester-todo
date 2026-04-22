FROM node:20-bookworm-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


FROM rust:1-bookworm AS backend-build

WORKDIR /app/backend

RUN apt-get update \
    && apt-get install -y --no-install-recommends pkg-config libsqlite3-dev ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY backend/Cargo.toml backend/Cargo.lock ./
COPY backend/src ./src
COPY backend/migrations ./migrations

RUN cargo build --release


FROM debian:bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN mkdir -p /app/backend/migrations /app/frontend/dist /data

COPY --from=backend-build /app/backend/target/release/backend /usr/local/bin/lester-todo
COPY --from=backend-build /app/backend/migrations /app/backend/migrations
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

ENV DATABASE_URL=sqlite:///data/lester-todo.db
ENV PORT=8080
ENV STATIC_DIR=/app/frontend/dist

EXPOSE 8080
VOLUME ["/data"]

CMD ["lester-todo"]
