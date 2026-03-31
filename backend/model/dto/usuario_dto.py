# backend/model/dto/usuario_dto.py
from pydantic import BaseModel

class UsuarioDTO(BaseModel):
    id: str
    email: str
    nombre: str
    rol: str # Puede ser 'cliente', 'proveedor', 'admin'