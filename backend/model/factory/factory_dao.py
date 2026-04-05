from model.dao.festival_dao import FestivalDAO
from model.dao.producto_dao import ProductoDAO

class DAOFactory:
    @staticmethod
    def get_festival_dao() -> FestivalDAO:
        return FestivalDAO()
    
    @staticmethod
    def get_producto_dao() -> ProductoDAO:
        return ProductoDAO()