// src/components/perfil/PerfilCliente.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import QRCode from 'react-qr-code';
import { auth } from '../../firebase/firebaseConfig';

import '../PerfilCliente/PerfilCliente.css'; 

import { obtenerPerfilCompleto, actualizarPerfilUsuario, desactivarCuentaUsuario, eliminarCuentaUsuario } from '../../firebase/userRoleService';

export default function PerfilCliente({ datos }) {
  const [seccionActiva, setSeccionActiva] = useState('inicio');
  const [todasLasEntradas, setTodasLasEntradas] = useState([]);
  const [cargandoEntradas, setCargandoEntradas] = useState(false);
  const [errorEntradas, setErrorEntradas] = useState('');
  const [entradaQR, setEntradaQR] = useState(null);
  const [cargandoQR, setCargandoQR] = useState(false);
  const [errorQR, setErrorQR] = useState('');
  const [proximosEventos, setProximosEventos] = useState([]);
  const [datosPersonales, setDatosPersonales] = useState({  // Datos para mostrar en el formulario.
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  const [preferenciaNovedades, setPreferenciaNovedades] = useState({
    email: true,
    sms: false,
    notificacionesApp: true
  });
  const [editando, setEditando] = useState(false);
  const datosArtistas = [
    {
      id: 1,
      nombre: 'Tiësto',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbnua9TEJezEWsj9Eohmbdi0udF6O27t6NmQ&s',
      tags: ['House', 'Mainstage'],
      playlist: [
        { num: '01', titulo: 'The Business', duracion: '2:44' },
        { num: '02', titulo: 'Don\'t Be Shy', duracion: '2:20' },
        { num: '03', titulo: 'The Motto', duracion: '2:44' }
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
        { num: '03', titulo: 'Memories', duracion: '3:30' }
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
        { num: '03', titulo: 'High On Life', duracion: '3:50' }
      ]
    }
  ];

  const [artistaActivo, setArtistaActivo] = useState(datosArtistas[0]);

  const entradasCompradas = todasLasEntradas.filter((entrada) => entrada.estado === 'activa');
  const entradasCanceladas = todasLasEntradas.filter(
    (entrada) => entrada.estado === 'cancelada' || entrada.estado === 'cancelacion_solicitada'
  );

  const artistasFavoritos = datosArtistas.map((artista) => artista.nombre);

  const navigate = useNavigate();

  useEffect(() => {
    const cargarEntradas = async () => {
      const emailUsuario = localStorage.getItem('userEmail');

      if (!emailUsuario) {
        setTodasLasEntradas([]);
        setErrorEntradas('No se ha encontrado el email del usuario para cargar las entradas.');
        return;
      }

      setCargandoEntradas(true);
      setErrorEntradas('');

      try {
        const [entradasResponse, festivalesResponse] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/entradas/mis-entradas?comprador_email=${encodeURIComponent(emailUsuario)}`),
          fetch('http://127.0.0.1:8000/api/festivales/'),
        ]);

        if (!entradasResponse.ok) {
          const data = await entradasResponse.json().catch(() => ({}));
          throw new Error(data.detail || data.mensaje || 'No se pudieron cargar las entradas.');
        }

        const data = await entradasResponse.json();
        const entradasFormateadas = Array.isArray(data)
          ? data.map((entrada) => ({
              id: entrada.id_entrada,
              tipo: entrada.tipo,
              evento: entrada.evento,
              fecha: entrada.fecha,
              lugar: entrada.lugar,
              estado: entrada.estado,
            }))
          : [];

        setTodasLasEntradas(entradasFormateadas);

        if (festivalesResponse.ok) {
          const festivalesData = await festivalesResponse.json();
          setProximosEventos(Array.isArray(festivalesData) ? festivalesData : []);
        } else {
          setProximosEventos([]);
        }
      } catch (error) {
        setTodasLasEntradas([]);
        setProximosEventos([]);
        setErrorEntradas(error.message || 'No se pudieron cargar las entradas.');
      } finally {
        setCargandoEntradas(false);
      }
    };

    cargarEntradas();
  }, []);

  const cancelarEntrada = async (id_entrada) => {
    const emailUsuario = localStorage.getItem('userEmail');
    if (!emailUsuario) return;

    if (!window.confirm('¿Seguro que quieres cancelar esta entrada?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/entradas/${id_entrada}/cancelar?comprador_email=${encodeURIComponent(emailUsuario)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: 'Cancelación solicitada por el usuario' }),
      });

      if (!response.ok) throw new Error('Error al cancelar');

      const entradaActualizada = await response.json();

      setTodasLasEntradas((prev) =>
        prev.map((e) => (e.id === id_entrada ? { ...e, estado: entradaActualizada.estado } : e))
      );
      alert('Solicitud de cancelación enviada correctamente.');
    } catch {
      alert('No se pudo cancelar la entrada. Inténtalo de nuevo.');
    }
  };

  const verQR = async (id_entrada) => {
    const emailUsuario = localStorage.getItem('userEmail');
    if (!emailUsuario) return;

    setEntradaQR(null);
    setErrorQR('');
    setCargandoQR(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/entradas/${id_entrada}?comprador_email=${encodeURIComponent(emailUsuario)}`
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'No se pudo cargar la entrada.');
      }

      const data = await response.json();
      setEntradaQR(data);
    } catch (error) {
      setErrorQR(error.message || 'No se pudo cargar el QR.');
    } finally {
      setCargandoQR(false);
    }
  };

  const cerrarQR = () => {
    setEntradaQR(null);
    setErrorQR('');
    setCargandoQR(false);
  };

  const cerrarSesion = async () => {
    await signOut(auth);
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const actualizarDatoPersonal = (e) => {
    const { name, value } = e.target;
    setDatosPersonales((prevDatos) => ({
      ...prevDatos,
      [name]: value
    }));
  };

  const actualizarPreferenciaNovedades = (e) => {
    const { name, checked } = e.target;
    setPreferenciaNovedades((prevPrefs) => ({
      ...prevPrefs,
      [name]: checked
    }));
  };

// Sincronizar los datos que vienen del backend con tu formulario
  useEffect(() => {
    if (datos) {
      setDatosPersonales({
        id: datos.id, // Guardamos el ID para el backend
        nombre: datos.nombre || '',
        apellidos: datos.apellidos || '',
        email: datos.email || '',
        telefono: datos.telefono || '',
        direccion: datos.direccion || '',
        rol: datos.rol
      });
    }
  }, [datos]);

  const modificarDatos = async (e) => {
    e.preventDefault();
    try {
      await actualizarPerfilUsuario(datosPersonales);
      alert("¡Perfil actualizado correctamente en la Base de Datos!");
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  const cerrarYLimpiarSesion = async () => {
    await signOut(auth);
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const manejarDesactivarCuenta = async () => {
    if (!window.confirm('¿Quieres desactivar tu cuenta? Podrás recuperarla más adelante.')) {
      return;
    }

    try {
      await desactivarCuentaUsuario();
      await cerrarYLimpiarSesion();
    } catch (error) {
      alert('No se pudo desactivar la cuenta: ' + error.message);
    }
  };

  const manejarEliminarCuenta = async () => {
    if (!window.confirm('¿Quieres eliminar tu cuenta de forma permanente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await eliminarCuentaUsuario();
      await cerrarYLimpiarSesion();
    } catch (error) {
      alert('No se pudo eliminar la cuenta: ' + error.message);
    }
  };

  return (
    // ESTRUCTURA PRINCIPAL DEL PERFIL CLIENTE
    <main className="dashboard-container perfil-cliente">
      
      {/* --- BARRA LATERAL --- */}
      <aside className="dashboard-sidebar">
        <div className="user-profile-summary">
          <div className="user-avatar"><i className="fa-solid fa-user"></i></div>
          <h3>{datosPersonales.nombre}</h3>
          <p className="user-role">Asistente</p>
        </div>
        
        <div className="sidebar-nav">
          <ul>
            <li>
              <a href="#inicio" className={seccionActiva === 'inicio' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('inicio'); }}>
                <i className="fa-solid fa-home"></i> Inicio
              </a>
            </li>
            <li>
              <a href="#datos-personales" className={seccionActiva === 'datos-personales' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('datos-personales'); }}>
                <i className="fa-solid fa-user-gear"></i> Datos Personales
              </a>
            </li>
            <li>
              <a href="#mis-entradas" className={seccionActiva === 'mis-entradas' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('mis-entradas'); }}>
                <i className="fa-solid fa-ticket"></i> Mis Entradas
              </a>
            </li>
            <li>
              <a href="#reproductor" className={seccionActiva === 'reproductor' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('reproductor'); }}>
                <i className="fa-solid fa-music"></i> Reproductor
              </a>
            </li>
          </ul>
        </div>

        <button className="btn-secondary logout-button" onClick={cerrarSesion}>
          Cerrar Sesión
        </button>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <section className="dashboard-content">
        {/* INICIO */}
        {seccionActiva === 'inicio' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Bienvenido/a, {datosPersonales.nombre}</h2>
              <p>Este es tu resumen rápido de actividad en Subsonic Festival.</p>
            </header>

            {/* PANTALLA RESUMEN (Artistas favoritos, próximos eventos, entradas activas) */}
            <div className="resumen-grid">
              {/* Proximos eventos */}
              <article className="resumen-card">
                <div className="resumen-titulo">Próximos eventos</div>
                <div className="resumen-numero">{proximosEventos.length}</div>
              </article>
              {/* Artistas favoritos  */}
              <article className="resumen-card">
                <div className="resumen-titulo">Artistas favoritos</div>
                <div className="resumen-numero">{artistasFavoritos.length}</div>
              </article>
              {/* Entradas activas  */}
              <article className="resumen-card">
                <div className="resumen-titulo">Entradas activas</div>
                <div className="resumen-numero">{entradasCompradas.length}</div>
              </article>
            </div>

            {/* Sección próximas entradas (solo muestra 2, a modo de resumen) */}
            <div className="preview-entradas">
              <h3>Próximas entradas</h3>
              <div className="preview-lista">
                {/* cogemos solo las 2 primeras entradas activas para mostrar un resumen rápido. */}
                {cargandoEntradas && <p>Cargando entradas...</p>}
                {!cargandoEntradas && entradasCompradas.length === 0 && <p>No tienes entradas activas.</p>}
                {entradasCompradas.slice(0, 2).map((entrada) => (
                  <article key={entrada.id} className="preview-item">
                    <div>
                      <span className={`ticket-type ${entrada.tipo === 'Pase VIP' ? 'vip' : ''}`}>{entrada.tipo}</span>
                      <h4>{entrada.evento}</h4>
                      <p><i className="fa-regular fa-calendar"></i> {entrada.fecha}</p>
                      <p><i className="fa-solid fa-location-dot"></i> {entrada.lugar}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* DATOS PERSONALES  */}
        {seccionActiva === 'datos-personales' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Datos Personales</h2>
              <p>Actualiza tu información de contacto y perfil.</p>
            </header>

            <form className="perfil-form" onSubmit={modificarDatos}>
              <div className="perfil-form-grid">
                <div className="perfil-field">
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={datosPersonales.nombre}
                    onChange={actualizarDatoPersonal}
                  />
                </div>

                <div className="perfil-field">
                  <label htmlFor="apellidos">Apellidos</label>
                  <input
                    id="apellidos"
                    name="apellidos"
                    type="text"
                    value={datosPersonales.apellidos}
                    onChange={actualizarDatoPersonal}
                  />
                </div>

                <div className="perfil-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={datosPersonales.email}
                    onChange={actualizarDatoPersonal}
                  />
                </div>

                <div className="perfil-field">
                  <label htmlFor="telefono">Número de teléfono</label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={datosPersonales.telefono}
                    onChange={actualizarDatoPersonal}
                  />
                </div>

                <div className="perfil-field perfil-field-full">
                  <label htmlFor="direccion">Dirección</label>
                  <input
                    id="direccion"
                    name="direccion"
                    type="text"
                    value={datosPersonales.direccion}
                    onChange={actualizarDatoPersonal}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary">Modificar</button>
            </form>

            {/* Sección Preferencias de Novedades */}
            <header className="section-header section-header-spaced">
              <h2>Preferencias de Comunicación</h2>
              <p>Configura cómo quieres recibir información sobre nuevos eventos y ofertas especiales.</p>
            </header>
              
            <div className="preferencias-grid">
              <div className="preferencia-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="email"
                    checked={preferenciaNovedades.email}
                    onChange={actualizarPreferenciaNovedades}
                  />
                  <span className="checkmark"></span>
                  <div className="preferencia-info">
                    <strong>Email</strong>
                    <span>Recibir newsletters y promociones por email</span>
                  </div>
                </label>
              </div>

              <div className="preferencia-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="sms"
                    checked={preferenciaNovedades.sms}
                    onChange={actualizarPreferenciaNovedades}
                  />
                  <span className="checkmark"></span>
                  <div className="preferencia-info">
                    <strong>SMS</strong>
                    <span>Alertas importantes por mensaje de texto</span>
                  </div>
                </label>
              </div>

              <div className="preferencia-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="notificacionesApp"
                    checked={preferenciaNovedades.notificacionesApp}
                    onChange={actualizarPreferenciaNovedades}
                  />
                  <span className="checkmark"></span>
                  <div className="preferencia-info">
                    <strong>Notificaciones Push</strong>
                    <span>Notificaciones en tiempo real en la aplicación</span>
                  </div>
                </label>
              </div>
            </div>

            <button className="btn-primary btn-save-preferences">Guardar Preferencias</button>            {/* Sección Gestión de Cuenta */}
            <header className="section-header section-header-spaced">
              <h2>Gestión de Cuenta</h2>
              <p>Opciones avanzadas para tu cuenta de usuario.</p>
            </header>
              
            <div className="tickets-grid">
                <div className="ticket-card">
                  <div className="ticket-info">
                    <span className="ticket-type">Suspensión Temporal</span>
                    <h3>Desactivar Cuenta</h3>
                    <p className="ticket-date"><i className="fa-solid fa-pause-circle"></i> Suspende temporalmente tu actividad</p>
                    <p className="ticket-location"><i className="fa-solid fa-clock"></i> Mantiene todos tus datos guardados</p>
                  </div>
                  <div className="ticket-actions">
                    <button className="btn-secondary" onClick={manejarDesactivarCuenta}>Desactivar Cuenta</button>
                  </div>
                </div>

                <div className="ticket-card">
                  <div className="ticket-info">
                    <span className="ticket-type danger">Eliminación Permanente</span>
                    <h3>Eliminar Cuenta</h3>
                    <p className="ticket-date"><i className="fa-solid fa-trash-can"></i> Elimina permanentemente tu cuenta</p>
                    <p className="ticket-location"><i className="fa-solid fa-exclamation-triangle"></i> Acción irreversible - Se pierden todos los datos</p>
                  </div>
                  <div className="ticket-actions">
                    <button className="btn-danger" onClick={manejarEliminarCuenta}>Eliminar Cuenta</button>
                  </div>
                </div>
              </div>
          </div>
        )}

        {/* MIS ENTRADAS */}
        {seccionActiva === 'mis-entradas' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Mis Entradas</h2>
              <p>Gestiona tus accesos para los próximos festivales.</p>
            </header>

            {cargandoEntradas && <p>Cargando entradas...</p>}
            {!cargandoEntradas && errorEntradas && <p style={{ color: 'red' }}>{errorEntradas}</p>}

            {!cargandoEntradas && (
              <>
                <h3 style={{ marginBottom: '12px' }}>
                  <i className="fa-solid fa-ticket" style={{ marginRight: '8px', color: '#e91e8c' }}></i>
                  Entradas compradas ({entradasCompradas.length})
                </h3>

                {entradasCompradas.length === 0 && !errorEntradas && (
                  <p style={{ opacity: 0.6, marginBottom: '24px' }}>No tienes entradas compradas por el momento.</p>
                )}

                <div className="tickets-grid">
                  {entradasCompradas.map((entrada) => (
                    <div key={entrada.id} className="ticket-card">
                      <div className="ticket-info">
                        <span className={`ticket-type ${entrada.tipo === 'Pase VIP' ? 'vip' : ''}`}>{entrada.tipo}</span>
                        <h3>{entrada.evento}</h3>
                        <p className="ticket-date"><i className="fa-regular fa-calendar"></i> {entrada.fecha}</p>
                        <p className="ticket-location"><i className="fa-solid fa-location-dot"></i> {entrada.lugar}</p>
                      </div>
                      <div className="ticket-actions">
                        <button className="btn-primary" onClick={() => verQR(entrada.id)}>
                          Ver Entrada / QR
                        </button>
                        <button className="btn-secondary" onClick={() => cancelarEntrada(entrada.id)}>
                          Cancelar Entrada
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {entradasCanceladas.length > 0 && (
                  <>
                    <h3 style={{ margin: '32px 0 12px' }}>
                      <i className="fa-solid fa-ban" style={{ marginRight: '8px', color: '#888' }}></i>
                      Entradas canceladas ({entradasCanceladas.length})
                    </h3>
                    <div className="tickets-grid">
                      {entradasCanceladas.map((entrada) => (
                        <div key={entrada.id} className="ticket-card" style={{ opacity: 0.5 }}>
                          <div className="ticket-info">
                            <span className="ticket-type" style={{ textDecoration: 'line-through' }}>{entrada.tipo}</span>
                            <h3>{entrada.evento}</h3>
                            <p className="ticket-date"><i className="fa-regular fa-calendar"></i> {entrada.fecha}</p>
                            <p className="ticket-location"><i className="fa-solid fa-location-dot"></i> {entrada.lugar}</p>
                            <p style={{ color: '#888', fontSize: '13px', marginTop: '6px' }}>
                              <i className="fa-solid fa-ban"></i> {entrada.estado === 'cancelacion_solicitada' ? 'Cancelacion en proceso' : 'Cancelada'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {(cargandoQR || errorQR || entradaQR) && (
          <div className="qr-modal-overlay" onClick={cerrarQR}>
            <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
              <button className="qr-modal-close" onClick={cerrarQR} aria-label="Cerrar QR">×</button>

              <h3>Entrada / QR</h3>

              {cargandoQR && <p>Cargando entrada...</p>}
              {!cargandoQR && errorQR && <p className="qr-error">{errorQR}</p>}

              {!cargandoQR && entradaQR && (
                <>
                  <p className="qr-modal-subtitle">Muestra este código en la entrada del festival</p>

                  <div className="qr-placeholder">
                    <QRCode
                      value={JSON.stringify({
                        id_entrada: entradaQR.id_entrada,
                        codigo_qr: entradaQR.codigo_qr || entradaQR.id_entrada,
                        evento: entradaQR.evento,
                        tipo: entradaQR.tipo,
                      })}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#111111"
                      level="M"
                    />
                  </div>

                  <div className="qr-info">
                    <p><strong>Evento:</strong> {entradaQR.evento}</p>
                    <p><strong>Tipo:</strong> {entradaQR.tipo}</p>
                    <p><strong>Fecha:</strong> {entradaQR.fecha}</p>
                    <p><strong>Código:</strong> {entradaQR.codigo_qr || entradaQR.id_entrada}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* REPRODUCTOR (similar al de la página principal) */}
        {seccionActiva === 'reproductor' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Reproductor</h2>
              <p>Descubre una selección de tus artistas favoritos.</p>
            </header>

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

            <div className="music-player-card">
              <div className="player-header">
                <div className="player-cover-large">
                  <img src={artistaActivo.img} alt={artistaActivo.nombre} />
                </div>
                <div className="player-info-large">
                  <h3>{artistaActivo.playlist[0].titulo}</h3>
                  <p>{artistaActivo.nombre}</p>
                  <div className="player-tags">
                    {artistaActivo.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="player-body">
                <div className="progress-area">
                  <span>0:00</span>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill progress-bar-initial"></div>
                  </div>
                  <span>{artistaActivo.playlist[0].duracion}</span>
                </div>

                <div className="controls-area">
                  <button className="btn-control-large">⏮</button>
                  <button className="btn-play-large">▶</button>
                  <button className="btn-control-large">⏭</button>
                </div>
              </div>

              <div className="playlist-list">
                {artistaActivo.playlist.map((cancion, index) => (
                  <div key={cancion.num} className={`playlist-item ${index === 0 ? 'active' : ''}`}>
                    <span className="track-num">{cancion.num}</span>
                    <span className="track-name">{cancion.titulo} — {artistaActivo.nombre}</span>
                    <span className="track-time">{cancion.duracion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </section>
      
    </main>
  );
}