from model.dao.festival_dao import FestivalDAO

class FestivalDAOFactory:
    @staticmethod
    def get_dao() -> FestivalDAO:
        """
        Crea y devuelve una instancia de FestivalDAO.
        El controlador usará esta fábrica en lugar de crear el DAO directamente.
        """
        return FestivalDAO()