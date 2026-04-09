# backend/controller/usuario_controller.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from model.factory.factory_dao import DAOFactory
from model.dto.usuario_dto import AuthUserPayload

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])
security = HTTPBearer() # Nos permite recibir "Bearer <token>"

@router.post("/login", summary="Login con Firebase (OAuth 2.0)")
def login_con_firebase(payload: AuthUserPayload | None = None, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Recibe el JWT de Firebase del frontend, lo valida y devuelve los datos y rol del usuario.
    """
    id_token = credentials.credentials
    
    dao = DAOFactory.get_usuario_dao()
    
    try:
        usuario_dto = dao.verificar_y_obtener_usuario(id_token, payload)
        return {
            "mensaje": "Login correcto",
            "usuario": usuario_dto
        }
    except ValueError as e:
        # 401 es el código HTTP de "No Autorizado"
        raise HTTPException(status_code=401, detail=str(e))


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