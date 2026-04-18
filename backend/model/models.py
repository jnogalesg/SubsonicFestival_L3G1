# definición de las tablas de la base de datos
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint, Float, Integer, Boolean, JSON
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
    direccion = Column(String(100))
    telefono = Column(String(20))
    rol = Column(String(50), default='cliente') # 'usuario' o 'admin'
    activo = Column(Boolean, nullable=False, default=True)
    
    # campos exclusivos para proveedores
    tipo_servicio = Column(String(100), nullable=True) 
    descripcion_servicio = Column(Text, nullable=True)

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

class Producto(Base):
    __tablename__ = "productos" # El nombre de la tabla en SQLite

    id_producto = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String)
    precio = Column(Float, nullable=False)
    imagen = Column(String)
    stock = Column(Integer, default=0)


# TABLA ESPACIOS
class Espacios(Base):
    __tablename__ = 'espacios'

    id = Column(Integer, primary_key=True, autoincrement=True)
    espacio_id = Column(String(50), unique=True, nullable=False)
    tipo = Column(String(100), nullable=False)
    tamaño = Column(String(100), nullable=True)
    ubicacion = Column(String(255), nullable=True)
    precio = Column(Float, nullable=False)
    disponibilidad = Column(Boolean, nullable=False, default=True)
    id_festival = Column(String(100), nullable=False)
    desc = Column(Text, nullable=True)
    dimensiones = Column(String(100), nullable=True)
    servicios = Column(Text, nullable=True)  # guarda lista como JSON o texto separado por comas

    alquileres = relationship("Alquileres", back_populates="espacio")


# TABLA ALQUILERES
class Alquileres(Base):
    __tablename__ = 'alquileres'

    id = Column(Integer, primary_key=True, autoincrement=True)
    espacio_id = Column(String(50), ForeignKey('espacios.espacio_id'), nullable=False)
    proveedor_id = Column(String(100), nullable=False)
    evento_id = Column(String(100), nullable=False)
    fecha_ini = Column(DateTime, nullable=False)
    fecha_fin = Column(DateTime, nullable=False)
    comentarios = Column(Text, nullable=True)
    estado = Column(String(50), nullable=False, default='pendiente')

    espacio = relationship("Espacios", back_populates="alquileres")
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
