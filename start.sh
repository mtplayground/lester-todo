#!/bin/sh
set -eu

db_path="${DATABASE_URL#sqlite:}"
db_path="${db_path%%\?*}"

case "$db_path" in
  /*)
    mkdir -p "$(dirname "$db_path")"
    sqlite3 "$db_path" "PRAGMA journal_mode=WAL;" >/dev/null
    ;;
esac

exec /usr/local/bin/lester-todo
