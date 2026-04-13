from config.database import SessionLocal
from model.models import Festivales
from model.dto.festival_dto import FestivalDTO

class FestivalDAO:

    # 1. EL TRADUCTOR: Convierte el modelo de Base de Datos a DTO
    @staticmethod
    def _a_dto(festival_db: Festivales) -> FestivalDTO:
        return FestivalDTO(
            id=festival_db.id,
            titulo=festival_db.titulo,
            pais=festival_db.pais,
            ubicacion=festival_db.ubicacion,
            fechas=festival_db.fechas,
            desc=festival_db.desc,
            img=festival_db.img,
            tagsBusqueda=festival_db.tagsBusqueda or [], # Si es None en la BD, devuelve lista vacía
            precios=festival_db.precios or {},
            servicios=festival_db.servicios or [],
            horarios=festival_db.horarios or []
        )

    # 2. OBTENER TODOS
    def obtener_todos(self):
        db = SessionLocal() # Abrimos conexión
        try:
            festivales_db = db.query(Festivales).all()
            # Traducimos todos los festivales encontrados a DTO usando el traductor _a_dto
            return [self._a_dto(f) for f in festivales_db]
        finally:
            db.close() # Cerramos conexión siempre, haya error o no

    # 3. OBTENER POR ID
    def obtener_por_id(self, id: str):
        db = SessionLocal()
        try:
            festival_db = db.query(Festivales).filter(Festivales.id == id).first()
            if not festival_db:
                return None
            return self._a_dto(festival_db)
        finally:
            db.close()

    # 4. CREAR NUEVO
    def crear(self, festival: FestivalDTO):
        db = SessionLocal()
        try:
            # festival.dict() o festival.model_dump() extrae los datos del DTO
            nuevo_festival = Festivales(**festival.dict()) 
            
            db.add(nuevo_festival)
            db.commit()
            db.refresh(nuevo_festival)
            
            return self._a_dto(nuevo_festival)
        finally:
            db.close()