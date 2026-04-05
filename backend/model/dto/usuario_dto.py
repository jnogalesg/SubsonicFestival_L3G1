# backend/model/dto/usuario_dto.py
from datetime import datetime
from pydantic import BaseModel

class UsuarioDTO(BaseModel):
    id: str
    nombre: str
    apellidos: str 
    email: str
    ciudad : str | None
    fechaRegistro: datetime
    rutaImagen: str | None
    rol: str # Puede ser 'cliente', 'proveedor', 'admin'