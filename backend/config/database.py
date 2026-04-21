import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from model.models import Base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://subsonic_user:subsonic_password@mysql:3306/subsonic_festival?charset=utf8mb4",
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

# Creación de las tablas en la base de datos
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()