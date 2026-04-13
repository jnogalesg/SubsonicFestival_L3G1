from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from model.factory.factory_dao import DAOFactory

# Creamos el router específico para la tienda
router = APIRouter(tags=["Tienda y Merchandising"])

# Instanciamos el DAO usando el Factory
producto_dao = DAOFactory.get_producto_dao()

# --- INICIO DE LA LÓGICA DE SEGURIDAD (Conectado con lo de Jose) ---
security = HTTPBearer() # Esto le dice a FastAPI que este endpoint requiere un Token

def verificar_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Función que intercepta la petición, lee el token de Firebase, 
    pide a la BBDD que valide al usuario y comprueba su rol.
    """
    id_token = credentials.credentials
    usuario_dao = DAOFactory.get_usuario_dao() # Usamos el DAO de Jose
    
    try:
        # Reutilizo la función de Jose para descifrar quién es el usuario
        usuario = usuario_dao.login_usuario(id_token)
        
        # Obtengo el rol (preparado por si el DTO de Jose es objeto o diccionario)
        rol = getattr(usuario, 'rol', None)
        if rol is None and isinstance(usuario, dict):
            rol = usuario.get('rol')
            
        # El "portero" bloquea si no es admin
        if rol != "admin":
            raise HTTPException(status_code=403, detail="Acceso denegado: No tienes permisos de administrador")
        
        return usuario
    except Exception as e:
        # Si el token es falso o caducado, echamos al usuario
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
# --- FIN DE LA LÓGICA DE SEGURIDAD ---


# 1. Endpoint PÚBLICO (Cualquiera puede ver la tienda)
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

# 2. Endpoint PRIVADO (Protegido por Rol Admin)
@router.post("/api/merchandising/gestionar", summary="Gestionar la tienda (Solo Admin)")
def gestionar_tienda(admin_user = Depends(verificar_admin)):
    """
    Al poner `Depends(verificar_admin)`, FastAPI ejecuta el "portero" antes de dejar pasar.
    Si llega a este punto del código, es que el token es válido y es administrador.
    """
    return {"mensaje": "Acceso concedido al panel de gestión. Aquí podrías añadir o borrar productos."}