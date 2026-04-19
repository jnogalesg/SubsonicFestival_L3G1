from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from model.factory.factory_dao import DAOFactory
from model.dto.producto_dto import CompraRequest
from pydantic import BaseModel

# Creamos el router específico
router = APIRouter(tags=["Tienda y Merchandising"])

# Llamada a factory para obtener el DAO de productos
producto_dao = DAOFactory.get_producto_dao()

# Herramienta para pedir el Token de Firebase
security = HTTPBearer()

# Dependencias

def obtener_cliente_logueado(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifica que el usuario está logueado y es CLIENTE."""
    id_token = credentials.credentials
    usuario_dao = DAOFactory.get_usuario_dao()
    try:
        usuario = usuario_dao.login_usuario(id_token)
        rol = getattr(usuario, 'rol', None) or (usuario.get('rol') if isinstance(usuario, dict) else None)
        if rol != "cliente":
            raise HTTPException(status_code=403, detail="Solo los clientes registrados pueden realizar compras")
        return usuario
    except Exception:
        raise HTTPException(status_code=401, detail="Debes iniciar sesión para comprar")

def verificar_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifica que el usuario está logueado y es ADMIN."""
    id_token = credentials.credentials
    usuario_dao = DAOFactory.get_usuario_dao()
    try:
        usuario = usuario_dao.login_usuario(id_token)
        rol = getattr(usuario, 'rol', None) or (usuario.get('rol') if isinstance(usuario, dict) else None)
        if rol != "admin":
            raise HTTPException(status_code=403, detail="Acceso denegado: No tienes permisos de administrador")
        return usuario
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

# ENDPOINTS

# 3.1. PÚBLICO: Ver el catálogo (Lo puede ver cualquiera)
@router.get("/api/merchandising", summary="Listar catálogo de la tienda")
def get_merchandising():
    productos = producto_dao.obtener_todos_los_productos()
    return {"status": "success", "data": productos}

# 3.2. PRIVADO CLIENTES: Realizar una compra
@router.post("/api/merchandising/comprar", summary="Realizar una compra (Solo Clientes)")
def realizar_compra(pedido: CompraRequest, cliente = Depends(obtener_cliente_logueado)):
    
    # Restamos el stock en la Base de Datos
    exito = producto_dao.reducir_stock(pedido.id_producto, pedido.cantidad)
    
    if not exito:
        raise HTTPException(status_code=400, detail="No hay stock suficiente o el producto no existe")
        
    nombre = getattr(cliente, 'nombre', '') or (cliente.get('nombre') if isinstance(cliente, dict) else 'Cliente')
    
    return {
        "status": "success",
        "mensaje": f"¡Compra realizada con éxito por {nombre}!",
        "producto_id": pedido.id_producto
    }

# 3.3. PRIVADO ADMIN: Panel de gestión
@router.post("/api/merchandising/gestionar", summary="Gestionar la tienda (Solo Admin)")
def gestionar_tienda(admin_user = Depends(verificar_admin)):
    return {"mensaje": "Acceso concedido al panel de gestión para añadir/quitar productos."}