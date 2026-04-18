from sqlalchemy import create_engine, inspect, text, event
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


def _asegurar_columna_activo_usuarios():
    inspector = inspect(engine)
    columnas = {columna["name"] for columna in inspector.get_columns("usuarios")}

    if "activo" not in columnas:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE usuarios ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1"))


def _asegurar_cascade_artistas_favoritos():
    inspector = inspect(engine)
    tablas = set(inspector.get_table_names())

    if "artistas_favoritos" not in tablas:
        return

    with engine.begin() as conn:
        fk_rows = conn.execute(text("PRAGMA foreign_key_list('artistas_favoritos')")).fetchall()

        # PRAGMA foreign_key_list devuelve columnas:
        # (id, seq, table, from, to, on_update, on_delete, match)
        tiene_cascade_festival = any(
            row[2] == "festivales" and str(row[6]).upper() == "CASCADE" for row in fk_rows
        )
        tiene_cascade_usuario = any(
            row[2] == "usuarios" and str(row[6]).upper() == "CASCADE" for row in fk_rows
        )

        if tiene_cascade_festival and tiene_cascade_usuario:
            return

        # Recreamos la tabla para actualizar FKs a ON DELETE CASCADE en SQLite
        conn.execute(text("PRAGMA foreign_keys=OFF"))
        conn.execute(text("ALTER TABLE artistas_favoritos RENAME TO artistas_favoritos_old"))
        conn.execute(text("""
            CREATE TABLE artistas_favoritos (
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                usuario_email VARCHAR(255) NOT NULL,
                nombre_artista VARCHAR(255) NOT NULL,
                id_festival VARCHAR(100) NOT NULL,
                fecha_favorito DATETIME NOT NULL,
                CONSTRAINT uq_usuario_artista_festival UNIQUE (usuario_email, nombre_artista, id_festival),
                FOREIGN KEY(usuario_email) REFERENCES usuarios (email) ON DELETE CASCADE,
                FOREIGN KEY(id_festival) REFERENCES festivales (id) ON DELETE CASCADE
            )
        """))
        conn.execute(text("""
            INSERT INTO artistas_favoritos (id, usuario_email, nombre_artista, id_festival, fecha_favorito)
            SELECT id, usuario_email, nombre_artista, id_festival, fecha_favorito
            FROM artistas_favoritos_old
        """))
        conn.execute(text("DROP TABLE artistas_favoritos_old"))
        conn.execute(text("PRAGMA foreign_keys=ON"))

_asegurar_columna_activo_usuarios()
_asegurar_cascade_artistas_favoritos()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()