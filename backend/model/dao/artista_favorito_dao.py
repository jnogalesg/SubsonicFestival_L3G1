# backend/model/dao/artista_favorito_dao.py
from config.database import SessionLocal
from sqlalchemy import and_, delete
from model.models import ArtistasFavoritos
from model.dto.artista_favorito_dto import ArtistaFavoritoDTO, ArtistaFavoritoResponseDTO

class ArtistaFavoritoDAO:

    @staticmethod
    def agregar_favorito(usuario_email: str, nombre_artista: str, id_festival: str) -> ArtistaFavoritoDTO:
        """Agrega un artista a favoritos del usuario"""
        db = SessionLocal()
        try:
            # Verificar si ya existe
            favorito_existente = db.query(ArtistasFavoritos).filter(
                and_(
                    ArtistasFavoritos.usuario_email == usuario_email,
                    ArtistasFavoritos.nombre_artista == nombre_artista,
                    ArtistasFavoritos.id_festival == id_festival
                )
            ).first()

            if favorito_existente:
                return ArtistaFavoritoResponseDTO(
                    nombre_artista=favorito_existente.nombre_artista,
                    id_festival=favorito_existente.id_festival,
                    fecha_favorito=favorito_existente.fecha_favorito
                )

            # Crear nuevo favorito
            nuevo_favorito = ArtistasFavoritos(
                usuario_email=usuario_email,
                nombre_artista=nombre_artista,
                id_festival=id_festival
            )
            db.add(nuevo_favorito)
            db.commit()
            db.refresh(nuevo_favorito)
            
            return ArtistaFavoritoResponseDTO(
                nombre_artista=nuevo_favorito.nombre_artista,
                id_festival=nuevo_favorito.id_festival,
                fecha_favorito=nuevo_favorito.fecha_favorito
            )
        finally:
            db.close()

    @staticmethod
    def eliminar_favorito(usuario_email: str, nombre_artista: str, id_festival: str) -> bool:
        """Elimina un artista de favoritos"""
        db = SessionLocal()
        try:
            stmt = delete(ArtistasFavoritos).where(
                and_(
                    ArtistasFavoritos.usuario_email == usuario_email,
                    ArtistasFavoritos.nombre_artista == nombre_artista,
                    ArtistasFavoritos.id_festival == id_festival
                )
            )
            resultado = db.execute(stmt)
            db.commit()
            return resultado.rowcount > 0
        finally:
            db.close()

    @staticmethod
    def obtener_favoritos(usuario_email: str, id_festival: str) -> list[str]:
        """Obtiene lista de artistas favoritos del usuario en un festival"""
        db = SessionLocal()
        try:
            favoritos = db.query(ArtistasFavoritos.nombre_artista).filter(
                and_(
                    ArtistasFavoritos.usuario_email == usuario_email,
                    ArtistasFavoritos.id_festival == id_festival
                )
            ).all()
            return [fav[0] for fav in favoritos]
        finally:
            db.close()

    @staticmethod
    def es_favorito(usuario_email: str, nombre_artista: str, id_festival: str) -> bool:
        """Verifica si un artista es favorito del usuario"""
        db = SessionLocal()
        try:
            favorito = db.query(ArtistasFavoritos).filter(
                and_(
                    ArtistasFavoritos.usuario_email == usuario_email,
                    ArtistasFavoritos.nombre_artista == nombre_artista,
                    ArtistasFavoritos.id_festival == id_festival
                )
            ).first()
            return favorito is not None
        finally:
            db.close()
