# importar aquí los DAOs
from model.dao.festival_dao import FestivalDAO
from model.dao.producto_dao import ProductoDAO
from model.dao.espacio_dao import EspacioDAO
from model.dao.usuario_dao import UsuarioDAO 
from model.dao.entrada_dao import EntradaDAO

class DAOFactory:
    @staticmethod
    def get_festival_dao() -> FestivalDAO:
        return FestivalDAO()
        
    @staticmethod
    def get_producto_dao() -> ProductoDAO:
        return ProductoDAO()

    @staticmethod
    def get_usuario_dao() -> UsuarioDAO:
        return UsuarioDAO()
    
    @staticmethod
    def get_espacio_dao() -> EspacioDAO:
        return EspacioDAO()
    
    @staticmethod
    def get_entrada_dao() -> EntradaDAO:
        return EntradaDAO()
