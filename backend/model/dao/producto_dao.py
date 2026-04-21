from sqlalchemy.orm import Session
from config.database import SessionLocal
from model.models import Producto
from model.dto.producto_dto import ProductoDTO
from typing import List

class ProductoDAO:
    def obtener_todos_los_productos(self) -> List[Producto]:
        db = SessionLocal() # Abrimos conexión
        try:
            # Consultamos todos los productos de la tabla MySQL
            return db.query(Producto).all()
        finally:
            db.close() # Cerramos siempre la conexión
    
    def ejecutar_compra(self, id_prod: str, cantidad: int) -> bool:
        from config.database import SessionLocal
        from model.models import Producto
        
        db = SessionLocal()
        try:
            # Buscamos el producto en la base de datos
            producto = db.query(Producto).filter(Producto.id_producto == id_prod).first()
            
            if producto and producto.stock >= cantidad:
                producto.stock -= cantidad # Restamos el stock real
                db.commit()
                return True
            return False
        finally:
            db.close()
    
    def reducir_stock(self, id_prod: str, cantidad: int) -> bool:
        from config.database import SessionLocal
        from model.models import Producto
        
        db = SessionLocal()
        try:
            # Buscamos el producto en la base de datos
            producto = db.query(Producto).filter(Producto.id_producto == id_prod).first()
            
            # Si existe y hay stock suficiente, lo restamos
            if producto and producto.stock >= cantidad:
                producto.stock -= cantidad 
                db.commit() # Guardamos los cambios en MySQL
                return True
            return False
        finally:
            db.close()