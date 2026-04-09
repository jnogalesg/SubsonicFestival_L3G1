# backend/model/dto/usuario_dto.py
from datetime import datetime
from pydantic import BaseModel

class UsuarioDTO(BaseModel):
    id: str
    nombre: str
    apellidos: str 
    email: str
    ciudad : str | None = None
    rol: str # ['cliente', 'proveedor', 'admin']


class AuthUserPayload(BaseModel):
    nombre: str | None = None
    apellidos: str | None = None
    rol: str | None = None