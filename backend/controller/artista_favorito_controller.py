# backend/controller/artista_favorito_controller.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from model.dao.artista_favorito_dao import ArtistaFavoritoDAO
from pydantic import BaseModel

router = APIRouter(prefix="/api/artistas-favoritos", tags=["Artistas Favoritos"])
security = HTTPBearer()

class ArtistaFavoritoRequest(BaseModel):
    nombre_artista: str
    id_festival: str

class ArtistaFavoritoEliminarRequest(BaseModel):
    nombre_artista: str
    id_festival: str

def obtener_email(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifica el token de Firebase y extrae el email del usuario."""
    try:
        decoded_token = auth.verify_id_token(credentials.credentials)
        email = decoded_token.get('email')
        if not email:
            raise ValueError("Token sin email")
        return email
    except Exception as e:
        raise HTTPException(status_code=401, detail="Acceso denegado: Token inválido o expirado")

@router.post("/agregar", summary="Agregar artista a favoritos")
def agregar_artista_favorito(
    request: ArtistaFavoritoRequest,
    email: str = Depends(obtener_email)
):
    """Agrega un artista a la lista de favoritos del usuario"""
    try:
        favorito = ArtistaFavoritoDAO.agregar_favorito(
            email, 
            request.nombre_artista, 
            request.id_festival
        )
        return {
            "mensaje": "Artista agregado a favoritos",
            "favorito": favorito
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/eliminar", summary="Eliminar artista de favoritos")
def eliminar_artista_favorito(
    request: ArtistaFavoritoEliminarRequest,
    email: str = Depends(obtener_email)
):
    """Elimina un artista de la lista de favoritos del usuario"""
    try:
        eliminado = ArtistaFavoritoDAO.eliminar_favorito(
            email,
            request.nombre_artista,
            request.id_festival
        )
        if not eliminado:
            raise HTTPException(status_code=404, detail="Favorito no encontrado")
        
        return {"mensaje": "Artista eliminado de favoritos"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/lista/{id_festival}", summary="Obtener favoritos de un festival")
def obtener_favoritos(
    id_festival: str,
    email: str = Depends(obtener_email)
):
    """Obtiene la lista de artistas favoritos del usuario en un festival específico"""
    try:
        favoritos = ArtistaFavoritoDAO.obtener_favoritos(email, id_festival)
        return {"favoritos": favoritos}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/todos", summary="Obtener todos los favoritos del usuario")
def obtener_todos_favoritos(email: str = Depends(obtener_email)):
    """Obtiene todos los artistas favoritos del usuario en todos los festivales"""
    try:
        from config.database import SessionLocal
        from model.models import ArtistasFavoritos
        
        db = SessionLocal()
        favoritos_db = db.query(ArtistasFavoritos).filter(
            ArtistasFavoritos.usuario_email == email
        ).all()
        
        resultado = [
            {
                "nombre_artista": fav.nombre_artista,
                "id_festival": fav.id_festival,
                "fecha_favorito": fav.fecha_favorito.isoformat() if fav.fecha_favorito else None
            }
            for fav in favoritos_db
        ]
        
        db.close()
        return {"favoritos": resultado, "total": len(resultado)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/verificar/{nombre_artista}/{id_festival}", summary="Verificar si es favorito")
def verificar_favorito(
    nombre_artista: str,
    id_festival: str,
    email: str = Depends(obtener_email)
):
    """Verifica si un artista es favorito del usuario"""
    try:
        es_favorito = ArtistaFavoritoDAO.es_favorito(email, nombre_artista, id_festival)
        return {"es_favorito": es_favorito}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
