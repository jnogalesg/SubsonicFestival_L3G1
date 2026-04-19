from pydantic import BaseModel
from typing import Optional


# Lo que recibe el backend al comprar una entrada.
class EntradaCreateDTO(BaseModel):
	id_festival: str
	tipo: str
	comprador_nombre: str
	comprador_email: str


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


class CancelarEntradaRequestDTO(BaseModel):
	motivo: Optional[str] = None
