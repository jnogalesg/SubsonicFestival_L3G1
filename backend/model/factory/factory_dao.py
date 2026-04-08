from model.dao.festival_dao import FestivalDAO
from model.dao.producto_dao import ProductoDAO
from model.dao.entrada_dao import EntradaDAO

class DAOFactory:
    _festival_dao = FestivalDAO()
    _producto_dao = ProductoDAO()
    _entrada_dao = EntradaDAO()

    @staticmethod
    def get_festival_dao() -> FestivalDAO:
        return DAOFactory._festival_dao
    
    @staticmethod
    def get_producto_dao() -> ProductoDAO:
        return DAOFactory._producto_dao

    @staticmethod
    def get_entrada_dao() -> EntradaDAO:
        return DAOFactory._entrada_dao