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


@router.get("/estadisticas", summary="Obtener estadísticas de festivales")
def get_estadisticas_festivales():
    dao = DAOFactory.get_festival_dao()
    return dao.obtener_estadisticas()


@router.get("/buscar", response_model=List[FestivalDTO], summary="Buscar festivales por filtros")
def buscar_festivales(q: str = "", fecha: str = "", ubicacion: str = ""):
    dao = DAOFactory.get_festival_dao()
    return dao.buscar(texto=q, fecha=fecha, ubicacion=ubicacion)

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

@router.put("/{id}", response_model=FestivalDTO, summary="Actualizar un festival")
def update_festival(id: str, festival: FestivalDTO):
    dao = DAOFactory.get_festival_dao()
    # Llamamos al DAO para que actualice
    f_actualizado = dao.actualizar(id, festival)
    
    if not f_actualizado:
        raise HTTPException(status_code=404, detail="Error: Festival no encontrado para actualizar")
        
    return f_actualizado

@router.delete("/{id}", summary="Eliminar un festival")
def delete_festival(id: str):
    dao = DAOFactory.get_festival_dao()
    # Llamamos al DAO para que borre
    eliminado = dao.eliminar(id)
    
    if not eliminado:
        raise HTTPException(status_code=404, detail="Error: Festival no encontrado para eliminar")
        
    return {"mensaje": f"Festival con ID {id} eliminado correctamente"}