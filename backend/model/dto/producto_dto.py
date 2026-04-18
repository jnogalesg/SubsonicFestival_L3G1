from pydantic import BaseModel
from typing import Optional

class ProductoDTO(BaseModel):
    id_producto: str
    nombre: str
    descripcion: str
    precio: float
    imagen: Optional[str] = None
    stock: int
    
class CompraRequest(BaseModel):
    id_producto: str
    cantidad: int