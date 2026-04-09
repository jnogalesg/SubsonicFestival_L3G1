from fastapi import APIRouter, HTTPException
from typing import List
from model.dto.festival_dto import FestivalDTO
from model.factory.factory_dao import DAOFactory

router = APIRouter(prefix="/api/festivales", tags=["Festivales"])

@router.get("/", response_model=List[FestivalDTO], summary="Obtener todos los festivales")
def get_festivales():
    dao = DAOFactory.get_festival_dao()
    return dao.obtener_todos()

@router.get("/calendario", summary="Obtener el calendario de festivales")
def get_calendario():
    dao = DAOFactory.get_festival_dao()
    festivales = dao.obtener_todos()
    
    return [{"id": f.id, "titulo": f.titulo, "fechas": f.fechas} for f in festivales]

@router.get("/{id}", response_model=FestivalDTO, summary="Obtener detalle de un festival")
def get_festival(id: str):
    dao = DAOFactory.get_festival_dao()
    f = dao.obtener_por_id(id)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    return f

@router.get("/{id}/artistas", summary="Obtener listado de artistas")
def get_artistas(id: str):
    dao = DAOFactory.get_festival_dao()
    f = dao.obtener_por_id(id)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    
    # Extraemos los artistas buscando dentro de la lista de horarios
    artistas_set = set()
    for stage in f.horarios:
        for act in stage.get("acts", []):
            if "artist" in act:
                artistas_set.add(act["artist"])
                
    return {"artistas": list(artistas_set)}

@router.get("/{id}/horarios", summary="Obtener la escaleta de un festival")
def get_horarios(id: str):
    dao = DAOFactory.get_festival_dao() 
    f = dao.obtener_por_id(id)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    return {"horarios": f.horarios}

@router.get("/{id}/servicios", summary="Obtener los servicios de un festival")
def get_servicios(id: str):
    dao = DAOFactory.get_festival_dao()
    f = dao.obtener_por_id(id)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    return {"servicios": f.servicios}

@router.get("/{id}/pases", summary="Obtener pases y precios")
def get_pases(id: str):
    dao = DAOFactory.get_festival_dao()
    f = dao.obtener_por_id(id)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    return {"pases": f.precios}

@router.post("/", summary="Crear un nuevo festival (Admin)")
def crear_festival(datos: FestivalDTO):
    dao = DAOFactory.get_festival_dao() 
    dao.crear(datos)
    
    return {"mensaje": "Creado correctamente", "id": datos.id}