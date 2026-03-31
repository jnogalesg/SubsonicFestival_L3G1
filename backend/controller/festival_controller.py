from fastapi import APIRouter, HTTPException
from typing import List
from model.dto.festival_dto import FestivalDTO
from model.factory.factory_dao import DAOFactory

router = APIRouter(prefix="/api/festivales", tags=["Festivales"])
dao = DAOFactory.get_festival_dao()

@router.get("/", response_model=List[FestivalDTO], summary="Obtener todos los festivales")
def get_festivales():
    return dao.obtener_todos()

@router.get("/calendario", summary="Obtener el calendario de festivales")
def get_calendario():
    festivales = dao.obtener_todos()
    
    # Utilizamos los mismos nombre de los atributos del DTO
    return [{"id": getattr(f, 'id', getattr(f, 'id', '')), "titulo": f.titulo, "fechas": f.fechas} for f in festivales]

@router.get("/{id}", response_model=FestivalDTO, summary="Obtener detalle de un festival")
def get_festival(id: str):
    f = dao.obtener_por_id(id)
    if not f: 
        raise HTTPException(status_code=404, detail="Festival no encontrado")
    return f

@router.get("/{id}/artistas", summary="Obtener listado de artistas")
def get_artistas(id: str):
    f = dao.obtener_por_id(id)
    if not f: 
        raise HTTPException(status_code=404, detail="Festival no encontrado")
    
    # Extraer los artistas de los horarios
    artistas_set = set()
    horarios = getattr(f, 'horarios', []) # Sacamos los horarios del DTO
    
    for stage in horarios:
        for act in stage.get("acts", []):
            artista = act.get("artist")
            if artista:
                artistas_set.add(artista)
                
    # Devolvemos la lista limpia
    return {"artistas": list(artistas_set)}

@router.get("/{id}/horarios", summary="Obtener la escaleta de un festival")
def get_horarios(id: str):
    f = dao.obtener_por_id(id)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    return {"horarios": getattr(f, 'horarios', [])}

@router.get("/{id}/servicios", summary="Obtener los servicios de un festival")
def get_servicios(id: str):
    f = dao.obtener_por_id(id)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    return {"servicios": getattr(f, 'servicios', [])}

@router.get("/{id}/pases", summary="Obtener pases y precios")
def get_pases(id: str):
    f = dao.obtener_por_id(id)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    return {"pases": getattr(f, 'precios', [])}

@router.post("/", summary="Crear un nuevo festival (Admin)")
def crear_festival(datos: FestivalDTO):
    dao.crear(datos)
    
    return {"mensaje": "Creado correctamente", "id": datos.id}