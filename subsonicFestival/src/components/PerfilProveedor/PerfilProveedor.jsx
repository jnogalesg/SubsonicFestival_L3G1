import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import './PerfilProveedor.css'; 
import { actualizarPerfilUsuario, desactivarCuentaUsuario, eliminarCuentaUsuario  } from '../../firebase/userRoleService';

function FormularioCompletarPerfil({ onSubmit }) {
  const [tipoServicio, setTipoServicio] = useState('');

  const manejarSubmit = (e) => {
    e.preventDefault();
    onSubmit(tipoServicio);
  };

  return (
    <form className="perfil-form proveedor-completar-perfil" onSubmit={manejarSubmit}>
      <div className="perfil-field perfil-field-full">
        <label htmlFor="tipo_servicio">Tipo de servicio</label>
        <select
          id="tipo_servicio"
          value={tipoServicio}
          onChange={(e) => setTipoServicio(e.target.value)}
          required
        >
          <option value="">Selecciona una opción</option>
          <option value="catering">Catering</option>
          <option value="bebidas">Bebidas / Coctelería</option>
          <option value="food-truck">Food Truck</option>
          <option value="merchandising">Merchandising</option>
          <option value="alquiler-espacios">Alquiler de espacios</option>
        </select>
      </div>

      <div className="perfil-form-actions">
        <button type="submit" className="btn-primary">Guardar perfil</button>
      </div>
    </form>
  );
}

