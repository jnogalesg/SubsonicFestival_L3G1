from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from model.models import Base

# Creacion del motor que se conecta a SQLite
engine = create_engine(
    "sqlite:///./subsonic.db", 
    connect_args={"check_same_thread": False} # para conectar FastAPI con SQLite
)

# Creación de las tablas en la base de datos
Base.metadata.create_all(bind=engine)


def _asegurar_columna_activo_usuarios():
    inspector = inspect(engine)
    columnas = {columna["name"] for columna in inspector.get_columns("usuarios")}

    if "activo" not in columnas:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE usuarios ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1"))


_asegurar_columna_activo_usuarios()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)