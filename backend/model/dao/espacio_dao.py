from model.dto.alquiler_dto import SolicitudAlquilerDTO
from model.dto.espacio_dto import EspacioDTO
from model.dto.festival_dto import FestivalDTO
from typing import Optional, List 

class EspacioDAO:
    def __init__(self):
        # Datos simulados para espacios del festival
        self.espacios = [
            EspacioDTO(id="E1", tipo="Escenario", tamaño="Grande", ubicacion="Plaza Central", precio=1500.0, disponibilidad=True, desc="", dimensiones = "20m x 10m", servicios = ["electricidad", "iluminación"]),
            EspacioDTO(id="E2", tipo="Stand", tamaño="Mediano", ubicacion="Zona Comercial", precio=500.0, disponibilidad=True, desc=""),
            EspacioDTO(id="E3", tipo="Zona VIP", tamaño="Pequeño", ubicacion="Frente al Escenario", precio=2500.0, disponibilidad=False, desc=""),
        ]
        # Lista simulada de alquileres: cada uno ligado a un proveedor y un evento
        self.alquileres = [
            {"proveedor_id": "proveedor1", "evento_id": "evento-belgium", "espacio_id": "E1"},
            {"proveedor_id": "proveedor1", "evento_id": "evento-thailand", "espacio_id": "E2"},
            {"proveedor_id": "proveedor2", "evento_id": "evento-brazil", "espacio_id": "E3"},
          
        ]

    def obtener_espacios_disponibles(self)->List[EspacioDTO]:
        return [e for e in self.espacios if e.disponibilidad == True]
    
    def buscar_espacios(
            self,
            tipo: Optional[str] = None,
            tamaño: Optional[str] = None,
            ubicacion: Optional[str] = None,
            precio_max: Optional[float] = None,
            precio_min: Optional[float] = None
         ) -> List[EspacioDTO]:
        resultados = self.obtener_espacios_disponibles()
            #A continuación se aplican los filtros uno por uno
        if tipo: resultados = [e for e in resultados if e.tipo.lower() == tipo.lower()]
        if tamaño: resultados = [e for e in resultados if e.tamaño.lower() == tamaño.lower()]
        if ubicacion: resultados = [e for e in resultados if ubicacion.lower() in e.ubicacion.lower()]
        if precio_max is not None: resultados = [e for e in resultados if e.precio <= precio_max]
        if precio_min is not None: resultados = [e for e in resultados if e.precio >= precio_min]

        return resultados
    
    def obtener_por_id(self, id: str)-> Optional[EspacioDTO]:
       return next((e for e in self.espacios if e.id == id), None)
    
    def solicitar_alquiler(self, id: str, solicitud: SolicitudAlquilerDTO):
        espacio = self.obtener_por_id(id)
        if not espacio: return None
        if not espacio.disponibilidad: raise ValueError("Espacio no disponible")

        espacio.disponibilidad = False
        self.alquileres.append({
            "proveedor_id": solicitud.proveedor,
            "evento_id": f"evento-{id}",
            "espacio_id": id,
        })

        return {
            "mensaje": "Solicitud recibida y espacio reservado correctamente.",
            "id": id,
            "proveedor": solicitud.proveedor,
            "negocio": solicitud.negocio,
        }

    def obtener_historial_eventos_por_proveedor(self, proveedor_id: str) -> List[FestivalDTO]:
        from model.dao.festival_dao import DB_FESTIVALES  # Importar la lista de festivales
        evento_ids = [a["evento_id"] for a in self.alquileres if a["proveedor_id"] == proveedor_id]
        return [f for f in DB_FESTIVALES if f.id in evento_ids]
    
    def crear_espacio(self, espacio_dto: EspacioDTO) -> EspacioDTO:
        self.espacios.append(espacio_dto)
        return espacio_dto
    
    def solicitar_alquiler(self, id: str, solicitud: SolicitudAlquilerDTO):
        espacio = self.obtener_por_id(id) # Busca por el ID que pasamos (ej: "E1")
        if not espacio: return None
        if not espacio.disponibilidad: raise ValueError("Espacio ya ocupado")

        espacio.disponibilidad = False
        # Guardamos el alquiler vinculándolo al evento que ya tiene el espacio
        self.alquileres.append({
            "proveedor_id": solicitud.proveedor,
            "evento_id": espacio.id_festival, # Usamos el festival real del espacio
            "espacio_id": id,
        })

        return {
            "mensaje": "Solicitud recibida y espacio reservado correctamente.",
            "id": id
        }