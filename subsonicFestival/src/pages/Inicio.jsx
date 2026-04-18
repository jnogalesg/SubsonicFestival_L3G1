import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Inicio() {
  // Estado para manejar la búsqueda
  const [busqueda, setBusqueda] = useState('');

  //Para la búsqueda con el desplegable de la fecha del evento
  const [fechaSel, setFechaSel] = useState('');

  //Para la búsqueda con el desplegable de la ubicación del evento
  const [ubicacionSel, setUbicacionSel] = useState('');

  //Estado para saber qué evento está resaltado por la búsqueda (si es que hay alguno)
  const [idResaltado, setIdResaltado] = useState(null);

  // Variable para guardar los festivales que vengan de Python
  const [catalogoEventos, setCatalogoEventos] = useState([]);
  const [eventosBackend, setEventosBackend] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    festivales: 0,
    artistas: 0,
    asistentes: 0,
    escenarios: 0,
  });

  const MESES_ES = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];

  // Llamada a la API al abrir la página
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/festivales/')
      .then(respuesta => respuesta.json())
      .then(datos => {
        setCatalogoEventos(datos);
        setEventosBackend(datos);
      })
      .catch(error => console.error("Error al cargar la DB:", error));
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/festivales/estadisticas')
      .then(respuesta => respuesta.json())
      .then(datos => {
        setEstadisticas({
          festivales: Number(datos?.festivales) || 0,
          artistas: Number(datos?.artistas) || 0,
          asistentes: Number(datos?.asistentes) || 0,
          escenarios: Number(datos?.escenarios) || 0,
        });
      })
      .catch(error => console.error("Error al cargar estadísticas:", error));
  }, []);

  const formatearAsistentes = (total) => {
    if (total >= 1000) {
      return `${(total / 1000).toFixed(1).replace('.0', '')}K`;
    }
    return String(total);
  };

  const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

  const extraerMesIndice = (texto = '') => {
    const normalizado = texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const mesesNormalizados = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];

    return mesesNormalizados.findIndex((mes) => normalizado.includes(mes));
  };

  const subtituloHero = (() => {
    if (!catalogoEventos.length) {
      return 'Bélgica · Tailandia · Brasil · Julio – Septiembre 2026';
    }

    const paises = [...new Set(catalogoEventos.map((ev) => ev.pais).filter(Boolean))];
    const paisesTexto = paises.join(' · ');

    const indicesMes = catalogoEventos
      .map((ev) => extraerMesIndice(ev.fechas || ''))
      .filter((idx) => idx >= 0)
      .sort((a, b) => a - b);

    const primerMes = indicesMes.length ? MESES_ES[indicesMes[0]] : null;
    const ultimoMes = indicesMes.length ? MESES_ES[indicesMes[indicesMes.length - 1]] : null;

    const yearMatch = (catalogoEventos[0]?.fechas || '').match(/\b(20\d{2})\b/);
    const year = yearMatch ? yearMatch[1] : '';

    let rangoFechas = '';
    if (primerMes && ultimoMes) {
      rangoFechas = `${capitalizar(primerMes)}${primerMes !== ultimoMes ? ` – ${capitalizar(ultimoMes)}` : ''}${year ? ` ${year}` : ''}`;
    } else if (year) {
      rangoFechas = year;
    }

    if (paisesTexto && rangoFechas) {
      return `${paisesTexto} · ${rangoFechas}`;
    }

    return paisesTexto || 'Festivales disponibles';
  })();

  const opcionesFecha = [...new Set(
    catalogoEventos
      .map((ev) => extraerMesIndice(ev.fechas || ''))
      .filter((idx) => idx >= 0)
  )].sort((a, b) => a - b);

  const opcionesUbicacion = [...new Set(
    catalogoEventos
      .map((ev) => (ev.pais || ev.ubicacion || '').trim())
      .filter(Boolean)
  )];


  // ── DATOS Y ESTADO DE MÚSICA ── en el futuro, conexión con backend
  const datosArtistas = [
    {
      id: 1,
      nombre: 'Tië',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbnua9TEJezEWsj9Eohmbdi0udF6O27t6NmQ&s',
      tags: ['House', 'Mainstage'],
      playlist: [
        { num: '01', titulo: 'The Business', duracion: '2:44' },
        { num: '02', titulo: 'Don\'t Be Shy', duracion: '2:20' },
        { num: '03', titulo: 'The Motto', duracion: '2:44' },
        { num: '04', titulo: 'Hot In It', duracion: '2:09' },
        { num: '05', titulo: 'Lay Low', duracion: '2:33' }
      ]
    },
    {
      id: 2,
      nombre: 'David Guetta',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeo_wr98JZby-RJpcPQ7TefoCsBj0exx-YuA&s',
      tags: ['Big Room', 'Dance'],
      playlist: [
        { num: '01', titulo: 'Titanium', duracion: '4:05' },
        { num: '02', titulo: 'I\'m Good (Blue)', duracion: '2:55' },
        { num: '03', titulo: 'Memories', duracion: '3:30' },
        { num: '04', titulo: 'Sexy Bitch', duracion: '3:13' },
        { num: '05', titulo: 'Without You', duracion: '3:28' }
      ]
    },
    {
      id: 3,
      nombre: 'Martin Garrix',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSySq2NtSO7oM_ZCN0VmHPXIpl7l_2GgURFDw&s',
      tags: ['Progressive', 'Electro'],
      playlist: [
        { num: '01', titulo: 'Animals', duracion: '2:56' },
        { num: '02', titulo: 'In The Name Of Love', duracion: '3:18' },
        { num: '03', titulo: 'Scared To Be Lonely', duracion: '3:40' },
        { num: '04', titulo: 'High On Life', duracion: '3:50' },
        { num: '05', titulo: 'Summer Days', duracion: '2:43' }
      ]
    },
    {
      id: 4,
      nombre: 'Armin van Buuren',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF-_OCnG4F3tsCAPLpTcWwxvmQYyGR7OefMQ&s',
      tags: ['Trance', 'Techno'],
      playlist: [
        { num: '01', titulo: 'Blah Blah Blah', duracion: '3:04' },
        { num: '02', titulo: 'This Is What It Feels Like', duracion: '3:23' },
        { num: '03', titulo: 'Great Spirit', duracion: '3:35' },
        { num: '04', titulo: 'Turn It Up', duracion: '2:52' },
        { num: '05', titulo: 'No Fun', duracion: '2:11' }
      ]
    },
    {
      id: 5,
      nombre: 'DJ Apex',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW_bhHSBpSm9A6W1pDkSqCpXYJbBNzm6PMGw&s',
      tags: ['Hardstyle', 'Raw'],
      playlist: [
        { num: '01', titulo: 'Rise of the Apex', duracion: '3:45' },
        { num: '02', titulo: 'Bass Cannon', duracion: '2:50' },
        { num: '03', titulo: 'Power of Mind', duracion: '3:10' },
        { num: '04', titulo: 'Harder Better Faster', duracion: '2:55' },
        { num: '05', titulo: 'Infinity', duracion: '4:20' }
      ]
    }
  ];

  // Estado del artista activo (por defecto el primero de la lista)
  const [artistaActivo, setArtistaActivo] = useState(datosArtistas[0]);

  const ejecutarBusqueda = async () => {
    const t = busqueda.toLowerCase().trim();
    const f = fechaSel.toLowerCase();
    const u = ubicacionSel.toLowerCase();

    if (t === '' && f === '' && u === '') {
      setEventosBackend(catalogoEventos);
      document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    try {
      const params = new URLSearchParams();
      if (t) params.append('q', t);
      if (f) params.append('fecha', f);
      if (u) params.append('ubicacion', u);

      const respuesta = await fetch(`http://127.0.0.1:8000/api/festivales/buscar?${params.toString()}`);
      if (!respuesta.ok) {
        throw new Error('No se pudo consultar la base de datos');
      }

      const festivales = await respuesta.json();
      setEventosBackend(festivales);

      if (festivales.length > 0) {
        document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setIdResaltado(festivales[0].id);
        setTimeout(() => setIdResaltado(null), 3000);
      } else {
        alert('No existen eventos que coincidan con los criterios seleccionados');
      }
    } catch (error) {
      console.error('Error en búsqueda contra la base de datos:', error);
      alert('No se pudo realizar la búsqueda en este momento.');
    }
  };

  return (
    <>
      {/* TITULO INICIO */}
      <div id="inicio" style={{ paddingTop: '80px' }}>
        <section style={{ padding: 0, maxWidth: '100%' }}>
          <div id="inicio-content" className="hero-section">
            <div className="hero-bg"></div>
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <div className="hero-tag">Festivales de Música Electrónica</div>
              <h1>SUB<em>SONIC</em><br/>FESTIVAL</h1>
              <p className="hero-sub">{subtituloHero}</p>
              {/* Contenedor principal del buscador */}
      <div className="hero-search-container">
        
        {/* Fila superior: Contiene los 3 campos de entrada */}
        <div className="search-inputs-row">
          
          {/* Grupo 1: Búsqueda de texto (más ancho que los otros) */}
          <div className="search-group grow">
            <span className="search-icon"> <i class="fa-solid fa-magnifying-glass"></i> </span>
            <input
              type="text"
              placeholder="Buscar eventos, artistas..."
              value={busqueda} // Conectamos el input con nuestro estado
              onChange={(e) => setBusqueda(e.target.value)} // Actualizamos el estado al escribir
              />
          </div>

          {/* Grupo 2: Selector de Fecha */}
          <div className="search-group">
            <span className="search-icon"> <i class="fa-solid fa-calendar"></i> </span>
            <select 
              value={fechaSel} 
              onChange={(e) => setFechaSel(e.target.value)}
            >
              <option value="">Fecha</option>
              {opcionesFecha.map((idxMes) => (
                <option key={idxMes} value={MESES_ES[idxMes]}>
                  {capitalizar(MESES_ES[idxMes])}
                </option>
              ))}
            </select>
          </div>

          {/* Grupo 3: Selector de Ubicación */}
          <div className="search-group">
            <span className="search-icon"> <i class="fa-solid fa-location-dot"></i> </span>
            <select 
              value={ubicacionSel} 
              onChange={(e) => setUbicacionSel(e.target.value)}
            >
              <option value="">Ubicación</option>
              {opcionesUbicacion.map((ubicacion) => (
                <option key={ubicacion} value={ubicacion}>
                  {ubicacion}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón de acción principal que ocupa todo el ancho inferior */}
        <button className="btn-search-hero" onClick={ejecutarBusqueda}>
          BUSCAR EVENTOS
        </button>
      </div>
            </div>
            <div className="stats-bar">
              <div className="stat"><div className="stat-num">{estadisticas.festivales}</div><div className="stat-label">Festivales</div></div>
              <div className="stat"><div className="stat-num">{estadisticas.artistas}</div><div className="stat-label">Artistas</div></div>
              <div className="stat"><div className="stat-num">{formatearAsistentes(estadisticas.asistentes)}</div><div className="stat-label">Asistentes</div></div>
              <div className="stat"><div className="stat-num">{estadisticas.escenarios}</div><div className="stat-label">Escenarios</div></div>
            </div>
          </div>
        </section>
      </div>

      {/* ── EVENTOS ── */}
      <div id="eventos" className="bg-gradient">
        <section>
          {/* Cabecera de sección con botón de calendario */}
          <div className="header-eventos">
            <div>
              <div className="section-label">Próximos Festivales</div>
              <h2 style={{marginBottom:0}}>EVENTOS 2026</h2>
            </div>
            {/* Botón que redirigirá a la página de calendario */}
            <Link to="/calendario">
              <button className="btn-outline-small btn-calendario"> 
                <i className="fa-solid fa-calendar"></i> Ver Calendario Completo
              </button>
              
            </Link>
          </div>
          
          <div className="grid-eventos-minimal">
            {eventosBackend.map((evento) => (
              <div 
                id={evento.id}
                key={evento.id}
                className={`evento-card-minimal ${idResaltado === evento.id ? 'evento-resaltado' : ''}`}
              >
                <img 
                  className="evento-minimal-img" 
                  src={
                    evento.titulo.toLowerCase().includes('brazil') ? '/subsonic_brasil.jpg' : 
                    evento.titulo.toLowerCase().includes('thailand') ? '/subsonic_tailandia.jpg' : 
                    '/subsonic_belgica.jpg'
                  } 
                  alt={evento.titulo} 
                />
                <div className="evento-minimal-content">
                  <span className="evento-minimal-fecha">{evento.fechas}</span>
                  <div className="evento-minimal-titulo">{evento.titulo}</div>
                  <div className="evento-minimal-loc"> <i class="fa-solid fa-location-dot"></i> {evento.ubicacion}</div>
                  <Link 
                    to={`/evento/${evento.id}`} 
                    className="btn-outline-small"
                    style={{textDecoration: 'none', display: 'inline-block'}}
                  >
                    + Info Completa
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </section>
      </div>


      {/* ── SECCIÓN 3: MÚSICA ── */}
      <div id="musica" className="bg-gradient">
        <section>
          <div className="section-label">Subsonic Radio</div>
          <h2>MÚSICA DEL FESTIVAL</h2>

          {/* SELECTOR DE ARTISTAS */}
          <div className="music-artist-grid">
            {datosArtistas.map((artista) => (
              <div 
                key={artista.id} 
                className={`music-artist-card ${artistaActivo.id === artista.id ? 'activo' : ''}`}
                onClick={() => setArtistaActivo(artista)}
              >
                <img src={artista.img} alt={artista.nombre} />
                <div className="music-artist-overlay">
                  <span>{artista.nombre}</span>
                </div>
              </div>
            ))}
          </div>

          {/* REPRODUCTOR GRANDE */}
          <div className="music-player-card">
            
            {/* Cabecera dinámica */}
            <div className="player-header">
              <div className="player-cover-large">
                <img src={artistaActivo.img} alt={artistaActivo.nombre} />
              </div>
              <div className="player-info-large">
                <h3>{artistaActivo.playlist[0].titulo}</h3>
                <p>{artistaActivo.nombre}</p>
                <div className="player-tags">
                  {artistaActivo.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Controles (Visuales) */}
            <div className="player-body">
              <div className="progress-area">
                <span>0:00</span>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{width: '0%'}}></div>
                </div>
                <span>{artistaActivo.playlist[0].duracion}</span>
              </div>

              <div className="controls-area">
                <button className="btn-control-large">⏮</button>
                <button className="btn-play-large">▶</button>
                <button className="btn-control-large">⏭</button>
              </div>
            </div>

            {/* Lista de reproducción dinámica */}
            <div className="playlist-list">
              {artistaActivo.playlist.map((cancion, index) => (
                <div key={index} className={`playlist-item ${index === 0 ? 'active' : ''}`}>
                  <span className="track-num">{cancion.num}</span>
                  <span className="track-name">{cancion.titulo} — {artistaActivo.nombre}</span>
                  <span className="track-time">{cancion.duracion}</span>
                </div>
              ))}
            </div>

          </div>
        </section>
      </div>      
    </>
  );
}