export default function PerfilProveedor({ datos }) {
  const [seccionActiva, setSeccionActiva] = useState('perfil');
  const [misAlquileres, setMisAlquileres] = useState([]);
  const [historialEventos, setHistorialEventos] = useState([]);
  const [historialCargando, setHistorialCargando] = useState(false);
  const [historialError, setHistorialError] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [tamanoFiltro, setTamanoFiltro] = useState('');
  const [ubicacionFiltro, setUbicacionFiltro] = useState('');
  const [servicioFiltro, setServicioFiltro] = useState('');
  const [precioMinFiltro, setPrecioMinFiltro] = useState('');
  const [precioMaxFiltro, setPrecioMaxFiltro] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    tipo: '',
    tamano: '',
    ubicacion: '',
    servicio: '',
    minPrice: '',
    maxPrice: '',
  });
  const [proveedorAlquiler, setProveedorAlquiler] = useState('');
  const [negocioAlquiler, setNegocioAlquiler] = useState('');
  const [contactoAlquiler, setContactoAlquiler] = useState('');
  const [fechaIniAlquiler, setFechaIniAlquiler] = useState('');
  const [fechaFinAlquiler, setFechaFinAlquiler] = useState('');
  const [comentariosAlquiler, setComentariosAlquiler] = useState('');
  const [alquilerMensaje, setAlquilerMensaje] = useState('');
  const [alquilerError, setAlquilerError] = useState('');
  const [alquilerCargando, setAlquilerCargando] = useState(false);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const navigate = useNavigate();
  const [espaciosLibres, setEspaciosLibres] = useState([]);
  const [datosPersonales, setDatosPersonales] = useState({  // Datos para mostrar en el formulario.
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    tipo_servicio: '',
    descripcion_servicio: ''
  });

  const obtenerMensajeErrorBackend = (errorData, fallback = 'Ha ocurrido un error.') => {
    const detail = errorData?.detail ?? errorData?.mensaje;
    if (Array.isArray(detail)) {
      const partes = detail.map((item) => item?.msg || JSON.stringify(item)).filter(Boolean);
      return partes.length > 0 ? partes.join(' | ') : fallback;
    }
    if (detail && typeof detail === 'object') {
      return detail.msg || JSON.stringify(detail);
    }
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    return fallback;
  };

  const cargarDatosAlquiler = async () => {
    try {
      const proveedorId = datos?.email || datosPersonales.email || '';
      const [resEspacios, resAlquileres] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/espacios/'),
        proveedorId
          ? fetch(`http://127.0.0.1:8000/api/espacios/mis-alquileres?proveedor_id=${encodeURIComponent(proveedorId)}`)
          : Promise.resolve({ ok: false }),
      ]);

      if (resEspacios.ok) {
        const datosEspacios = await resEspacios.json();
        setEspaciosLibres(Array.isArray(datosEspacios) ? datosEspacios : []);
      }

      if (resAlquileres.ok) {
        const datosAlquileres = await resAlquileres.json();
        setMisAlquileres(Array.isArray(datosAlquileres) ? datosAlquileres : []);
      } else {
        setMisAlquileres([]);
      }
    } catch (err) {
      console.error('Error al cargar datos de alquiler:', err);
    }
  };


  useEffect(() => {
    if (seccionActiva === 'alquiler' || seccionActiva === 'mis-servicios') {
      cargarDatosAlquiler();
    }
  }, [seccionActiva, datos?.email, datosPersonales.email]);

  useEffect(() => {
    const cargarHistorial = async () => {
      if (seccionActiva !== 'historial-eventos') return;

      setHistorialCargando(true);
      setHistorialError('');

      try {
        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : null;

        if (!token) {
          throw new Error('No hay token de autenticación disponible');
        }

        const response = await fetch('http://127.0.0.1:8000/api/espacios/historial', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || 'Error al cargar el historial de eventos');
        }

        const data = await response.json();
        setHistorialEventos(Array.isArray(data) ? data : []);
      } catch (error) {
        setHistorialError(error.message || 'Error al cargar el historial de eventos');
        setHistorialEventos([]);
      } finally {
        setHistorialCargando(false);
      }
    };

    cargarHistorial();
  }, [seccionActiva]);

  const filteredEspacios = useMemo(() => {
    return espaciosLibres
      .filter((espacio) => espacio.disponibilidad)
      .filter((espacio) => {
        if (filtrosAplicados.tipo && (espacio.tipo || '').toLowerCase() !== filtrosAplicados.tipo.toLowerCase()) return false;
        if (filtrosAplicados.tamano && (espacio.tamaño || '').toLowerCase() !== filtrosAplicados.tamano.toLowerCase()) return false;
        if (
          filtrosAplicados.ubicacion
          && !(espacio.ubicacion || '').toLowerCase().includes(filtrosAplicados.ubicacion.toLowerCase())
        ) return false;
        if (filtrosAplicados.servicio) {
          const servicios = Array.isArray(espacio.servicios)
            ? espacio.servicios
            : String(espacio.servicios || '').split(',').map((item) => item.trim()).filter(Boolean);
          const coincideServicio = servicios.some((servicio) =>
            servicio.toLowerCase().includes(filtrosAplicados.servicio.toLowerCase()),
          );
          if (!coincideServicio) return false;
        }
        const min = Number(filtrosAplicados.minPrice);
        const max = Number(filtrosAplicados.maxPrice);
        if (filtrosAplicados.minPrice !== '' && !Number.isNaN(min) && Number(espacio.precio) < min) return false;
        if (filtrosAplicados.maxPrice !== '' && !Number.isNaN(max) && Number(espacio.precio) > max) return false;
        return true;
      });
  }, [espaciosLibres, filtrosAplicados]);

  const aplicarFiltros = (e) => {
    e.preventDefault();
    setFiltrosAplicados({
      tipo: tipoFiltro,
      tamano: tamanoFiltro,
      ubicacion: ubicacionFiltro,
      servicio: servicioFiltro,
      minPrice: precioMinFiltro,
      maxPrice: precioMaxFiltro,
    });
  };

  const limpiarFiltros = (e) => {
    e.preventDefault();
    setTipoFiltro('');
    setTamanoFiltro('');
    setUbicacionFiltro('');
    setServicioFiltro('');
    setPrecioMinFiltro('');
    setPrecioMaxFiltro('');
    setFiltrosAplicados({
      tipo: '',
      tamano: '',
      ubicacion: '',
      servicio: '',
      minPrice: '',
      maxPrice: '',
    });
    setEspacioSeleccionado(null);
  };

  const seleccionarEspacio = async (espacio) => {
    setAlquilerMensaje('');
    setAlquilerError('');

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/espacios/${encodeURIComponent(espacio.id)}`);
      if (!response.ok) {
        setEspacioSeleccionado(espacio);
        return;
      }

      const detalle = await response.json();
      setEspacioSeleccionado(detalle);
    } catch (error) {
      setEspacioSeleccionado(espacio);
    }
  };

  const cerrarSesion = async () => {
    await signOut(auth);
    navigate('/');
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
        tipo_servicio: datos.tipo_servicio || '',
        descripcion_servicio: datos.descripcion_servicio || '',
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

  const actualizarDatoPersonal = (e) => {
    const { name, value } = e.target;
    setDatosPersonales((prevDatos) => ({
      ...prevDatos,
      [name]: value
    }));
  };

  const completarPerfilProveedor = async (tipoServicio) => {
    const nuevosDatos = {
      ...datosPersonales,
      tipo_servicio: tipoServicio,
    };

    setDatosPersonales(nuevosDatos);

    try {
      await actualizarPerfilUsuario(nuevosDatos);
      alert("¡Tipo de servicio guardado correctamente!");
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  // Función para solicitar el alquiler de un espacio
  const solicitarAlquiler = async (espacio) => {
    const idEspacio = espacio.id; 

    if (!idEspacio) {
      alert("No se ha podido identificar la parcela seleccionada.");
      return;
    }

    // Construimos el objeto con TODOS los campos que pide tu DTO en el backend
    const solicitud = {
      proveedor: datos?.email || datosPersonales.email || "proveedor@sin-email.local",
      negocio: datosPersonales.nombre_negocio || `Negocio de ${datos?.nombre || 'Proveedor'}`,
      contacto: datosPersonales.telefono || datosPersonales.email || "Sin contacto",
      fecha_ini: "2026-07-01T00:00:00",
      fecha_fin: "2026-07-15T00:00:00",
      detalles: `Alquiler de ${espacio.tipo} en ${espacio.ubicacion}`,
      comentarios: "" 
    };

    try {
      const respuesta = await fetch(`http://localhost:8000/api/espacios/${idEspacio}/alquilar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(solicitud)
      });

      if (respuesta.ok) {
        const resultado = await respuesta.json();
        alert("¡Éxito! " + resultado.mensaje);
        await cargarDatosAlquiler();
      } else {
        const errorData = await respuesta.json().catch(() => null);
        const mensajeError = obtenerMensajeErrorBackend(errorData, 'Datos inválidos');
        alert('Error del servidor: ' + mensajeError);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const finalizarAlquiler = async (alquiler) => {
    const confirmado = window.confirm('¿Quieres finalizar este alquiler? La parcela volvera a estar disponible.');
    if (!confirmado) {
      return;
    }

    try {
      const proveedorId = datos?.email || datosPersonales.email || '';
      const idAlquiler = Number(alquiler?.id_alquiler);
      if (!Number.isInteger(idAlquiler)) {
        await cargarDatosAlquiler();
        throw new Error('El alquiler aún no estaba sincronizado. Se ha refrescado la lista, inténtalo de nuevo.');
      }

      const response = await fetch(`http://127.0.0.1:8000/api/espacios/alquileres/${encodeURIComponent(alquiler.id_alquiler)}/finalizar?proveedor_id=${encodeURIComponent(proveedorId)}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(obtenerMensajeErrorBackend(errorData, 'No se pudo finalizar el alquiler.'));
      }

      const data = await response.json();
      alert(data.mensaje || 'Alquiler finalizado correctamente.');
      await cargarDatosAlquiler();
    } catch (error) {
      alert(error.message || 'Error al finalizar el alquiler.');
    }
  };

  useEffect(() => {
    if (!espacioSeleccionado) {
      return;
    }

    const sigueVisible = filteredEspacios.some((espacio) => espacio.id === espacioSeleccionado.id);
    if (!sigueVisible) {
      setEspacioSeleccionado(null);
    }
  }, [filteredEspacios, espacioSeleccionado]);

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
    <main className="dashboard-container perfil-proveedor">
      
      {/* --- BARRA LATERAL --- */}
      <aside className="dashboard-sidebar">
        <div className="user-profile-summary">
          <div className="user-avatar"><i className="fa-solid fa-shop"></i></div>
          <h3>{datos.nombre} {datos.apellidos}</h3>
          <p className="user-role">Socio Comercial</p>
        </div>
        
        <div className="sidebar-nav">
          <ul>
            <li>
              <a href="#perfil" 
                 className={seccionActiva === 'perfil' ? 'active' : ''} 
                 onClick={(e) => { e.preventDefault(); setSeccionActiva('perfil'); }}>
                <i className="fa-solid fa-user-tie"></i> Perfil Empresarial
              </a>
            </li>
            <li>
              <a href="#mis-servicios" 
                 className={seccionActiva === 'mis-servicios' ? 'active' : ''} 
                 onClick={(e) => { e.preventDefault(); setSeccionActiva('mis-servicios'); }}>
                <i className="fa-solid fa-boxes-stacked"></i> Mis Servicios
              </a>
            </li>
            <li>
              <a href="#historial-eventos" 
                 className={seccionActiva === 'historial-eventos' ? 'active' : ''} 
                 onClick={(e) => { e.preventDefault(); setSeccionActiva('historial-eventos'); }}>
                <i className="fa-solid fa-history"></i> Historial de Eventos
              </a>
            </li>
            <li>
              <a href="#alquiler" 
                 className={seccionActiva === 'alquiler' ? 'active' : ''} 
                 onClick={(e) => { e.preventDefault(); setSeccionActiva('alquiler'); }}>
                <i className="fa-solid fa-map-location-dot"></i> Alquilar Espacios
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

        {seccionActiva === 'perfil' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Perfil de Proveedor</h2>
              <p>Información personal y datos corporativos de tu empresa.</p>
            </header>

            {/* Alerta de perfil incompleto */}
            {!datosPersonales.tipo_servicio && (
              <section className="perfil-alerta-completitud">
                <div className="perfil-alerta-icono">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>

                <div className="perfil-alerta-contenido">
                  <span className="perfil-alerta-etiqueta">Perfil incompleto</span>
                  <h3>Hola, {datos.nombre}</h3>
                  <p>
                    Tu perfil de proveedor está incompleto. Rellena el tipo de servicio que ofreces para poder
                    alquilar espacios en el festival.
                  </p>

                  <FormularioCompletarPerfil onSubmit={completarPerfilProveedor} />
                </div>
              </section>
            )}

            {/* Sección Datos Personales */}
            <header className="section-header section-header-personal">
              <h3 className="section-title-personal">Datos Personales del Responsable</h3>
            </header>

            {/* Información Personal */}
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

                <div className="perfil-field perfil-field-full">
                  <label htmlFor="tipo_servicio">Tipo de servicio</label>
                  <select
                    id="tipo_servicio"
                    name="tipo_servicio"
                    value={datosPersonales.tipo_servicio}
                    onChange={actualizarDatoPersonal}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="catering">Catering</option>
                    <option value="bebidas">Bebidas / Coctelería</option>
                    <option value="food-truck">Food Truck</option>
                    <option value="merchandising">Merchandising</option>
                    <option value="alquiler-espacios">Alquiler de espacios</option>
                  </select>
                </div>

                <div className="perfil-field perfil-field-full">
                  <label htmlFor="descripcion_servicio">Descripción del servicio</label>
                  <textarea
                    id="descripcion_servicio"
                    name="descripcion_servicio"
                    rows={4}
                    placeholder="Describe brevemente tu servicio, especialidades y alcance..."
                    value={datosPersonales.descripcion_servicio}
                    onChange={actualizarDatoPersonal}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary">Modificar</button>
            </form>

           

            {/* Sección Gestión de Cuenta */}
            <header className="section-header section-header-gestion">
              <h3 className="section-title-gestion">Gestión de Cuenta</h3>
            </header>

            <div className="tickets-grid">
              {/* Desactivar Cuenta Temporalmente */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type ticket-type-warning">Suspensión Temporal</span>
                  <h3>Desactivar Cuenta</h3>
                  <p className="ticket-date"><i className="fa-solid fa-pause-circle"></i> Suspender actividad temporalmente</p>
                  <p className="ticket-location"><i className="fa-solid fa-clock"></i> Podrás reactivarla cuando quieras</p>
                  <p className="ticket-location"><i className="fa-solid fa-info-circle"></i> Mantiene todos tus datos</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-secondary">Más Información</button>
                  <button className="btn-warning" onClick={manejarDesactivarCuenta}>
                    Desactivar Cuenta
                  </button>
                </div>
              </div>

              {/* Eliminar Cuenta Permanentemente */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type ticket-type-danger">Eliminación Permanente</span>
                  <h3>Eliminar Cuenta</h3>
                  <p className="ticket-date"><i className="fa-solid fa-trash"></i> Eliminación completa y permanente</p>
                  <p className="ticket-location"><i className="fa-solid fa-exclamation-triangle"></i> Acción irreversible</p>
                  <p className="ticket-location"><i className="fa-solid fa-ban"></i> Se perderán todos los datos</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-secondary">Leer Condiciones</button>
                  <button className="btn-danger" onClick={manejarEliminarCuenta}>
                    Eliminar Cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {seccionActiva === 'mis-servicios' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Mis Servicios y Puestos</h2>
              <p>Gestiona tu presencia y stock en los eventos activos.</p>
            </header>

            <div className="tickets-grid">
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type" style={{ background: '#00aa88' }}>Resumen</span>
                  <h3>Mis alquileres activos</h3>
                  <p className="ticket-date"><i className="fa-solid fa-store"></i> Alquileres en curso: {misAlquileres.length}</p>
                  <p className="ticket-location"><i className="fa-solid fa-info-circle"></i> Aquí puedes revisar y finalizar tus alquileres actuales.</p>
                </div>
              </div>

              {misAlquileres.length > 0 ? (
                misAlquileres.map((alquiler) => (
                  <div className="ticket-card" key={alquiler.id_alquiler}>
                    <div className="ticket-info">
                      <span className="ticket-type" style={{ background: '#00aa88' }}>{alquiler.estado}</span>
                      <h3>{alquiler.tipo} - {alquiler.ubicacion}</h3>
                      <p className="ticket-date"><i className="fa-solid fa-calendar-days"></i> Evento: {alquiler.evento_id}</p>
                      <p className="ticket-location"><i className="fa-solid fa-ruler-combined"></i> Tamaño: {alquiler.tamaño || 'No especificado'}</p>
                      <p className="ticket-price" style={{ color: '#00ffcc' }}>{alquiler.precio} €</p>
                    </div>
                    <div className="ticket-actions">
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => finalizarAlquiler(alquiler)}
                        style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                      >
                        Finalizar alquiler
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="ticket-card">
                  <div className="ticket-info">
                    <span className="ticket-type">Sin actividad</span>
                    <h3>No tienes alquileres activos</h3>
                    <p className="ticket-date"><i className="fa-solid fa-info-circle"></i> Cuando alquiles una parcela aparecerá aquí.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sección de historial de eventos */}
        {seccionActiva === 'historial-eventos' && (
          <div className="dashboard-section">
            <header className="section-header section-header-historial">
              <h2>Historial de Eventos</h2>
              <p>Eventos pasados en los que has participado como proveedor.</p>
            </header>

            <div className="tickets-grid">
              {historialCargando ? (
                <div className="ticket-card">
                  <div className="ticket-info">
                    <span className="ticket-type">Cargando</span>
                    <h3>Cargando historial...</h3>
                  </div>
                </div>
              ) : historialError ? (
                <div className="ticket-card">
                  <div className="ticket-info">
                    <span className="ticket-type ticket-type-warning">Error</span>
                    <h3>{historialError}</h3>
                  </div>
                </div>
              ) : historialEventos.length === 0 ? (
                <div className="ticket-card">
                  <div className="ticket-info">
                    <span className="ticket-type finalizado">Historial</span>
                    <h3>No hay eventos en tu historial</h3>
                    <p className="ticket-date"><i className="fa-solid fa-info-circle"></i> No has participado aún en eventos o no hay datos disponibles.</p>
                  </div>
                </div>
              ) : (
                historialEventos.map((evento) => (
                  <div className="ticket-card" key={evento.id}>
                    <div className="ticket-info">
                      <span className="ticket-type finalizado">Evento</span>
                      <h3>{evento.titulo}</h3>
                      <p className="ticket-date"><i className="fa-solid fa-location-dot"></i> {evento.ubicacion}</p>
                      <p className="ticket-location"><i className="fa-solid fa-calendar-days"></i> {evento.fechas}</p>
                      {evento.desc && <p className="ticket-location">{evento.desc}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* Sección alquileres */}
        {seccionActiva === 'alquiler' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Alquilar Espacios Disponibles</h2>
              <p>Busca por filtros, revisa la información reducida y selecciona un espacio para ver su detalle completo.</p>
            </header>

            <div className="filters-panel">
              <form className="filters-form" onSubmit={aplicarFiltros}>
                <div className="filter-item">
                  <label htmlFor="filtro-tipo">Tipo de espacio</label>
                  <input
                    id="filtro-tipo"
                    type="text"
                    placeholder="Ej: grande, mediano..."
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                  />
                </div>

                <div className="filter-item">
                  <label htmlFor="filtro-tamano">Tamaño</label>
                  <input
                    id="filtro-tamano"
                    type="text"
                    placeholder="Ej: 5x5"
                    value={tamanoFiltro}
                    onChange={(e) => setTamanoFiltro(e.target.value)}
                  />
                </div>

                <div className="filter-item">
                  <label htmlFor="filtro-ubicacion">Ubicación</label>
                  <input
                    id="filtro-ubicacion"
                    type="text"
                    placeholder="Zona o ciudad"
                    value={ubicacionFiltro}
                    onChange={(e) => setUbicacionFiltro(e.target.value)}
                  />
                </div>

                <div className="filter-item">
                  <label htmlFor="filtro-servicio">Servicio incluido</label>
                  <input
                    id="filtro-servicio"
                    type="text"
                    placeholder="Luz, agua, almacen..."
                    value={servicioFiltro}
                    onChange={(e) => setServicioFiltro(e.target.value)}
                  />
                </div>

                <div className="filter-item price-range-container">
                  <label>Precio (€)</label>
                  <div className="price-inputs">
                    <input
                      className="price-input"
                      type="number"
                      min="0"
                      placeholder="Mín"
                      value={precioMinFiltro}
                      onChange={(e) => setPrecioMinFiltro(e.target.value)}
                    />
                    <input
                      className="price-input"
                      type="number"
                      min="0"
                      placeholder="Máx"
                      value={precioMaxFiltro}
                      onChange={(e) => setPrecioMaxFiltro(e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-actions">
                  <button type="submit" className="btn-primary">Aplicar filtros</button>
                  <button type="button" className="btn-secondary" onClick={limpiarFiltros}>Limpiar</button>
                </div>
              </form>
            </div>

            <div className="espacios-layout">
              <div className="espacios-lista">
                {filteredEspacios.length > 0 ? (
                  filteredEspacios.map((espacio) => (
                    <article
                      className={`ticket-card espacio-resumen ${espacioSeleccionado?.id === espacio.id ? 'selected' : ''}`}
                      key={espacio.id}
                    >
                      <div className="ticket-info">
                        <span className="ticket-type" style={{ background: '#ff0055' }}>{espacio.tipo}</span>
                        <h3>{espacio.id_festival}</h3>
                        <p className="ticket-date"><i className="fa-solid fa-location-dot"></i> {espacio.ubicacion || 'Sin ubicación'}</p>
                      </div>
                      <div className="ticket-actions">
                        <button className="btn-secondary" onClick={() => seleccionarEspacio(espacio)}>
                          Ver detalle
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="no-results espacio-empty">
                    <i className="fa-solid fa-store-slash"></i>
                    <p>No hay espacios que coincidan con los filtros aplicados.</p>
                  </div>
                )}
              </div>

              <aside className="espacio-detalle-panel">
                {espacioSeleccionado ? (
                  <>
                    <span className="ticket-type" style={{ background: '#00a8ff', color: '#fff' }}>{espacioSeleccionado.tipo}</span>
                    <h3>Detalle del espacio</h3>
                    <p className="ticket-date"><i className="fa-solid fa-calendar-days"></i> Evento: {espacioSeleccionado.id_festival}</p>
                    <p className="ticket-location"><i className="fa-solid fa-location-dot"></i> Ubicación: {espacioSeleccionado.ubicacion || 'No especificada'}</p>
                    <p className="ticket-location"><i className="fa-solid fa-ruler-combined"></i> Tamaño: {espacioSeleccionado.tamaño || 'No especificado'}</p>
                    <p className="ticket-location"><i className="fa-solid fa-expand"></i> Dimensiones: {espacioSeleccionado.dimensiones || 'No especificadas'}</p>
                    <p className="ticket-location"><i className="fa-solid fa-list-check"></i> Servicios: {Array.isArray(espacioSeleccionado.servicios) && espacioSeleccionado.servicios.length > 0 ? espacioSeleccionado.servicios.join(', ') : 'No especificados'}</p>
                    <p className="ticket-location"><i className="fa-solid fa-note-sticky"></i> Descripción: {espacioSeleccionado.desc || 'Sin descripción'}</p>
                    <p className="ticket-price detalle-precio"><i className="fa-solid fa-euro-sign"></i> {espacioSeleccionado.precio} €</p>

                    <button className="btn-primary" onClick={() => solicitarAlquiler(espacioSeleccionado)}>
                      Solicitar alquiler
                    </button>
                  </>
                ) : (
                  <div className="detalle-vacio">
                    <i className="fa-solid fa-circle-info"></i>
                    <p>Selecciona un espacio de la lista para ver su detalle completo.</p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}