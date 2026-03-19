from dao.festival_dao import FestivalDAO

class DAOFactory:
    @staticmethod
    def get_festival_dao() -> FestivalDAO:
        return FestivalDAO()