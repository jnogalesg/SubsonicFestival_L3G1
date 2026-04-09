# definición de las tablas de la base de datos
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime, timezone

# clase base de la que heredarán todas las tablas
Base = declarative_base()

# TABLA USUARIOS
class Usuarios(Base):
    __tablename__ = 'usuarios' # nombre de la tabla en la base de datos

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100))
    apellidos = Column(String(255))
    email = Column(String(255), unique=True)
    # contraseña = Column(String(255))
    ciudad = Column(String(100))
    fechaRegistro = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    rutaImagen = Column(String(255), nullable=True)
    rol = Column(String(50), default='cliente') # 'usuario' o 'admin'

# class Festivales(Base):
#     __tablename__ = 'festivales'


# class Tienda(Base):
#     __tablename__ = 'tienda'