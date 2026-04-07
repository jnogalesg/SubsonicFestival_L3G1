from model.dao.festival_dao import FestivalDAO
from model.dao.producto_dao import ProductoDAO
from model.dao.espacio_dao import EspacioDAO

class DAOFactory:
    @staticmethod
    def get_festival_dao() -> FestivalDAO:
        return FestivalDAO()
    
    @staticmethod
    def get_producto_dao() -> ProductoDAO:
        return ProductoDAO()
    
    @staticmethod
    def get_espacio_dao() -> EspacioDAO:
        return EspacioDAO()