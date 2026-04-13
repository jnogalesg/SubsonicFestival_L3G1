from pydantic import BaseModel
from typing import Optional


class EntradaDTO(BaseModel):
	id_entrada: Optional[str] = None
	id_festival: str
	evento: str
	fecha: str
	lugar: str
	tipo: str
	precio: float
	estado: str = "activa"
	comprador_nombre: Optional[str] = None
	comprador_email: Optional[str] = None
	codigo_qr: Optional[str] = None
	solicitud_cancelacion: bool = False
	motivo_cancelacion: Optional[str] = None
