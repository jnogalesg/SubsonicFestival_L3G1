from sqlalchemy.orm import Session
from config.database import SessionLocal
from model.models import Producto
from model.dto.producto_dto import ProductoDTO
from typing import List

class ProductoDAO:
    def obtener_todos_los_productos(self) -> List[Producto]:
        db = SessionLocal() # Abrimos conexión
        try:
            # Consultamos todos los productos de la tabla SQLite
            return db.query(Producto).all()
        finally:
            db.close() # Cerramos siempre la conexión