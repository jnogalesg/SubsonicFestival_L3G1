from typing import List
from dto.producto_dto import ProductoDTO

class ProductoDAO:
    def __init__(self):
        # Aquí en el futuro se recibirá la conexión a Firebase a través del Factory
        pass

    def obtener_todos_los_productos(self) -> List[ProductoDTO]:
        # Datos simulados basados en las imágenes de tu frontend
        catalogo = [
            ProductoDTO(id_producto="M001", nombre="Camiseta Subsonic", descripcion="Camiseta oficial del festival 100% algodón", precio=25.00, imagen="camiseta.jpg", stock=50),
            ProductoDTO(id_producto="M002", nombre="Gorra Subsonic", descripcion="Gorra con el logo bordado", precio=15.00, imagen="gorra.jpg", stock=30),
            ProductoDTO(id_producto="M003", nombre="Sudadera Subsonic", descripcion="Sudadera de invierno oficial", precio=45.00, imagen="sudadera.jpg", stock=20)
        ]
        return catalogo