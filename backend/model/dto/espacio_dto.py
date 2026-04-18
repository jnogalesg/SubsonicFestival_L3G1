from pydantic import BaseModel, Field
from typing import List, Optional

class EspacioDTO(BaseModel):
    id: str
    espacio_id: Optional[str] = None
    tipo: str
    tamaño: str
    ubicacion: str
    precio: float 
    disponibilidad: bool = True
    id_festival: str
    desc: Optional[str]= None
    dimensiones: Optional[str] = None
    servicios: List[str] = Field(default_factory=list)
