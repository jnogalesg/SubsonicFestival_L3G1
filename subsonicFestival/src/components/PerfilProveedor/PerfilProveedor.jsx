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
  const [espacios, setEspacios] = useState([]);
  const [misAlquileres, setMisAlquileres] = useState([]);
  const [historialEventos, setHistorialEventos] = useState([]);
  const [historialCargando, setHistorialCargando] = useState(false);
  const [historialError, setHistorialError] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [tamanoFiltro, setTamanoFiltro] = useState('');
  const [ubicacionFiltro, setUbicacionFiltro] = useState('');
  const [precioMinFiltro, setPrecioMinFiltro] = useState('');
  const [precioMaxFiltro, setPrecioMaxFiltro] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    tipo: '',
    tamano: '',
    ubicacion: '',
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


  useEffect(() => {
    const cargarDatosAlquiler = async () => {
      try {
        const [resEspacios, resAlquileres] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/espacios/'),
          fetch(`http://127.0.0.1:8000/api/espacios/mis-alquileres?proveedor_id=${encodeURIComponent(datos?.email || datosPersonales.email || '')}`),
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
        console.error("Error al cargar datos de alquiler:", err);
      }
    };

    if (seccionActiva === 'alquiler') {
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
    return espacios
      .filter((espacio) => espacio.disponibilidad)
      .filter((espacio) => {
        if (filtrosAplicados.tipo && espacio.type !== filtrosAplicados.tipo) return false;
        if (filtrosAplicados.tamano && espacio.size !== filtrosAplicados.tamano) return false;
        if (filtrosAplicados.ubicacion && espacio.location !== filtrosAplicados.ubicacion) return false;
        const min = Number(filtrosAplicados.minPrice);
        const max = Number(filtrosAplicados.maxPrice);
        if (filtrosAplicados.minPrice !== '' && !Number.isNaN(min) && espacio.price < min) return false;
        if (filtrosAplicados.maxPrice !== '' && !Number.isNaN(max) && espacio.price > max) return false;
        return true;
      });
  }, [espacios, filtrosAplicados]);

  const aplicarFiltros = (e) => {
    e.preventDefault();
    setFiltrosAplicados({
      tipo: tipoFiltro,
      tamano: tamanoFiltro,
      ubicacion: ubicacionFiltro,
      minPrice: precioMinFiltro,
      maxPrice: precioMaxFiltro,
    });
  };

  const limpiarFiltros = (e) => {
    e.preventDefault();
    setTipoFiltro('');
    setTamanoFiltro('');
    setUbicacionFiltro('');
    setPrecioMinFiltro('');
    setPrecioMaxFiltro('');
    setFiltrosAplicados({
      tipo: '',
      tamano: '',
      ubicacion: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  const seleccionarEspacio = (espacio) => {
    setEspacioSeleccionado(espacio);
    setAlquilerMensaje('');
    setAlquilerError('');
  };

  const handleReservar = async (espacioId) => {
    const idSeleccionado = espacioId || espacioSeleccionado?.id;
    setAlquilerMensaje('');
    setAlquilerError('');

    if (!idSeleccionado) {
      setAlquilerError('Selecciona primero un espacio para alquilar.');
      return;
    }

    if (!proveedorAlquiler || !negocioAlquiler || !contactoAlquiler || !fechaIniAlquiler || !fechaFinAlquiler) {
      setAlquilerError('Por favor completa todos los datos de la solicitud antes de alquilar.');
      return;
    }

    setAlquilerCargando(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/espacios/${encodeURIComponent(idSeleccionado)}/alquilar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proveedor: proveedorAlquiler,
          negocio: negocioAlquiler,
          contacto: contactoAlquiler,
          fecha_ini: fechaIniAlquiler,
          fecha_fin: fechaFinAlquiler,
          comentarios: comentariosAlquiler,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || errorData?.mensaje || 'No se pudo completar la solicitud.');
      }

      const data = await response.json();
      setAlquilerMensaje(data.mensaje || 'Reserva solicitada correctamente.');
      setEspacios((prev) => prev.map((espacio) => espacio.id === espacioId ? { ...espacio, disponibilidad: false } : espacio));
    } catch (error) {
      setAlquilerError(error.message || 'Error al solicitar el alquiler.');
    } finally {
      setAlquilerCargando(false);
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
        
        // Actualizamos la lista local
        setEspaciosLibres(prev => prev.filter(e => e.id !== idEspacio));
        setMisAlquileres(prev => [
          {
            id_alquiler: `tmp-${Date.now()}`,
            espacio_id: espacio.id,
            evento_id: espacio.id_festival,
            estado: 'pendiente',
            fecha_ini: solicitud.fecha_ini,
            fecha_fin: solicitud.fecha_fin,
            comentarios: solicitud.comentarios,
            tipo: espacio.tipo,
            ubicacion: espacio.ubicacion,
            tamaño: espacio.tamaño,
            precio: espacio.precio,
            desc: espacio.desc,
          },
          ...prev,
        ]);
      } else {
        const errorData = await respuesta.json();
        // Ahora el error se verá más claro si algo falla
        const mensajeError = typeof errorData.detail === 'object' 
          ? JSON.stringify(errorData.detail) 
          : errorData.detail;
          
        alert("Error del servidor: " + (mensajeError || "Datos inválidos"));
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
      const response = await fetch(`http://127.0.0.1:8000/api/espacios/alquileres/${encodeURIComponent(alquiler.id_alquiler)}/finalizar?proveedor_id=${encodeURIComponent(proveedorId)}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'No se pudo finalizar el alquiler.');
      }

      const data = await response.json();
      alert(data.mensaje || 'Alquiler finalizado correctamente.');

      setMisAlquileres((prev) => prev.filter((item) => item.id_alquiler !== alquiler.id_alquiler));
      if (alquiler?.espacio_id) {
        setEspaciosLibres((prev) => {
          const existe = prev.some((item) => item.id === alquiler.espacio_id);
          if (existe) {
            return prev;
          }

          return [
            {
              id: alquiler.espacio_id,
              tipo: alquiler.tipo,
              tamaño: alquiler.tamaño,
              ubicacion: alquiler.ubicacion,
              precio: alquiler.precio,
              id_festival: alquiler.evento_id,
              desc: alquiler.desc,
              disponibilidad: true,
            },
            ...prev,
          ];
        });
      }
    } catch (error) {
      alert(error.message || 'Error al finalizar el alquiler.');
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
              <p>Escoge una de las parcelas disponibles.</p>
            </header>
            {/* Espacios disponibles para alquilar */}
            <div className="tickets-grid">
              {espaciosLibres.length > 0 ? (
                espaciosLibres.map((espacio) => (
                  <div className="ticket-card" key={espacio.id} style={{ background: '#1a1a1a', border: '1px solid #333' }}>
                    <div className="ticket-info">
                      <span className="ticket-type" style={{ background: '#ff0055' }}>{espacio.tipo}</span>
                      <h3 style={{ marginTop: '10px' }}>{espacio.ubicacion}</h3>
                      <p className="ticket-date" style={{ color: '#bbb' }}>
                        <i className="fa-solid fa-ruler-combined"></i> Tamaño: {espacio.tamaño || 'No especificado'}
                      </p>
                      <p className="ticket-location" style={{ color: '#999' }}>
                        <i className="fa-solid fa-note-sticky"></i> {espacio.desc || 'Sin descripción'}
                      </p>
                      <p className="ticket-location" style={{ color: '#aaa' }}>
                        <i className="fa-solid fa-calendar-days"></i> Evento: {espacio.id_festival}
                      </p>
                      <p className="ticket-price" style={{ color: '#00ffcc', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {espacio.precio} €
                      </p>
                    </div>
                    <div className="ticket-actions">
                      <button
                        className="btn-primary"
                        onClick={() => solicitarAlquiler(espacio)}
                        style={{ width: '100%' }}
                      >
                        Solicitar Espacio
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results" style={{ gridColumn: '1 / -1', background: '#222', padding: '30px', textAlign: 'center', borderRadius: '10px' }}>
                  <i className="fa-solid fa-store-slash" style={{ fontSize: '3rem', color: '#555', marginBottom: '15px' }}></i>
                  <p>No hay parcelas libres en este momento. El administrador debe crear nuevos espacios.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </section>
    </main>
  );
}