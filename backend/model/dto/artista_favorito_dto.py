# backend/model/dto/artista_favorito_dto.py
from datetime import datetime
from pydantic import BaseModel

class ArtistaFavoritoDTO(BaseModel):
    usuario_email: str
    nombre_artista: str
    id_festival: str
    fecha_favorito: datetime | None = None

class ArtistaFavoritoResponseDTO(BaseModel):
    nombre_artista: str
    id_festival: str
    fecha_favorito: datetime
