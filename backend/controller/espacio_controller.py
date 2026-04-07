from model.dto.alquiler_dto import SolicitudAlquilerDTO
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from model.dto.espacio_dto import EspacioDTO
from model.factory.factory_dao import DAOFactory


router = APIRouter(prefix="/api/espacios", tags = ["Espacios"])
dao = DAOFactory.get_espacio_dao()

@router.get("/", response_model = List[EspacioDTO], summary = "Buscar espacios disponibles")
def buscar_espacios(
    tipo: Optional[str] = None,
    tamaño: Optional[str] = None,
    ubicacion: Optional[str] = None,
    precio_max: Optional[float] = None,
    precio_min: Optional[float] = None,
): return dao.buscar_espacios(tipo, tamaño, ubicacion, precio_max, precio_min)

@router.get("/{id}", response_model = EspacioDTO, summary = "Obtener detalle de un espacio")
def get_espacio (id: str):
    e = dao.obtener_por_id(id)
    if not e: raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return e

@router.post("/{id}/alquilar", summary = "Solicitar alquiler de un espacio")
def solicitar_alquiler(id: str, solicitud: SolicitudAlquilerDTO):
    try: resultado = dao.solicitar_alquiler(id, solicitud)
    except ValueError as e: raise HTTPException(status_code=400, detail=str(e))
    if not resultado: raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return resultado