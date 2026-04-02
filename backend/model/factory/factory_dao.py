from model.dao.festival_dao import FestivalDAO
from model.dao.producto_dao import ProductoDAO
from model.dao.usuario_dao import UsuarioDAO 

class DAOFactory:
    
    @staticmethod
    def get_festival_dao():
        return FestivalDAO()
        
    @staticmethod
    def get_producto_dao():
        return ProductoDAO()

    @staticmethod
    def get_usuario_dao():
        return UsuarioDAO()