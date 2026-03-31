from fastapi import APIRouter, HTTPException
from typing import List
from model.dto.festival_dto import FestivalDTO, CrearFestivalDTO
from model.factory.factory_dao import DAOFactory
from model.festival import Festival

router = APIRouter(prefix="/api/festivales", tags=["Festivales"])
dao = DAOFactory.get_festival_dao()

# Función auxiliar para convertir el Modelo al DTO que espera React
def festival_a_dto(f: Festival) -> FestivalDTO:
    return FestivalDTO(
        id=f.id_festival, titulo=f.titulo, pais=f.pais, ubicacion=f.ubicacion,
        fechas=f.fechas, desc=f.desc, img=f.img, tagsBusqueda=f.tagsBusqueda,
        precios=f.precios, servicios=f.servicios, horarios=f.horarios
    )

@router.get("/", response_model=List[FestivalDTO], summary="Obtener todos los festivales")
def get_festivales():
    return [festival_a_dto(f) for f in dao.obtener_todos()]

@router.get("/calendario", summary="Obtener el calendario de festivales")
def get_calendario():
    festivales = dao.obtener_todos()
    return [{"id": f.id_festival, "titulo": f.titulo, "fechas": f.fechas} for f in festivales]

@router.get("/{id_festival}", response_model=FestivalDTO, summary="Obtener detalle de un festival")
def get_festival(id_festival: str):
    f = dao.obtener_por_id(id_festival)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    return festival_a_dto(f)

@router.get("/{id_festival}/artistas", summary="Obtener listado de artistas")
def get_artistas(id_festival: str):
    f = dao.obtener_por_id(id_festival)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    return {"artistas": f.artistas}

@router.get("/{id_festival}/horarios", summary="Obtener la escaleta de un festival")
def get_horarios(id_festival: str):
    f = dao.obtener_por_id(id_festival)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    return {"horarios": f.horarios}

@router.get("/{id_festival}/servicios", summary="Obtener los servicios de un festival")
def get_servicios(id_festival: str):
    f = dao.obtener_por_id(id_festival)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    return {"servicios": f.servicios}

@router.get("/{id_festival}/pases", summary="Obtener pases y precios")
def get_pases(id_festival: str):
    f = dao.obtener_por_id(id_festival)
    if not f: raise HTTPException(status_code=404, detail="Festival no encontrado")
    return {"pases": f.precios}

@router.post("/", summary="Crear un nuevo festival (Admin)")
def crear_festival(datos: CrearFestivalDTO):
    nuevo = Festival(
        id_festival=datos.id, titulo=datos.titulo, pais=datos.pais, ubicacion=datos.ubicacion,
        fechas=datos.fechas, desc=datos.desc, img=datos.img, tagsBusqueda=datos.tagsBusqueda,
        precios=datos.precios, servicios=datos.servicios, horarios=datos.horarios
    )
    dao.crear(nuevo)
    return {"mensaje": "Creado correctamente", "id": nuevo.id_festival}