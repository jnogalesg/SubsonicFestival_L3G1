from fastapi import APIRouter
from model.dao.producto_dao import ProductoDAO

# Creamos el router específico para la tienda
router = APIRouter(tags=["Tienda y Merchandising"])

# Instanciamos el DAO (más adelante lo instanciará el Factory)
producto_dao = ProductoDAO()

@router.get("/api/merchandising", summary="Listar catálogo de la tienda")
def get_merchandising():
    """
    Lista el catálogo completo de la tienda para poder comprar merchandising (camisetas, gorras, etc).
    """
    productos = producto_dao.obtener_todos_los_productos()
    return {
        "status": "success", 
        "data": productos
    }