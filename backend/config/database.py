from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from model.models import Base

# Creacion del motor que se conecta a SQLite
engine = create_engine(
    "sqlite:///./subsonic.db", 
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