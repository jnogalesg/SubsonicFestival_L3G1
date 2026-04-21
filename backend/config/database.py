import os
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from model.models import Base

def _resolve_db_path() -> Path:
    env_path = os.getenv("DATABASE_PATH")
    if env_path:
        return Path(env_path)

    docker_path = Path("/app/data/subsonic.db")
    if docker_path.parent.exists():
        return docker_path

    repo_path = Path(__file__).resolve().parents[2] / "backend_data" / "subsonic.db"
    if repo_path.parent.exists():
        return repo_path

    return Path(__file__).resolve().parent.parent / "data" / "subsonic.db"


DB_PATH = _resolve_db_path()
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

# Creacion del motor que se conecta a SQLite
engine = create_engine(
    f"sqlite:///{DB_PATH.as_posix()}",
    connect_args={"check_same_thread": False} # para conectar FastAPI con SQLite
)

# Habilitar foreign keys en SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

# Creación de las tablas en la base de datos
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()