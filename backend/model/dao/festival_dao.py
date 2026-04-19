from config.database import SessionLocal
from sqlalchemy import func, or_
from model.models import Festivales
from model.models import Entradas
from model.dto.festival_dto import FestivalDTO

class FestivalDAO:

    @staticmethod
    def _normalizar_sql(campo):
        texto = func.lower(campo)
        texto = func.replace(texto, 'á', 'a')
        texto = func.replace(texto, 'é', 'e')
        texto = func.replace(texto, 'í', 'i')
        texto = func.replace(texto, 'ó', 'o')
        texto = func.replace(texto, 'ú', 'u')
        texto = func.replace(texto, 'ü', 'u')
        return texto

    @staticmethod
    def _normalizar_texto(texto: str) -> str:
        return (
            texto.lower()
            .replace('á', 'a')
            .replace('é', 'e')
            .replace('í', 'i')
            .replace('ó', 'o')
            .replace('ú', 'u')
            .replace('ü', 'u')
        )

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

    def obtener_estadisticas(self):
        db = SessionLocal()
        try:
            festivales_db = db.query(Festivales).all()

            artistas_unicos = set()
            escenarios_unicos = set()

            for festival in festivales_db:
                horarios = festival.horarios or []
                for stage in horarios:
                    stage_nombre = stage.get("stage")
                    if stage_nombre:
                        escenarios_unicos.add(stage_nombre)

                    for act in stage.get("acts", []):
                        artist = act.get("artist")
                        if artist:
                            artistas_unicos.add(artist)

            asistentes = (
                db.query(Entradas)
                .filter(Entradas.estado != "cancelada")
                .count()
            )

            return {
                "festivales": len(festivales_db),
                "artistas": len(artistas_unicos),
                "asistentes": asistentes,
                "escenarios": len(escenarios_unicos),
            }
        finally:
            db.close()

    def buscar(self, texto: str = "", fecha: str = "", ubicacion: str = ""):
        db = SessionLocal()
        try:
            query = db.query(Festivales)

            if texto:
                texto_like = f"%{self._normalizar_texto(texto)}%"
                query = query.filter(
                    or_(
                        self._normalizar_sql(Festivales.titulo).like(texto_like),
                        self._normalizar_sql(Festivales.pais).like(texto_like),
                        self._normalizar_sql(Festivales.ubicacion).like(texto_like),
                        self._normalizar_sql(Festivales.fechas).like(texto_like),
                    )
                )

            if fecha:
                fecha_like = f"%{self._normalizar_texto(fecha)}%"
                query = query.filter(self._normalizar_sql(Festivales.fechas).like(fecha_like))

            if ubicacion:
                ubicacion_like = f"%{self._normalizar_texto(ubicacion)}%"
                query = query.filter(
                    or_(
                        self._normalizar_sql(Festivales.pais).like(ubicacion_like),
                        self._normalizar_sql(Festivales.ubicacion).like(ubicacion_like),
                    )
                )

            festivales_db = query.all()
            return [self._a_dto(f) for f in festivales_db]
        finally:
            db.close()

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

    # 5. ACTUALIZAR (PUT)
    def actualizar(self, id: str, festival: FestivalDTO):
        db = SessionLocal()
        try:
            # Buscamos el festival en la BD
            festival_db = db.query(Festivales).filter(Festivales.id == id).first()
            if not festival_db:
                return None
            
            # Actualizamos todos los campos con los nuevos datos que vienen del frontend
            festival_db.titulo = festival.titulo
            festival_db.pais = festival.pais
            festival_db.ubicacion = festival.ubicacion
            festival_db.fechas = festival.fechas
            festival_db.desc = festival.desc
            festival_db.img = festival.img
            festival_db.tagsBusqueda = festival.tagsBusqueda
            festival_db.precios = festival.precios
            festival_db.servicios = festival.servicios
            festival_db.horarios = festival.horarios
            
            db.commit() # Guardamos los cambios
            db.refresh(festival_db)
            
            return self._a_dto(festival_db)
        finally:
            db.close()

    # 6. ELIMINAR (DELETE)
    def eliminar(self, id: str) -> bool:
        db = SessionLocal()
        try:
            # Buscamos el festival en la BD
            festival_db = db.query(Festivales).filter(Festivales.id == id).first()
            if not festival_db:
                return False
            
            # Lo borramos
            db.delete(festival_db)
            db.commit()
            return True
        finally:
            db.close()