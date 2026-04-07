from fastapi import APIRouter
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