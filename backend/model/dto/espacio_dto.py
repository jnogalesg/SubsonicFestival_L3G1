from pydantic import BaseModel
from typing import Optional
class EspacioDTO(BaseModel):
    id: str
    tipo: str
    tamaño: str
    ubicacion: str
    precio: float 
    disponibilidad: bool = True
    desc: Optional[str]= None
