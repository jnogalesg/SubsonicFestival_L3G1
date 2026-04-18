from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from typing import List, Optional

from model.dto.entrada_dto import EntradaCreateDTO, EntradaDTO
from model.factory.factory_dao import DAOFactory


class CancelarEntradaRequest(BaseModel):
	motivo: Optional[str] = None


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


def _tipo_catalogo(tipo: str) -> str:
	tipo_normalizado = tipo.strip().lower()
	if tipo_normalizado in ["day", "day pass", "daypass"]:
		return "Day Pass"
	if tipo_normalizado in ["weekend", "weekend pass", "weekendpass"]:
		return "Weekend Pass"
	return tipo.strip()


router = APIRouter(prefix="/api/entradas", tags=["Entradas"])
dao = DAOFactory.get_entrada_dao()
festival_dao = DAOFactory.get_festival_dao()
usuario_dao = DAOFactory.get_usuario_dao()
security = HTTPBearer()


def _verificar_rol_cliente(email: str):
	"""Comprueba en la BD que el usuario tiene rol 'cliente'. Lanza 403 si no."""
	usuario = usuario_dao.obtener_por_email(email)
	if not usuario:
		raise HTTPException(status_code=404, detail="Usuario no encontrado")
	if usuario.rol != "cliente":
		raise HTTPException(
			status_code=403,
			detail=f"Acción solo permitida para clientes. Tu rol es: {usuario.rol}"
		)


def _obtener_cliente_logueado(credentials: HTTPAuthorizationCredentials = Depends(security)):
	id_token = credentials.credentials
	try:
		usuario = usuario_dao.login_usuario(id_token)
		if usuario.rol != "cliente":
			raise HTTPException(
				status_code=403,
				detail=f"Acción solo permitida para clientes. Tu rol es: {usuario.rol}"
			)
		return usuario
	except HTTPException:
		raise
	except Exception:
		raise HTTPException(status_code=401, detail="Debes iniciar sesión para comprar entradas")


@router.post("/comprar", response_model=EntradaDTO, summary="Procesar la compra de un pase")
def comprar_entrada(datos: EntradaCreateDTO, cliente=Depends(_obtener_cliente_logueado)):
	# El comprador se obtiene del token autenticado para evitar suplantaciones
	comprador_email = cliente.email
	comprador_nombre = f"{cliente.nombre or ''} {cliente.apellidos or ''}".strip() or cliente.email

	festival = festival_dao.obtener_por_id(datos.id_festival)
	if not festival:
		raise HTTPException(status_code=404, detail="Festival no encontrado")

	precio = _obtener_precio_festival(festival, datos.tipo)
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
		comprador_nombre=comprador_nombre,
		comprador_email=comprador_email,
	)
	return dao.crear(entrada)


@router.get("/mis-entradas", response_model=List[EntradaDTO], summary="Listar las entradas del cliente logueado")
def get_mis_entradas(comprador_email: str = Query(..., description="Email del cliente logueado")):
	# Solo los clientes tienen entradas
	_verificar_rol_cliente(comprador_email)
	return dao.obtener_por_comprador(comprador_email)


@router.get("/{id_entrada}", response_model=EntradaDTO, summary="Obtener una entrada por id")
def get_entrada(id_entrada: str, comprador_email: str = Query(..., description="Email del cliente logueado")):
	# Solo clientes pueden consultar el detalle de su propia entrada
	_verificar_rol_cliente(comprador_email)

	entrada = dao.obtener_por_id(id_entrada)
	if not entrada:
		raise HTTPException(status_code=404, detail="Entrada no encontrada")

	if entrada.comprador_email != comprador_email:
		raise HTTPException(status_code=403, detail="No puedes consultar una entrada que no te pertenece")
	return entrada


@router.post("/{id_entrada}/cancelar", response_model=EntradaDTO, summary="Solicitar la cancelación de una entrada")
def cancelar_entrada(id_entrada: str, datos: CancelarEntradaRequest, comprador_email: str = Query(..., description="Email del cliente logueado")):
	# Solo clientes pueden cancelar sus entradas
	_verificar_rol_cliente(comprador_email)

	entrada = dao.obtener_por_id(id_entrada)
	if not entrada:
		raise HTTPException(status_code=404, detail="Entrada no encontrada")

	if entrada.comprador_email != comprador_email:
		raise HTTPException(status_code=403, detail="No puedes cancelar una entrada que no te pertenece")

	if entrada.estado in ["cancelada", "cancelacion_solicitada"]:
		raise HTTPException(status_code=400, detail="La entrada ya está en proceso de cancelación o cancelada")

	resultado = dao.solicitar_cancelacion(id_entrada, motivo=datos.motivo)
	if not resultado:
		raise HTTPException(status_code=500, detail="Error al solicitar la cancelación")

	return resultado
