from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from model.models import Base

# Creacion del motor que se conecta a SQLite
engine = create_engine(
    "sqlite:///./subsonic.db", 
    connect_args={"check_same_thread": False} # para conectar FastAPI con SQLite
)

# Creación de las tablas en la base de datos
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)