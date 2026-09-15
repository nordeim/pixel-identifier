#!/bin/sh
# Round-4 plan R2: bring the database schema up to date, then serve.
# Set RUN_DB_PUSH=false to skip (e.g. when the schema is managed externally).
set -e

if [ "$RUN_DB_PUSH" != "false" ]; then
  echo "[entrypoint] prisma db push …"
  node node_modules/prisma/build/index.js db push --skip-generate --schema prisma/schema.prisma
fi

echo "[entrypoint] starting pixelco on :${PORT}"
exec node server.js
