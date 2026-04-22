# Self-check: host `cargo build --release` succeeded with rustc 1.95.0, so PATH A is used.
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libssl3 sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/target/release/backend /usr/local/bin/lester-todo
COPY frontend/dist /app/frontend/dist
COPY .env /app/.env
COPY start.sh /app/start.sh

RUN chmod +x /app/start.sh \
    && mkdir -p /app/data /app/frontend/dist

ENV DATABASE_URL=sqlite:/app/data/data.db?mode=rwc
ENV PORT=8080
ENV STATIC_DIR=/app/frontend/dist

EXPOSE 8080

CMD ["/app/start.sh"]
