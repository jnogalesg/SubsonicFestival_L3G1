# definición de las tablas de la base de datos
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint, JSON
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

# TABLA FESTIVALES
class Festivales(Base):
    __tablename__ = 'festivales' # nombre de la tabla en la base de datos

    id = Column(String(100), primary_key=True) # usamos String porque los id son por ejemplo así: evento-belgium
    titulo = Column(String(200))
    pais = Column(String(100))
    ubicacion = Column(String(255))
    fechas = Column(String(100))
    desc = Column(Text) # Text permite textos más largos que String
    img = Column(String(255))
    
    # Guardamos las listas y diccionarios completos usando JSON
    tagsBusqueda = Column(JSON)
    precios = Column(JSON)
    servicios = Column(JSON)
    horarios = Column(JSON)


# class Tienda(Base):
#     __tablename__ = 'tienda'