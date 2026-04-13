from __future__ import annotations

from typing import List, Optional
from uuid import uuid4

from config.database import SessionLocal
from model.models import Entradas
from model.dto.entrada_dto import EntradaDTO


class EntradaDAO:

	# --- Método auxiliar: convierte una fila de BD a DTO ---
	@staticmethod
	def _a_dto(entrada_db: Entradas) -> EntradaDTO:
		return EntradaDTO(
			id_entrada=entrada_db.id_entrada,
			id_festival=entrada_db.id_festival,
			evento=entrada_db.evento,
			fecha=entrada_db.fecha,
			lugar=entrada_db.lugar,
			tipo=entrada_db.tipo,
			precio=entrada_db.precio,
			estado=entrada_db.estado,
			comprador_nombre=entrada_db.comprador_nombre,
			comprador_email=entrada_db.comprador_email,
			codigo_qr=entrada_db.codigo_qr,
			solicitud_cancelacion=entrada_db.solicitud_cancelacion or False,
			motivo_cancelacion=entrada_db.motivo_cancelacion,
		)

	def obtener_todas(self) -> List[EntradaDTO]:
		db = SessionLocal()
		try:
			entradas = db.query(Entradas).all()
			return [self._a_dto(e) for e in entradas]
		finally:
			db.close()

	def obtener_por_id(self, id_entrada: str) -> Optional[EntradaDTO]:
		db = SessionLocal()
		try:
			entrada = db.query(Entradas).filter(Entradas.id_entrada == id_entrada).first()
			return self._a_dto(entrada) if entrada else None
		finally:
			db.close()

	def obtener_por_festival(self, id_festival: str) -> List[EntradaDTO]:
		db = SessionLocal()
		try:
			entradas = db.query(Entradas).filter(Entradas.id_festival == id_festival).all()
			return [self._a_dto(e) for e in entradas]
		finally:
			db.close()

	def obtener_por_comprador(self, comprador_email: str) -> List[EntradaDTO]:
		db = SessionLocal()
		try:
			entradas = db.query(Entradas).filter(Entradas.comprador_email == comprador_email).all()
			return [self._a_dto(e) for e in entradas]
		finally:
			db.close()

	def crear(self, entrada: EntradaDTO) -> EntradaDTO:
		db = SessionLocal()
		try:
			nueva = Entradas(
				id_entrada=entrada.id_entrada or f"entrada-{uuid4().hex[:8]}",
				id_festival=entrada.id_festival,
				evento=entrada.evento,
				fecha=entrada.fecha,
				lugar=entrada.lugar,
				tipo=entrada.tipo,
				precio=entrada.precio,
				estado=entrada.estado or "activa",
				comprador_nombre=entrada.comprador_nombre,
				comprador_email=entrada.comprador_email,
				codigo_qr=entrada.codigo_qr or f"QR-{uuid4().hex[:12].upper()}",
				solicitud_cancelacion=False,
				motivo_cancelacion=None,
			)
			db.add(nueva)
			db.commit()
			db.refresh(nueva)
			return self._a_dto(nueva)
		finally:
			db.close()

	def actualizar_estado(self, id_entrada: str, estado: str) -> Optional[EntradaDTO]:
		db = SessionLocal()
		try:
			entrada = db.query(Entradas).filter(Entradas.id_entrada == id_entrada).first()
			if not entrada:
				return None
			entrada.estado = estado
			db.commit()
			db.refresh(entrada)
			return self._a_dto(entrada)
		finally:
			db.close()

	def solicitar_cancelacion(self, id_entrada: str) -> Optional[EntradaDTO]:
		db = SessionLocal()
		try:
			entrada = db.query(Entradas).filter(Entradas.id_entrada == id_entrada).first()
			if not entrada:
				return None
			entrada.estado = "cancelacion_solicitada"
			entrada.solicitud_cancelacion = True
			db.commit()
			db.refresh(entrada)
			return self._a_dto(entrada)
		finally:
			db.close()

	def cancelar(self, id_entrada: str, motivo: Optional[str] = None) -> Optional[EntradaDTO]:
		db = SessionLocal()
		try:
			entrada = db.query(Entradas).filter(Entradas.id_entrada == id_entrada).first()
			if not entrada:
				return None
			entrada.estado = "cancelada"
			entrada.solicitud_cancelacion = False
			entrada.motivo_cancelacion = motivo
			db.commit()
			db.refresh(entrada)
			return self._a_dto(entrada)
		finally:
			db.close()
