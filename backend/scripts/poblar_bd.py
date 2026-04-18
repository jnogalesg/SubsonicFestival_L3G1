"""
Script para poblar la base de datos.
Ejecútalo desde la carpeta backend:

    cd backend
    python scripts/poblar_bd.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import SessionLocal, engine
from model.models import Base, Usuarios, Festivales, Entradas, Producto, Espacios

# Crear todas las tablas si no existen
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # ─────────────────────────────────────────────
    # USUARIOS 
    # ─────────────────────────────────────────────
    usuarios = [
        Usuarios(
            nombre="David",
            apellidos="García López",
            email="cliente@subsonic.com",
            direccion="Calle Mayor 10, Cáceres",
            telefono="+34 600 111 222",
            rol="cliente",
            activo=True,
        ),
        Usuarios(
            nombre="Ana",
            apellidos="Martínez Ruiz",
            email="proveedor@subsonic.com",
            direccion="Avenida de la Paz 5, Madrid",
            telefono="+34 600 333 444",
            rol="proveedor",
            activo=True,
            tipo_servicio="Food & Beverage",
            descripcion_servicio="Puesto de comida y bebida artesanal para festivales.",
        ),
        Usuarios(
            nombre="Jose",
            apellidos="Nogales Sánchez",
            email="admin@subsonic.com",
            direccion="Plaza de España 1, Sevilla",
            telefono="+34 600 555 666",
            rol="admin",
            activo=True,
        ),
    ]

    for u in usuarios:
        existe = db.query(Usuarios).filter(Usuarios.email == u.email).first()
        if not existe:
            db.add(u)

    db.commit()
    print("✅ Usuarios creados")

    # ─────────────────────────────────────────────
    # FESTIVALES 
    # ─────────────────────────────────────────────
    festivales = [
        Festivales(
            id="evento-belgium",
            titulo="Subsonic Belgium",
            pais="Bélgica",
            ubicacion="Dreamville Grounds, Boom",
            fechas="18 – 27 Julio 2026",
            desc="La experiencia definitiva de música electrónica en los campos de Bélgica. Tres escenarios, más de 50 artistas internacionales y un ambiente único.",
            img="/subsonic_belgica.jpg",
            tagsBusqueda=["techno", "house", "trance", "belgium", "verano"],
            precios={"day": 89, "weekend": 199},
            servicios=[
                "Zona de acampada premium",
                "Food trucks internacionales",
                "Servicio médico 24h",
                "Transporte lanzadera",
                "Consigna de equipaje",
                "Zona de descanso",
            ],
            horarios=[
                {
                    "stage": "Main Stage",
                    "acts": [
                        {"artist": "Martin Garrix", "time": "22:00 – 00:00"},
                        {"artist": "Tiësto", "time": "00:00 – 02:00"},
                        {"artist": "David Guetta", "time": "02:00 – 04:00"},
                    ],
                },
                {
                    "stage": "Trance Stage",
                    "acts": [
                        {"artist": "Armin van Buuren", "time": "21:00 – 23:00"},
                        {"artist": "Above & Beyond", "time": "23:00 – 01:00"},
                    ],
                },
            ],
        ),
        Festivales(
            id="evento-thailand",
            titulo="Subsonic Thailand",
            pais="Tailandia",
            ubicacion="Maya Festival Site, Pattaya",
            fechas="8 – 17 Agosto 2026",
            desc="Sumérgete en la vibrante escena electrónica tailandesa con vistas al mar y los mejores DJs del mundo.",
            img="/subsonic_tailandia.jpg",
            tagsBusqueda=["techno", "house", "asia", "verano", "playa"],
            precios={"day": 75, "weekend": 160},
            servicios=[
                "Zona VIP con piscina",
                "Restaurantes temáticos",
                "Servicio médico 24h",
                "Transporte desde Bangkok",
                "Zona de relax en la playa",
            ],
            horarios=[
                {
                    "stage": "Ocean Stage",
                    "acts": [
                        {"artist": "Hardwell", "time": "21:00 – 23:00"},
                        {"artist": "Afrojack", "time": "23:00 – 01:00"},
                        {"artist": "Steve Aoki", "time": "01:00 – 03:00"},
                    ],
                },
                {
                    "stage": "Jungle Stage",
                    "acts": [
                        {"artist": "Skrillex", "time": "22:00 – 00:00"},
                        {"artist": "Diplo", "time": "00:00 – 02:00"},
                    ],
                },
            ],
        ),
        Festivales(
            id="evento-brasil",
            titulo="Subsonic Brasil",
            pais="Brasil",
            ubicacion="Sambódromo, São Paulo",
            fechas="12 – 21 Septiembre 2026",
            desc="La energía de Brasil combinada con los mejores ritmos electrónicos del planeta. Una experiencia única en el corazón de São Paulo.",
            img="/subsonic_brasil.jpg",
            tagsBusqueda=["techno", "house", "brasil", "latinoamerica"],
            precios={"day": 65, "weekend": 140},
            servicios=[
                "Zona de samba interactiva",
                "Gastronomía brasileña",
                "Servicio médico 24h",
                "Traslados desde el aeropuerto",
                "Zona de acampada",
            ],
            horarios=[
                {
                    "stage": "Carnival Stage",
                    "acts": [
                        {"artist": "Alok", "time": "21:00 – 23:00"},
                        {"artist": "Anitta", "time": "23:00 – 01:00"},
                        {"artist": "David Guetta", "time": "01:00 – 03:00"},
                    ],
                },
            ],
        ),
    ]

    for f in festivales:
        existe = db.query(Festivales).filter(Festivales.id == f.id).first()
        if not existe:
            db.add(f)

    db.commit()
    print("✅ Festivales creados")

    # ─────────────────────────────────────────────
    # ENTRADAS 
    # ─────────────────────────────────────────────
    entradas = [
        Entradas(
            id_entrada="entrada-test-001",
            id_festival="evento-belgium",
            evento="Subsonic Belgium",
            fecha="18 – 27 Julio 2026",
            lugar="Dreamville Grounds, Boom",
            tipo="Weekend Pass",
            precio=199.0,
            estado="activa",
            comprador_nombre="David García López",
            comprador_email="cliente@subsonic.com",
            codigo_qr="QR-BE2026-001",
            solicitud_cancelacion=False,
        ),
        Entradas(
            id_entrada="entrada-test-002",
            id_festival="evento-thailand",
            evento="Subsonic Thailand",
            fecha="8 – 17 Agosto 2026",
            lugar="Maya Festival Site, Pattaya",
            tipo="Day Pass",
            precio=75.0,
            estado="activa",
            comprador_nombre="David García López",
            comprador_email="cliente@subsonic.com",
            codigo_qr="QR-TH2026-001",
            solicitud_cancelacion=False,
        ),
        Entradas(
            id_entrada="entrada-test-003",
            id_festival="evento-brasil",
            evento="Subsonic Brasil",
            fecha="12 – 21 Septiembre 2026",
            lugar="Sambódromo, São Paulo",
            tipo="Day Pass",
            precio=65.0,
            estado="cancelada",
            comprador_nombre="David García López",
            comprador_email="cliente@subsonic.com",
            codigo_qr="QR-BR2026-001",
            solicitud_cancelacion=True,
            motivo_cancelacion="Cancelación solicitada por el usuario",
        ),
    ]

    for e in entradas:
        existe = db.query(Entradas).filter(Entradas.id_entrada == e.id_entrada).first()
        if not existe:
            db.add(e)

    db.commit()
    print("✅ Entradas creadas")

    # ─────────────────────────────────────────────
    # PRODUCTOS 
    # ─────────────────────────────────────────────
    productos = [
        Producto(id_producto="M001", nombre="Camiseta Oficial", descripcion="Tallas: XS/ S / M / L / XL", precio=29.99, imagen="camiseta.jpg", stock=150),
        Producto(id_producto="M002", nombre="Gorra Black", descripcion="Talla Única Ajustable", precio=19.99, imagen="gorra.jpg", stock=100),
        Producto(id_producto="M003", nombre="Sudadera Red", descripcion="Tallas: XS/ S / M / L / XL", precio=49.99, imagen="sudadera.jpg", stock=0),
    ]

    for p in productos:
        existe = db.query(Producto).filter(Producto.id_producto == p.id_producto).first()
        if not existe:
            db.add(p)

    db.commit()
    print("✅ Productos creados")

    # ─────────────────────────────────────────────
    # ESPACIOS (para proveedores)
    # ─────────────────────────────────────────────
    espacios = [
        Espacios(
            espacio_id="espacio-001",
            tipo="Food & Beverage",
            tamaño="Grande",
            ubicacion="Zona A - Entrada Principal",
            precio=1500.0,
            disponibilidad=True,
            id_festival="evento-belgium",
            desc="Espacio amplio para puesto de comida y bebida cerca de la entrada principal.",
            dimensiones="10x10m",
            servicios="Electricidad,Agua,Mostrador",
        ),
        Espacios(
            espacio_id="espacio-002",
            tipo="Merchandising",
            tamaño="Mediano",
            ubicacion="Zona B - Main Stage",
            precio=900.0,
            disponibilidad=True,
            id_festival="evento-belgium",
            desc="Espacio para venta de merchandising junto al escenario principal.",
            dimensiones="5x5m",
            servicios="Electricidad,Mostrador",
        ),
        Espacios(
            espacio_id="espacio-003",
            tipo="Food & Beverage",
            tamaño="Pequeño",
            ubicacion="Zona C - Camping",
            precio=600.0,
            disponibilidad=False,
            id_festival="evento-thailand",
            desc="Puesto pequeño para servicio de bebidas en la zona de acampada.",
            dimensiones="3x3m",
            servicios="Electricidad",
        ),
    ]

    for esp in espacios:
        existe = db.query(Espacios).filter(Espacios.espacio_id == esp.espacio_id).first()
        if not existe:
            db.add(esp)

    db.commit()
    print("✅ Espacios creados")

finally:
    db.close()
