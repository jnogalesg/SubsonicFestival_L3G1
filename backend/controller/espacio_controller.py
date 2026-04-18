from model.dto.alquiler_dto import SolicitudAlquilerDTO
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from model.dto.espacio_dto import EspacioDTO
from model.factory.factory_dao import DAOFactory
from model.dto.festival_dto import FestivalDTO 


router = APIRouter(prefix="/api/espacios", tags = ["Espacios"])
dao = DAOFactory.get_espacio_dao()
usuario_dao = DAOFactory.get_usuario_dao()  # Para validar usuario
security = HTTPBearer()  # Para recibir "Bearer <token>"


@router.get("/", response_model = List[EspacioDTO], summary = "Buscar espacios disponibles")
def buscar_espacios(
    tipo: Optional[str] = None,
    tamaño: Optional[str] = None,
    ubicacion: Optional[str] = None,
    precio_max: Optional[float] = None,
    precio_min: Optional[float] = None,
): return dao.buscar_espacios(tipo, tamaño, ubicacion, precio_max, precio_min)

@router.get("/mis-alquileres", summary="Obtener alquileres activos del proveedor")
def obtener_mis_alquileres(proveedor_id: str):
    if not proveedor_id:
        raise HTTPException(status_code=400, detail="El proveedor_id es obligatorio")
    return dao.obtener_alquileres_activos_por_proveedor(proveedor_id)


@router.post("/alquileres/{id_alquiler}/finalizar", summary="Finalizar un alquiler activo")
def finalizar_alquiler(id_alquiler: int, proveedor_id: Optional[str] = None):
    try:
        resultado = dao.finalizar_alquiler(id_alquiler, proveedor_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not resultado:
        raise HTTPException(status_code=404, detail="Alquiler no encontrado")

    return resultado

@router.post("/{id}/alquilar", summary = "Solicitar alquiler de un espacio")
def solicitar_alquiler(id: str, solicitud: SolicitudAlquilerDTO):
    try: resultado = dao.solicitar_alquiler(id, solicitud)
    except ValueError as e: raise HTTPException(status_code=400, detail=str(e))
    if not resultado: raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return resultado

@router.get("/historial", response_model=List[FestivalDTO], summary="Obtener historial de eventos del proveedor logueado")
def obtener_historial_proveedor(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Devuelve el historial de eventos en los que ha participado el proveedor logueado.
    Requiere autenticación y rol 'proveedor'.
    """
    id_token = credentials.credentials
    
    try:
        #Validar token y obtener usuario
        usuario_dto = usuario_dao.login_usuario(id_token)
        if usuario_dto.rol != "proveedor":
            raise HTTPException(status_code=403, detail="Acceso denegado: Solo proveedores pueden acceder a este endpoint")
        
        #Obtener historial
        historial = dao.obtener_historial_eventos_por_proveedor(usuario_dto.id)
        return historial
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Autenticación fallida: {str(e)}")
    
@router.post("/", response_model=EspacioDTO, summary="Crear un nuevo espacio")
def crear_espacio(espacio: EspacioDTO):
    try:
        return dao.crear_espacio(espacio)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id}", response_model=EspacioDTO, summary="Actualizar un espacio")
def actualizar_espacio(id: str, espacio: EspacioDTO):
    try:
        actualizado = dao.actualizar_espacio(id, espacio)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not actualizado:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return actualizado


@router.delete("/{id}", summary="Eliminar un espacio")
def eliminar_espacio(id: str):
    eliminado = dao.eliminar_espacio(id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return {"mensaje": "Espacio eliminado correctamente."}


@router.get("/{id}", response_model = EspacioDTO, summary = "Obtener detalle de un espacio")
def get_espacio (id: str):
    e = dao.obtener_por_id(id)
    if not e: raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return e