from datetime import datetime
from typing import Optional, List

from sqlalchemy import func

from config.database import SessionLocal
from model.dto.alquiler_dto import SolicitudAlquilerDTO
from model.dto.espacio_dto import EspacioDTO
from model.dto.festival_dto import FestivalDTO
from model.models import Alquileres, Espacios, Festivales


class EspacioDAO:

    @staticmethod
    def _a_dto(espacio_db: Espacios) -> EspacioDTO:
        return EspacioDTO(
            id=espacio_db.espacio_id,
            espacio_id=espacio_db.espacio_id,
            tipo=espacio_db.tipo,
            tamaño=espacio_db.tamaño,
            ubicacion=espacio_db.ubicacion,
            precio=espacio_db.precio,
            disponibilidad=bool(espacio_db.disponibilidad),
            id_festival=espacio_db.id_festival,
            desc=espacio_db.desc,
            dimensiones=espacio_db.dimensiones,
            servicios=[
                servicio.strip()
                for servicio in (espacio_db.servicios or "").split(",")
                if servicio.strip()
            ],
        )

    @staticmethod
    def _parse_datetime(valor: str) -> datetime:
        if isinstance(valor, datetime):
            return valor

        if not valor:
            raise ValueError("Las fechas del alquiler son obligatorias.")

        try:
            # El frontend envía ISO 8601 (ej: 2026-07-01T00:00:00)
            return datetime.fromisoformat(str(valor).strip().replace("Z", "+00:00"))
        except ValueError as error:
            raise ValueError("Formato de fecha inválido. Usa una fecha ISO 8601.") from error

    def obtener_espacios_disponibles(self) -> List[EspacioDTO]:
        db = SessionLocal()
        try:
            espacios = (
                db.query(Espacios)
                .filter(Espacios.disponibilidad.is_(True))
                .order_by(Espacios.id.asc())
                .all()
            )
            return [self._a_dto(espacio) for espacio in espacios]
        finally:
            db.close()

    def buscar_espacios(
        self,
        tipo: Optional[str] = None,
        tamaño: Optional[str] = None,
        ubicacion: Optional[str] = None,
        precio_max: Optional[float] = None,
        precio_min: Optional[float] = None,
    ) -> List[EspacioDTO]:
        db = SessionLocal()
        try:
            query = db.query(Espacios).filter(Espacios.disponibilidad.is_(True))

            if tipo:
                query = query.filter(func.lower(Espacios.tipo) == tipo.lower())
            if tamaño:
                query = query.filter(func.lower(Espacios.tamaño) == tamaño.lower())
            if ubicacion:
                query = query.filter(func.lower(Espacios.ubicacion).like(f"%{ubicacion.lower()}%"))
            if precio_max is not None:
                query = query.filter(Espacios.precio <= precio_max)
            if precio_min is not None:
                query = query.filter(Espacios.precio >= precio_min)

            espacios = query.order_by(Espacios.id.asc()).all()
            return [self._a_dto(espacio) for espacio in espacios]
        finally:
            db.close()

    def obtener_por_id(self, id: str) -> Optional[EspacioDTO]:
        db = SessionLocal()
        try:
            espacio_db = db.query(Espacios).filter(Espacios.espacio_id == id).first()
            return self._a_dto(espacio_db) if espacio_db else None
        finally:
            db.close()

    def solicitar_alquiler(self, id: str, solicitud: SolicitudAlquilerDTO):
        db = SessionLocal()
        try:
            espacio = db.query(Espacios).filter(Espacios.espacio_id == id).first()
            if not espacio:
                return None

            if not espacio.disponibilidad:
                raise ValueError("Espacio no disponible")

            alquiler = Alquileres(
                espacio_id=espacio.espacio_id,
                proveedor_id=solicitud.proveedor,
                evento_id=espacio.id_festival,
                fecha_ini=self._parse_datetime(solicitud.fecha_ini),
                fecha_fin=self._parse_datetime(solicitud.fecha_fin),
                comentarios=solicitud.comentarios,
                estado="pendiente",
            )

            espacio.disponibilidad = False
            db.add(alquiler)
            db.commit()
            db.refresh(espacio)
            db.refresh(alquiler)

            return {
                "mensaje": "Solicitud recibida y espacio reservado correctamente.",
                "id": espacio.espacio_id,
                "proveedor": solicitud.proveedor,
                "negocio": solicitud.negocio,
            }
        finally:
            db.close()

    def obtener_historial_eventos_por_proveedor(self, proveedor_id: str) -> List[FestivalDTO]:
        db = SessionLocal()
        try:
            evento_ids = (
                db.query(Alquileres.evento_id)
                .filter(Alquileres.proveedor_id == proveedor_id)
                .distinct()
                .all()
            )
            evento_ids = [evento_id for (evento_id,) in evento_ids]

            if not evento_ids:
                return []

            festivales = db.query(Festivales).filter(Festivales.id.in_(evento_ids)).all()
            return [
                FestivalDTO(
                    id=festival.id,
                    titulo=festival.titulo,
                    pais=festival.pais,
                    ubicacion=festival.ubicacion,
                    fechas=festival.fechas,
                    desc=festival.desc,
                    img=festival.img,
                    tagsBusqueda=festival.tagsBusqueda or [],
                    precios=festival.precios or {},
                    servicios=festival.servicios or [],
                    horarios=festival.horarios or [],
                )
                for festival in festivales
            ]
        finally:
            db.close()

    def crear_espacio(self, espacio_dto: EspacioDTO) -> EspacioDTO:
        db = SessionLocal()
        try:
            espacio_id = espacio_dto.espacio_id or espacio_dto.id
            if not espacio_id:
                raise ValueError("El identificador del espacio es obligatorio.")

            existente = db.query(Espacios).filter(Espacios.espacio_id == espacio_id).first()
            if existente:
                raise ValueError("Ya existe un espacio con ese identificador.")

            nuevo_espacio = Espacios(
                espacio_id=espacio_id,
                tipo=espacio_dto.tipo,
                tamaño=espacio_dto.tamaño,
                ubicacion=espacio_dto.ubicacion,
                precio=espacio_dto.precio,
                disponibilidad=espacio_dto.disponibilidad,
                id_festival=espacio_dto.id_festival,
                desc=espacio_dto.desc,
                dimensiones=espacio_dto.dimensiones,
                servicios=",".join(espacio_dto.servicios) if espacio_dto.servicios else None,
            )

            db.add(nuevo_espacio)
            db.commit()
            db.refresh(nuevo_espacio)

            return self._a_dto(nuevo_espacio)
        finally:
            db.close()

    def actualizar_espacio(self, id: str, espacio_dto: EspacioDTO) -> Optional[EspacioDTO]:
        db = SessionLocal()
        try:
            espacio = db.query(Espacios).filter(Espacios.espacio_id == id).first()
            if not espacio:
                return None

            nuevo_id = espacio_dto.espacio_id or espacio_dto.id or id
            if nuevo_id != id:
                existe_id = db.query(Espacios).filter(Espacios.espacio_id == nuevo_id).first()
                if existe_id:
                    raise ValueError("Ya existe un espacio con ese identificador.")

            espacio.espacio_id = nuevo_id
            espacio.tipo = espacio_dto.tipo
            espacio.tamaño = espacio_dto.tamaño
            espacio.ubicacion = espacio_dto.ubicacion
            espacio.precio = espacio_dto.precio
            espacio.disponibilidad = espacio_dto.disponibilidad
            espacio.id_festival = espacio_dto.id_festival
            espacio.desc = espacio_dto.desc
            espacio.dimensiones = espacio_dto.dimensiones
            espacio.servicios = ",".join(espacio_dto.servicios) if espacio_dto.servicios else None

            db.commit()
            db.refresh(espacio)
            return self._a_dto(espacio)
        finally:
            db.close()

    def eliminar_espacio(self, id: str) -> bool:
        db = SessionLocal()
        try:
            espacio = db.query(Espacios).filter(Espacios.espacio_id == id).first()
            if not espacio:
                return False

            db.delete(espacio)
            db.commit()
            return True
        finally:
            db.close()