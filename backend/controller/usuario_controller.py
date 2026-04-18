# backend/controller/usuario_controller.py
from typing import List, Union

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from firebase_admin import auth
from model.factory.factory_dao import DAOFactory
from model.dto.usuario_dto import UsuarioDTO, AuthUserPayload, ClienteDTO, ProveedorDTO, AdminDTO

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])
security = HTTPBearer() # Nos permite recibir "Bearer <token>"


class RolUpdateRequest(BaseModel):
    rol: str

# LOGIN DEL USUARIO CON FIREBASE
@router.get("/login", summary="Login con Firebase (OAuth 2.0)")
def login_con_firebase(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Recibe el JWT de Firebase del frontend, lo valida y devuelve los datos y rol del usuario.
    """
    id_token = credentials.credentials
    
    dao = DAOFactory.get_usuario_dao()
    
    try:
        usuario_dto = dao.login_usuario(id_token)
        return {
            "mensaje": "Login correcto",
            "usuario": usuario_dto
        }
    except ValueError as e:
        # 401 = No Autorizado
        raise HTTPException(status_code=401, detail=str(e))

# REGISTRO DEL USUARIO CON FIREBASE
@router.post("/register", summary="Registro de usuario con token Firebase y perfil en SQLite")
def registrar_con_firebase(
    payload: AuthUserPayload,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    id_token = credentials.credentials
    dao = DAOFactory.get_usuario_dao()

    try:
        usuario_dto = dao.registrar_usuario(id_token, payload)
        return {
            "mensaje": "Registro correcto",
            "usuario": usuario_dto
        }
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

# Obtener el perfil del usuario activo, mediante su token de Firebase.  
def obtener_email(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifica el token de Firebase y extrae el email real del usuario."""
    try:
        decoded_token = auth.verify_id_token(credentials.credentials)
        email = decoded_token.get('email')
        if not email:
            raise ValueError("Token sin email")
        return email
    except Exception as e:
        raise HTTPException(status_code=401, detail="Acceso denegado: Token inválido o expirado")
    
# Obtener el perfil y datos del usuario activo con su token.
@router.get("/perfil", response_model=Union[ProveedorDTO, AdminDTO, ClienteDTO])
def obtener_perfil(email: str = Depends(obtener_email)): # coge el email del token de Firebase 

    dao = DAOFactory.get_usuario_dao()
    usuario = dao.obtener_usuario(email)
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado en la base de datos")
    
    return usuario

# Actualización de los datos del perfil del usuario activo
@router.put("/perfil", response_model=Union[ProveedorDTO, ClienteDTO, AdminDTO])
def actualizar_perfil(
    datos: Union[ProveedorDTO, ClienteDTO, AdminDTO]
):
    dao = DAOFactory.get_usuario_dao()
    
    # pasamos el objeto a la función de actualización en el dao
    usuario_actualizado = dao.actualizar_usuario(datos.email, datos)
    
    return usuario_actualizado


@router.post("/cuenta/desactivar", summary="Desactivar la cuenta del usuario activo")
def desactivar_cuenta(email: str = Depends(obtener_email)):
    dao = DAOFactory.get_usuario_dao()

    try:
        usuario = dao.obtener_usuario(email)
        firebase_user = auth.get_user_by_email(email)

        auth.update_user(firebase_user.uid, disabled=True)
        usuario_actualizado = dao.desactivar_usuario(email)
        return {
            "mensaje": "Cuenta desactivada correctamente",
            "usuario": usuario_actualizado,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo desactivar la cuenta: {str(e)}")


@router.delete("/cuenta", summary="Eliminar la cuenta del usuario activo")
def eliminar_cuenta(email: str = Depends(obtener_email)):
    dao = DAOFactory.get_usuario_dao()

    try:
        firebase_user = auth.get_user_by_email(email)

        # Eliminamos primero los registros locales asociados y después la cuenta de Firebase.
        dao.eliminar_usuario(email)
        auth.delete_user(firebase_user.uid)

        return {"mensaje": "Cuenta eliminada correctamente"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo eliminar la cuenta: {str(e)}")

# Listado de todos los usuarios de la BD, solo para administradores.
@router.get("/usuarios", response_model=List[Union[ProveedorDTO, AdminDTO, ClienteDTO]])
def obtener_usuarios_todos(email: str = Depends(obtener_email)): # coge el email del token de Firebase 
    dao = DAOFactory.get_usuario_dao()
    
    # comprobación, esta petición solo la puede hacer un administrador
    usuario = dao.obtener_usuario(email)
    if usuario.rol != 'admin':
        raise HTTPException(status_code=403, detail="Acceso denegado: Requiere permisos de Administrador")
    
    # si es admin, devolvemos la lista completa
    lista_usuarios = dao.obtener_usuarios_todos()
    return lista_usuarios


@router.put("/usuarios/{email}/rol", summary="Actualizar el rol de un usuario")
def actualizar_rol_usuario(
    email: str,
    datos: RolUpdateRequest,
    admin_email: str = Depends(obtener_email),
):
    dao = DAOFactory.get_usuario_dao()

    usuario_admin = dao.obtener_usuario(admin_email)
    if usuario_admin.rol != 'admin':
        raise HTTPException(status_code=403, detail="Acceso denegado: Requiere permisos de Administrador")

    try:
        usuario_actualizado = dao.actualizar_rol_usuario(email, datos.rol)
        return {"mensaje": "Rol actualizado correctamente", "usuario": usuario_actualizado}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/estadisticas", summary="Obtener estadisticas administrativas")
def obtener_estadisticas(email: str = Depends(obtener_email)):
    dao = DAOFactory.get_usuario_dao()

    usuario = dao.obtener_usuario(email)
    if usuario.rol != 'admin':
        raise HTTPException(status_code=403, detail="Acceso denegado: Requiere permisos de Administrador")

    return dao.obtener_estadisticas_admin()


@router.get("/estadisticas/ventas-evento", summary="Obtener ventas por evento para administracion")
def obtener_ventas_por_evento(email: str = Depends(obtener_email)):
    dao = DAOFactory.get_usuario_dao()

    usuario = dao.obtener_usuario(email)
    if usuario.rol != 'admin':
        raise HTTPException(status_code=403, detail="Acceso denegado: Requiere permisos de Administrador")

    return dao.obtener_ventas_por_evento_admin()


@router.get("/proveedores", summary="Obtener control de proveedores")
def obtener_proveedores_control(email: str = Depends(obtener_email)):
    dao = DAOFactory.get_usuario_dao()

    usuario = dao.obtener_usuario(email)
    if usuario.rol != 'admin':
        raise HTTPException(status_code=403, detail="Acceso denegado: Requiere permisos de Administrador")

    return dao.obtener_control_proveedores_admin()