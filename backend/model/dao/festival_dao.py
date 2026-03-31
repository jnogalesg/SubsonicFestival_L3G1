from model.festival import Festival

# Traducimos tu dataEventos.jsx a Python
DB_FESTIVALES = [
    Festival(
        id_festival='evento-belgium', titulo='Subsonic Belgium', pais='Bélgica',
        ubicacion='Dreamville Grounds, Boom', fechas='18 – 27 Julio 2026',
        desc='El festival más grande de Europa regresa a Bélgica.', img='/subsonic_belgica.jpg',
        tagsBusqueda=['belgium', 'belgica', 'julio'],
        precios={'day': 89, 'weekend': 199},
        servicios=['Foodtrucks Gourmet', 'Zona de Camping VIP', 'Lockers', 'Parking'],
        horarios=[
            {'stage': 'Main Stage', 'acts': [{'artist': 'Armin van Buuren', 'time': '18:00 - 19:30'}, {'artist': 'Martin Garrix', 'time': '19:30 - 21:00'}, {'artist': 'David Guetta', 'time': '21:00 - 23:00'}]},
            {'stage': 'Freedom Stage', 'acts': [{'artist': 'Tiësto', 'time': '18:00 - 20:00'}, {'artist': 'DJ Apex', 'time': '20:00 - 22:00'}]}
        ]
    ),
    Festival(
        id_festival='evento-thailand', titulo='Subsonic Thailand', pais='Tailandia',
        ubicacion='Maya Festival Site, Pattaya', fechas='8 – 17 Agosto 2026',
        desc='El festival más grande de Asia regresa a Tailandia.', img='/subsonic_tailandia.jpg',
        tagsBusqueda=['thailand', 'tailandia', 'agosto'],
        precios={'day': 75, 'weekend': 160},
        servicios=['Thai Street Food', 'Masajes & Relax', 'Transporte desde Bangkok'],
        horarios=[
            {'stage': 'Main Stage', 'acts': [{'artist': 'Tiësto', 'time': '19:00 - 20:30'}, {'artist': 'Martin Garrix', 'time': '20:30 - 22:00'}, {'artist': 'David Guetta', 'time': '22:00 - 00:00'}]},
            {'stage': 'Jungle Stage', 'acts': [{'artist': 'DJ Apex', 'time': '18:00 - 20:00'}, {'artist': 'Armin van Buuren', 'time': '20:00 - 22:00'}]}
        ]
    ),
    Festival(
        id_festival='evento-brazil', titulo='Subsonic Brazil', pais='Brasil',
        ubicacion='Parque Maeda, Itu', fechas='12 – 21 Septiembre 2026',
        desc='El festival más grande de Sudamérica.', img='/subsonic_brasil.jpg',
        tagsBusqueda=['brazil', 'brasil', 'septiembre'],
        precios={'day': 89, 'weekend': 199},
        servicios=['Churrasco Area', 'Beach Stage', 'Helicopter Transfer'],
        horarios=[
            {'stage': 'Main Stage', 'acts': [{'artist': 'DJ Apex', 'time': '17:00 - 18:30'}, {'artist': 'David Guetta', 'time': '19:00 - 20:30'}, {'artist': 'Martin Garrix', 'time': '20:30 - 22:30'}]},
            {'stage': 'Samba Stage', 'acts': [{'artist': 'Armin van Buuren', 'time': '20:00 - 22:00'}, {'artist': 'Tiësto', 'time': '22:00 - 00:00'}]}
        ]
    )
]

class FestivalDAO:
    def obtener_todos(self):
        return DB_FESTIVALES
    
    def obtener_por_id(self, id_festival: str):
        for f in DB_FESTIVALES:
            if f.id_festival == id_festival:
                return f
        return None
    
    def crear(self, festival: Festival):
        DB_FESTIVALES.append(festival)
        return festival