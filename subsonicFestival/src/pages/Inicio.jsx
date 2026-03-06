import { useState } from 'react';
import { Link } from 'react-router-dom';
import ModalCheckout from '../components/ModalCheckout';
import ModalEventoDetalle from '../components/ModalEventosInfo';

export default function Inicio() {
  // Estado para guardar los datos del ticket seleccionado. 
  // Si es null, el modal estará cerrado.
  const [checkoutData, setCheckoutData] = useState(null);

  //Estado para los eventos que se seleccionen en las tarjetas
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  // Estado para manejar la búsqueda
  const [busqueda, setBusqueda] = useState('');

  //Para la búsqueda con el desplegable de la fecha del evento
  const [fechaSel, setFechaSel] = useState('');

  //Para la búsqueda con el desplegable de la ubicación del evento
  const [ubicacionSel, setUbicacionSel] = useState('');

  // ── DATOS Y ESTADO DE MÚSICA ──
  const datosArtistas = [
    {
      id: 1,
      nombre: 'Tiësto',
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


// ── DATOS EVENTOS (ACTUALIZADO) ──
  const datosEventos = [
    {
      id: 'evento-belgium',
      titulo: 'Subsonic Belgium',
      pais: 'Bélgica',
      ubicacion: 'Dreamville Grounds, Boom',
      fechas: '18 – 27 Julio 2026',
      desc: 'El festival más grande de Europa regresa a Bélgica.',
      img: '/subsonic_belgica.jpg',
      tagsBusqueda: ['belgium', 'belgica', 'julio'],
      precios: { day: 89, weekend: 199 },
      servicios: ['Foodtrucks Gourmet', 'Zona de Camping VIP', 'Lockers', 'Parking'],
      horarios: [
        { stage: 'Main Stage', acts: [{ artist: 'Armin van Buuren', time: '18:00 - 19:30' }, { artist: 'Martin Garrix', time: '19:30 - 21:00' }, { artist: 'David Guetta', time: '21:00 - 23:00' }] },
        { stage: 'Freedom Stage', acts: [{ artist: 'Tiësto', time: '18:00 - 20:00' }, { artist: 'DJ Apex', time: '20:00 - 22:00' }] }
      ]
    },
    {
      id: 'evento-thailand',
      titulo: 'Subsonic Thailand',
      pais: 'Tailandia',
      ubicacion: 'Maya Festival Site, Pattaya',
      fechas: '8 – 17 Agosto 2026',
      desc: 'El festival más grande de Asia regresa a Tailandia.',
      img: '/subsonic_tailandia.jpg',
      tagsBusqueda: ['thailand', 'tailandia', 'agosto'],
      precios: { day: 75, weekend: 160 },
      servicios: ['Thai Street Food', 'Masajes & Relax', 'Transporte desde Bangkok'],
      horarios: [
        { stage: 'Main Stage', acts: [{ artist: 'Tiësto', time: '19:00 - 20:30' }, { artist: 'Martin Garrix', time: '20:30 - 22:00' }] },
        { stage: 'Jungle Stage', acts: [{ artist: 'DJ Apex', time: '18:00 - 20:00' }] }
      ]
    },
    {
      id: 'evento-brazil',
      titulo: 'Subsonic Brazil',
      pais: 'Brasil',
      ubicacion: 'Parque Maeda, Itu',
      fechas: '12 – 21 Septiembre 2026',
      desc: 'El festival más grande de Sudamérica.',
      img: '/subsonic_brasil.jpg',
      tagsBusqueda: ['brazil', 'brasil', 'septiembre'],
      precios: { day: 89, weekend: 199 },
      servicios: ['Churrasco Area', 'Beach Stage', 'Helicopter Transfer'],
      horarios: [
        { stage: 'Main Stage', acts: [{ artist: 'Alok', time: '17:00 - 18:30' }, { artist: 'David Guetta', time: '19:00 - 21:00' }] },
        { stage: 'Samba Stage', acts: [{ artist: 'Armin van Buuren', time: '20:00 - 22:00' }] }
      ]
    }
  ];

  // Función para abrir el modal con los datos correctos
  const abrirCheckout = (tipo, precio, evento, fecha, lugar) => {
    setCheckoutData({ tipo, precio, evento, fecha, lugar });
  };

const ejecutarBusqueda = () => {
  const t = busqueda.toLowerCase().trim();
  const f = fechaSel.toLowerCase();
  const u = ubicacionSel.toLowerCase();

  // 1. CASO: TODO VACÍO -> Ir a la sección general
  if (t === '' && f === '' && u === '') {
    document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  // Definimos los datos de referencia de cada festival para comparar
  const festivales = [
    {
      id: 'evento-belgium',
      nombres: ['belgium', 'belgica', 'bélgica', 'subsonic belgium', 'subsonic belgica', 'subsonic bélgica'],
      artistas: ['dj apex', 'armin van buuren', 'armin', 'martin garrix', 'david guetta', 'tiësto', 'tiesto'],
      fecha: 'julio',
      ubicacion: 'bélgica'
    },
    {
      id: 'evento-thailand',
      nombres: ['thailand', 'tailandia', 'subsonic thailand', 'subsonic tailandia'],
      artistas: ['dj apex', 'armin van buuren', 'armin', 'martin garrix', 'david guetta', 'tiësto', 'tiesto'],
      fecha: 'agosto',
      ubicacion: 'tailandia'
    },
    {
      id: 'evento-brazil',
      nombres: ['brazil', 'brasil', 'subsonic brazil', 'subsonic brasil'],
      artistas: ['dj apex', 'armin van buuren', 'armin', 'martin garrix', 'david guetta', 'tiësto', 'tiesto'],
      fecha: 'septiembre',
      ubicacion: 'brasil'
    }
  ];

  // Buscamos si existe un festival que cumpla con TODOS los campos que NO estén vacíos
  const encontrado = festivales.find(fest => {
    // Si el texto está relleno, debe coincidir con el nombre
    const coincideTexto = t === '' || fest.nombres.some(n => n.includes(t)) || fest.artistas.some(a => a.includes(t));
    // Si la fecha está rellena, debe coincidir
    const coincideFecha = f === '' || fest.fecha === f;
    // Si la ubicación está rellena, debe coincidir
    const coincideUbicacion = u === '' || fest.ubicacion === u;

    return coincideTexto && coincideFecha && coincideUbicacion;
  });

  if (encontrado) {
    document.getElementById(encontrado.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // Mensaje unificado para cuando los filtros mezclados no coinciden (Funcionalidades 4, 5, 6 y 7)
    alert('No existen eventos que coincidan con los criterios seleccionados');
  }
};

  return (
    <>
      {/* TITULO INICIO - Fíjate en cómo se escriben los estilos en línea en React: {{ objeto }} */}
      <div id="inicio" style={{ paddingTop: '80px' }}>
        <section style={{ padding: 0, maxWidth: '100%' }}>
          <div id="inicio-content" className="hero-section">
            <div className="hero-bg"></div>
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <div className="hero-tag">Festivales de Música Electrónica</div>
              <h1>SUB<em>SONIC</em><br/>FESTIVAL</h1>
              <p className="hero-sub">Bélgica · Tailandia · Brasil &nbsp;·&nbsp; Julio – Septiembre 2026</p>
              {/* Contenedor principal del buscador */}
      <div className="hero-search-container">
        
        {/* Fila superior: Contiene los 3 campos de entrada */}
        <div className="search-inputs-row">
          
          {/* Grupo 1: Búsqueda de texto (más ancho que los otros) */}
          <div className="search-group grow">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar eventos, artistas..."
              value={busqueda} // Conectamos el input con nuestro estado
              onChange={(e) => setBusqueda(e.target.value)} // Actualizamos el estado al escribir
              />
          </div>

          {/* Grupo 2: Selector de Fecha */}
          <div className="search-group">
            <span className="search-icon">📅</span>
            <select 
              value={fechaSel} 
              onChange={(e) => setFechaSel(e.target.value)}
            >
              <option value="">Fecha</option>
              <option value="julio">Julio 2026</option>
              <option value="agosto">Agosto 2026</option>
              <option value="septiembre">Septiembre 2026</option>
            </select>
          </div>

          {/* Grupo 3: Selector de Ubicación */}
          <div className="search-group">
            <span className="search-icon">📍</span>
            <select 
              value={ubicacionSel} 
              onChange={(e) => setUbicacionSel(e.target.value)}
            >
              <option value="">Ubicación</option>
              <option value="bélgica">Bélgica</option>
              <option value="tailandia">Tailandia</option>
              <option value="brasil">Brasil</option>
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
              <div className="stat"><div className="stat-num">3</div><div className="stat-label">Festivales</div></div>
              <div className="stat"><div className="stat-num">150+</div><div className="stat-label">Artistas</div></div>
              <div className="stat"><div className="stat-num">400K</div><div className="stat-label">Asistentes</div></div>
              <div className="stat"><div className="stat-num">12</div><div className="stat-label">Escenarios</div></div>
            </div>
          </div>
        </section>
      </div>

      {/* ── EVENTOS (NUEVA ESTRUCTURA MINIMALISTA) ── */}
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
              <button className="btn-outline-small">📅 Ver Calendario Completo</button>
            </Link>
          </div>
          
          <div className="grid-eventos-minimal">
            {/* AQUÍ ESTÁ LA MAGIA: Esto crea las 3 tarjetas automáticamente */}
            {datosEventos.map((evento) => (
              <div key={evento.id} className="evento-card-minimal">
                <img className="evento-minimal-img" src={evento.img} alt={evento.titulo} />
                <div className="evento-minimal-content">
                  <span className="evento-minimal-fecha">{evento.fechas}</span>
                  <div className="evento-minimal-titulo">{evento.titulo}</div>
                  <div className="evento-minimal-loc">📍 {evento.ubicacion}</div>
                  <button 
                    className="btn-outline-small"
                    onClick={() => setEventoSeleccionado(evento)}
                  >
                    + Info Completa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>


      {/* ── SECCIÓN 3: MÚSICA (ACTUALIZADA Y DINÁMICA) ── */}
      <div id="musica" className="bg-gradient">
        <section>
          <div className="section-label">Subsonic Radio</div>
          <h2>SONIDOS DEL FESTIVAL</h2>

          {/* SELECTOR DE ARTISTAS (NUEVO DISEÑO TARJETAS) */}
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

          {/* REPRODUCTOR GRANDE (DINÁMICO) */}
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


      {/* ── SECCIÓN 4: TIENDA ── */}
      <div id="tienda" className="bg-gradient">
        <section>
          <div className="section-label">Official Merch</div>
          <h2>TIENDA SUBSONIC</h2>
          
          <div className="tienda-grid">

            {/* CAMISETA */}
            <div className="producto-card">
              <img src="/camiseta.jpg" alt="Camiseta" />
              <div className="producto-info">
                <span>Camiseta Oficial Subsonic 2026</span>
                <strong>29.99€</strong>
                <button 
                  className="btn-nav"
                  onClick={() => abrirCheckout('Camiseta Oficial', 29.99, 'Subsonic Store', 'Envío: 2-3 días', 'Tallas: S / M / L / XL')}
                >
                  Comprar
                </button>
              </div>
            </div>

            {/* GORRA */}
            <div className="producto-card">
              <img src="/gorra.jpg" alt="Gorra" />
              <div className="producto-info">
                <span>Gorra Subsonic Black</span>
                <strong>19.99€</strong>
                <button 
                  className="btn-nav"
                  onClick={() => abrirCheckout('Gorra Black', 19.99, 'Subsonic Store', 'Envío: 2-3 días', 'Talla Única Ajustable')}
                >
                  Comprar
                </button>
              </div>
            </div>

            {/* SUDADERA */}
            <div className="producto-card">
              <img src="/sudadera.jpg" alt="Sudadera" />
              <div className="producto-info">
                <span>Sudadera Festival Red</span>
                <strong>49.99€</strong>
                <button 
                  className="btn-nav"
                  onClick={() => abrirCheckout('Sudadera Red', 49.99, 'Subsonic Store', 'Envío: Gratis', 'Tallas: S / M / L / XL')}
                >
                  Comprar
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>


      {/* MODAL DE COMPRA */}
      <ModalCheckout 
        isOpen={!!checkoutData} // Convierte el objeto a boolean (true si hay datos, false si es null)
        onClose={() => setCheckoutData(null)} 
        ticketData={checkoutData} 
      />

      {/* MODAL DETALLES EVENTO */}
      {eventoSeleccionado && (
        <ModalEventoDetalle 
          data={eventoSeleccionado} 
          onClose={() => setEventoSeleccionado(null)}
          abrirCheckout={abrirCheckout}
        />
      )}

    </>
  );
}