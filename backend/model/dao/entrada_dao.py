from __future__ import annotations

from typing import List, Optional
from uuid import uuid4

from model.dto.entrada_dto import EntradaDTO


DB_ENTRADAS = [
	EntradaDTO(
		id_entrada="entrada-001",
		id_festival="evento-belgium",
		evento="Subsonic Belgium",
		fecha="18 – 27 Julio 2026",
		lugar="Dreamville Grounds, Boom",
		tipo="Day Pass",
		precio=89.0,
		estado="activa",
		comprador_nombre="María López",
		comprador_email="maria.lopez@example.com",
		codigo_qr="SB-2026-BE-001",
	),
	EntradaDTO(
		id_entrada="entrada-002",
		id_festival="evento-belgium",
		evento="Subsonic Belgium",
		fecha="18 – 27 Julio 2026",
		lugar="Dreamville Grounds, Boom",
		tipo="Weekend Pass",
		precio=199.0,
		estado="activa",
		comprador_nombre="Carlos Pérez",
		comprador_email="carlos.perez@example.com",
		codigo_qr="SB-2026-BE-002",
	),
	EntradaDTO(
		id_entrada="entrada-003",
		id_festival="evento-thailand",
		evento="Subsonic Thailand",
		fecha="8 – 17 Agosto 2026",
		lugar="Maya Festival Site, Pattaya",
		tipo="Day Pass",
		precio=75.0,
		estado="pendiente",
		comprador_nombre="Laura Martín",
		comprador_email="laura.martin@example.com",
		codigo_qr="SB-2026-TH-001",
	),
]


class EntradaDAO:
	def __init__(self):
		# Almacenamiento temporal en memoria hasta conectar con persistencia real.
		self._entradas = DB_ENTRADAS

	def obtener_todas(self) -> List[EntradaDTO]:
		return list(self._entradas)

	def obtener_por_id(self, id_entrada: str) -> Optional[EntradaDTO]:
		for entrada in self._entradas:
			if entrada.id_entrada == id_entrada:
				return entrada
		return None

	def obtener_por_festival(self, id_festival: str) -> List[EntradaDTO]:
		return [entrada for entrada in self._entradas if entrada.id_festival == id_festival]

	def obtener_por_comprador(self, comprador_email: str) -> List[EntradaDTO]:
		return [entrada for entrada in self._entradas if entrada.comprador_email == comprador_email]

	def crear(self, entrada: EntradaDTO) -> EntradaDTO:
		nueva_entrada = entrada.model_copy(update={
			"id_entrada": entrada.id_entrada or f"entrada-{uuid4().hex[:8]}",
			"codigo_qr": entrada.codigo_qr or f"QR-{uuid4().hex[:12].upper()}",
		})
		self._entradas.append(nueva_entrada)
		return nueva_entrada

	def actualizar_estado(self, id_entrada: str, estado: str) -> Optional[EntradaDTO]:
		entrada = self.obtener_por_id(id_entrada)
		if not entrada:
			return None

		entrada.estado = estado
		return entrada

	def solicitar_cancelacion(self, id_entrada: str) -> Optional[EntradaDTO]:
		entrada = self.obtener_por_id(id_entrada)
		if not entrada:
			return None

		entrada.estado = "cancelacion_solicitada"
		entrada.solicitud_cancelacion = True
		return entrada

	def cancelar(self, id_entrada: str, motivo: Optional[str] = None) -> Optional[EntradaDTO]:
		entrada = self.obtener_por_id(id_entrada)
		if not entrada:
			return None

		entrada.estado = "cancelada"
		entrada.solicitud_cancelacion = False
		entrada.motivo_cancelacion = motivo
		return entrada
