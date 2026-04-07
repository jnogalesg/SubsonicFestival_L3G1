from model.dto.espacio_dto import EspacioDTO
from typing import Optional, List 

class EspacioDAO:
    def __init__(self):
        # Datos simulados para espacios del festival
        self.espacios = [
            EspacioDTO(id="E1", tipo="Escenario", tamaño="Grande", ubicacion="Plaza Central", precio=1500.0, disponibilidad=True, desc=""),
            EspacioDTO(id="E2", tipo="Stand", tamaño="Mediano", ubicacion="Zona Comercial", precio=500.0, disponibilidad=True, desc=""),
            EspacioDTO(id="E3", tipo="Zona VIP", tamaño="Pequeño", ubicacion="Frente al Escenario", precio=2500.0, disponibilidad=False, desc=""),
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