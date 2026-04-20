#!/bin/sh
set -e

SEED_DECISION=$(python - <<'PY'
import sqlite3
from pathlib import Path

DB_PATH = Path('/app/subsonic.db')

if not DB_PATH.exists():
    print('seed')
else:
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'")
        if cur.fetchone() is None:
            print('seed')
        else:
            cur.execute('SELECT COUNT(*) FROM usuarios')
            count = cur.fetchone()[0] or 0
            print('seed' if count == 0 else 'skip')

        conn.close()
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
