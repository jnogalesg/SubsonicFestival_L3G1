from pydantic import BaseModel
from typing import List, Dict, Any

class FestivalDTO(BaseModel):
    id: str
    titulo: str
    pais: str
    ubicacion: str
    fechas: str
    desc: str
    img: str
    tagsBusqueda: List[str] = []
    precios: Dict[str, float] = {}
    servicios: List[str] = []
    horarios: List[Dict[str, Any]] = []