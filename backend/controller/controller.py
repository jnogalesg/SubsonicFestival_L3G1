from fastapi import APIRouter, Depends, HTTPException
from model.factory.factory_dao import FactoryDAO


router = APIRouter(tags= ["Tienda y Merchandising"])
producto_dao = FactoryDAO.get_producto_dao() # Obtenemos el DAO de productos desde la fábrica

@router.get("/api/merchandising")
def get_merchandising():
    return {"status": "success", "data": producto_dao.obtener_todos_los_productos()}

# EJEMPLO: Endpoint protegido por ROL
# Solo alguien logueado y con rol 'admin' podría entrar aquí
@router.post("/api/merchandising/gestionar")
def gestionar_tienda(current_user: dict = Depends(get_current_user)):
    if current_user.rol != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador")
    return {"mensaje": "Acceso concedido al panel de gestión"}