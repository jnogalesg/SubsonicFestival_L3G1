from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

from model.dto.entrada_dto import EntradaDTO
from model.factory.factory_dao import DAOFactory


class CompraEntradaRequest(BaseModel):
	id_festival: str
	tipo: "TipoEntrada"
	comprador_nombre: str
	comprador_email: str


class CancelarEntradaRequest(BaseModel):
	motivo: Optional[str] = None


class TipoEntrada(str, Enum):
	day = "Day Pass"
	weekend = "Weekend Pass"


def _obtener_precio_festival(festival, tipo: str):
	tipo_normalizado = tipo.strip().lower()
	claves_posibles = {
		"day": ["day", "day pass", "daypass"],
		"weekend": ["weekend", "weekend pass", "weekendpass"],
	}

	for clave, aliases in claves_posibles.items():
		if tipo_normalizado in aliases:
			return getattr(festival, "precios", {}).get(clave)

	return getattr(festival, "precios", {}).get(tipo_normalizado)


def _tipo_catalogo(tipo: TipoEntrada) -> str:
	return tipo.value


router = APIRouter(prefix="/api/entradas", tags=["Entradas"])
dao = DAOFactory.get_entrada_dao()
festival_dao = DAOFactory.get_festival_dao()


@router.post("/comprar", response_model=EntradaDTO, summary="Procesar la compra de un pase")
def comprar_entrada(datos: CompraEntradaRequest):
	festival = festival_dao.obtener_por_id(datos.id_festival)
	if not festival:
		raise HTTPException(status_code=404, detail="Festival no encontrado")

	precio = _obtener_precio_festival(festival, datos.tipo.value)
	if precio is None:
		raise HTTPException(status_code=400, detail="Tipo de pase no disponible para este festival")

	entrada = EntradaDTO(
		id_festival=festival.id,
		evento=festival.titulo,
		fecha=festival.fechas,
		lugar=festival.ubicacion,
		tipo=_tipo_catalogo(datos.tipo),
		precio=float(precio),
		estado="activa",
		comprador_nombre=datos.comprador_nombre,
		comprador_email=datos.comprador_email,
	)
	return dao.crear(entrada)


@router.get("/mis-entradas", response_model=List[EntradaDTO], summary="Listar las entradas del cliente logueado")
def get_mis_entradas(comprador_email: str = Query(..., description="Email del cliente logueado")):
	return dao.obtener_por_comprador(comprador_email)


@router.get("/{id_entrada}", response_model=EntradaDTO, summary="Obtener una entrada por id")
def get_entrada(id_entrada: str):
	entrada = dao.obtener_por_id(id_entrada)
	if not entrada:
		raise HTTPException(status_code=404, detail="Entrada no encontrada")
	return entrada


@router.post("/{id_entrada}/cancelar", response_model=EntradaDTO, summary="Solicitar la cancelación de una entrada")
def cancelar_entrada(id_entrada: str, datos: CancelarEntradaRequest, comprador_email: str = Query(..., description="Email del cliente logueado")):
	entrada = dao.obtener_por_id(id_entrada)
	if not entrada:
		raise HTTPException(status_code=404, detail="Entrada no encontrada")

	if entrada.comprador_email != comprador_email:
		raise HTTPException(status_code=403, detail="No puedes cancelar una entrada que no te pertenece")

	if entrada.estado in ["cancelada", "cancelacion_solicitada"]:
		raise HTTPException(status_code=400, detail="La entrada ya está en proceso de cancelación o cancelada")

	resultado = dao.cancelar(id_entrada, motivo=datos.motivo)
	if not resultado:
		raise HTTPException(status_code=500, detail="Error al procesar la cancelación")

	return resultado
