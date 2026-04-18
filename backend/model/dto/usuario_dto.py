# backend/model/dto/usuario_dto.py
from datetime import datetime
from pydantic import BaseModel

class UsuarioDTO(BaseModel):
    id: str
    nombre: str
    apellidos: str 
    email: str
    telefono: str | None = None
    direccion : str | None = None
    rol: str # ['cliente', 'proveedor', 'admin']

class AuthUserPayload(BaseModel):
    nombre: str | None = None
    apellidos: str | None = None
    rol: str | None = None
    
class ClienteDTO(UsuarioDTO):
    pass

class ProveedorDTO(UsuarioDTO):
    tipo_servicio: str | None = None
    descripcion_servicio: str | None = None

class AdminDTO(UsuarioDTO): 
    # el admin no necesita datos extra a parte de los básicos del usuario.
    pass