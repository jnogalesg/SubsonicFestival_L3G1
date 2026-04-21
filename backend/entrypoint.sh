#!/bin/sh
set -e

DATABASE_URL="${DATABASE_URL:-mysql+pymysql://subsonic_user:subsonic_password@mysql:3306/subsonic_festival?charset=utf8mb4}"

echo "[backend] Esperando a MySQL..."
python - "$DATABASE_URL" <<'PY'
import sys
import time
from sqlalchemy import create_engine, text

database_url = sys.argv[1]
engine = create_engine(database_url, pool_pre_ping=True)

for attempt in range(60):
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("[backend] MySQL disponible")
        break
    except Exception:
        if attempt == 59:
            raise
        time.sleep(2)
PY

SEED_DECISION=$(python - "$DATABASE_URL" <<'PY'
import sys
from sqlalchemy import create_engine, text

database_url = sys.argv[1]
engine = create_engine(database_url, pool_pre_ping=True)

try:
    with engine.connect() as conn:
        table_count = conn.execute(
            text(
                """
                SELECT COUNT(*)
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                  AND table_name = 'usuarios'
                """
            )
        ).scalar() or 0

        if table_count == 0:
            print('seed')
        else:
            count = conn.execute(text("SELECT COUNT(*) FROM usuarios")).scalar() or 0
            print('seed' if count == 0 else 'skip')
except Exception:
    print('seed')
PY
)

if [ "$SEED_DECISION" = "seed" ]; then
    echo "[backend] Inicializando base de datos con datos de ejemplo..."
    python scripts/poblar_bd.py
else
    echo "[backend] Base de datos existente detectada. Se omite poblado inicial."
fi

exec uvicorn main:app --host 0.0.0.0 --port 8000
