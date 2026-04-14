# definición de las tablas de la base de datos
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, UniqueConstraint
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
    rol = Column(String(50), default='cliente') # 'cliente', 'proveedor' o 'admin'

    # relación con entradas
    entradas = relationship("Entradas", back_populates="comprador")


# TABLA ENTRADAS
class Entradas(Base):
    __tablename__ = 'entradas'

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_entrada = Column(String(50), unique=True)       # identificador legible, ej: "entrada-abc12345"
    id_festival = Column(String(100))                  # id del festival, ej: "evento-belgium"
    evento = Column(String(255))                       # nombre del festival
    fecha = Column(String(100))                        # fechas en texto, ej: "18 – 27 Julio 2026"
    lugar = Column(String(255))                        # lugar del festival
    tipo = Column(String(50))                          # "Day Pass" o "Weekend Pass"
    precio = Column(Float)
    estado = Column(String(50), default='activa')      # 'activa', 'cancelada', 'cancelacion_solicitada'
    comprador_nombre = Column(String(255))
    comprador_email = Column(String(255), ForeignKey('usuarios.email'))
    codigo_qr = Column(String(100))
    solicitud_cancelacion = Column(Boolean, default=False)
    motivo_cancelacion = Column(Text, nullable=True)

    # relación con usuarios
    comprador = relationship("Usuarios", back_populates="entradas")