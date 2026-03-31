class Festival:
    def __init__(self, id_festival, titulo, pais, ubicacion, fechas, desc, img, tagsBusqueda, precios, servicios, horarios):
        self.id_festival = id_festival
        self.titulo = titulo
        self.pais = pais
        self.ubicacion = ubicacion
        self.fechas = fechas
        self.desc = desc
        self.img = img
        self.tagsBusqueda = tagsBusqueda
        self.precios = precios
        self.servicios = servicios
        self.horarios = horarios
        
        # Generamos una lista plana de artistas a partir de los horarios para el endpoint de artistas
        artistas_set = set()
        for stage in horarios:
            for act in stage.get("acts", []):
                artistas_set.add(act.get("artist"))
        self.artistas = list(artistas_set)