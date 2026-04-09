# definición de las tablas de la base de datos
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint, Float, Integer 
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
    ciudad = Column(String(100))
    rol = Column(String(50), default='cliente') # 'usuario' o 'admin'

# class Festivales(Base):
#     __tablename__ = 'festivales'


class Producto(Base):
    __tablename__ = "productos" # El nombre de la tabla en SQLite

    id_producto = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String)
    precio = Column(Float, nullable=False)
    imagen = Column(String)
    stock = Column(Integer, default=0)