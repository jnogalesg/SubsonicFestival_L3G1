from pydantic import BaseModel
from typing import Optional

class SolicitudAlquilerDTO(BaseModel):
    proveedor: str
    negocio: str 
    contacto: str 
    fecha_ini: str 
    fecha_fin: str
    comentarios: Optional[str] = None
