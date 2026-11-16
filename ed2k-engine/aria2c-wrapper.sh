#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
for arg in "$@"; do
  if [ "$arg" = "--version" ] || [ "$arg" = "-v" ]; then
    echo "aria2 version 3.1.0-motrix-ed2k"
    exit 0
  fi
done
args=()
for arg in "$@"; do
  case "$arg" in
    --enable-sqlite3-persistence=*|--sqlite3-db-path=*|--sqlite3-history-limit=*) ;;
    *) args+=("$arg") ;;
  esac
done
exec "$DIR/aria2-next" "${args[@]}"
