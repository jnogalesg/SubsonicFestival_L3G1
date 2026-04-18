import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import './PerfilProveedor.css'; 
import { actualizarPerfilUsuario } from '../../firebase/userRoleService';

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

  const [datosPersonales, setDatosPersonales] = useState({  // Datos para mostrar en el formulario.
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    tipo_servicio: '',
    descripcion_servicio: ''
  });

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

            {/* Sección Datos de Empresa */}
            <header className="section-header section-header-empresa">
              <h3 className="section-title-empresa">Datos de la Empresa</h3>
            </header>

            <div className="tickets-grid">
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type">Empresa</span>
                  <h3>Datos de la empresa</h3>
                  <p className="ticket-date"><i className="fa-solid fa-id-card"></i> Información pendiente de carga</p>
                  <p className="ticket-location"><i className="fa-solid fa-map-marker-alt"></i> Dirección y contacto desde la base de datos</p>
                  <p className="ticket-location"><i className="fa-solid fa-briefcase"></i> Actividad y servicios cargados desde el backend</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Editar Información</button>
                </div>
              </div>
            </div>

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
                  <button className="btn-warning">Desactivar Cuenta</button>
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
                  <button className="btn-danger">Eliminar Cuenta</button>
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
                  <span className="ticket-type">Servicios</span>
                  <h3>No hay servicios cargados</h3>
                  <p className="ticket-date"><i className="fa-solid fa-info-circle"></i> Los datos de servicios deben obtenerse de la base de datos.</p>
                </div>
              </div>
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
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type finalizado">Historial</span>
                  <h3>No hay historial disponible</h3>
                  <p className="ticket-date"><i className="fa-solid fa-info-circle"></i> Los eventos se cargarán desde la base de datos.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Sección alquileres */}
        {seccionActiva === 'alquiler' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Alquilar Espacios Disponibles</h2>
              <p>Filtra por espacio, tamaño, ubicación y precio. </p>
            </header>

            <div className="filters-panel">
              <form onSubmit={aplicarFiltros} className="filters-form">
                <div className="filter-item">
                  <label>Tipo de espacio</label>
                  <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
                    <option value="">Cualquiera</option>
                    <option value="carpa">Carpa</option>
                    <option value="foodtruck">Food Truck</option>
                    <option value="stand">Stand</option>
                    <option value="escenario">Escenario</option>
                  </select>
                </div>

                <div className="filter-item">
                  <label>Tamaño</label>
                  <select value={tamanoFiltro} onChange={(e) => setTamanoFiltro(e.target.value)}>
                    <option value="">Cualquiera</option>
                    <option value="pequeno">Pequeño</option>
                    <option value="mediano">Mediano</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>

                <div className="filter-item">
                  <label>Ubicación</label>
                  <select value={ubicacionFiltro} onChange={(e) => setUbicacionFiltro(e.target.value)}>
                    <option value="">Cualquiera</option>
                    <option value="zona-a">Zona A</option>
                    <option value="zona-b">Zona B</option>
                    <option value="zona-c">Zona C</option>
                    <option value="zona-d">Zona D</option>
                  </select>
                </div>

                <div className="filter-item price-range-container">
                  <label>Precio (rango)</label>
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      className="price-input"
                      value={precioMinFiltro}
                      onChange={(e) => setPrecioMinFiltro(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="price-input"
                      value={precioMaxFiltro}
                      onChange={(e) => setPrecioMaxFiltro(e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-actions">
                  <button className="btn-primary" type="submit">Aplicar filtros</button>
                  <button className="btn-secondary" onClick={limpiarFiltros}>Limpiar</button>
                </div>
              </form>
            </div>

            <div className="alquiler-solicitud-panel">
              <h3>Solicitud de Alquiler</h3>
              {espacioSeleccionado ? (
                <>
                  <div className="selected-space-summary">
                    <p><strong>Espacio seleccionado:</strong> {espacioSeleccionado.title}</p>
                    <p><strong>Ubicación:</strong> {espacioSeleccionado.locationLabel}</p>
                    <p><strong>Precio:</strong> {espacioSeleccionado.priceLabel}</p>
                  </div>
                  <form className="filters-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="filter-item">
                      <label>Proveedor</label>
                      <input
                        type="text"
                        placeholder="Nombre del proveedor"
                        value={proveedorAlquiler}
                        onChange={(e) => setProveedorAlquiler(e.target.value)}
                      />
                    </div>
                    <div className="filter-item">
                      <label>Negocio</label>
                      <input
                        type="text"
                        placeholder="Nombre del negocio"
                        value={negocioAlquiler}
                        onChange={(e) => setNegocioAlquiler(e.target.value)}
                      />
                    </div>
                    <div className="filter-item">
                      <label>Contacto</label>
                      <input
                        type="text"
                        placeholder="Email o teléfono"
                        value={contactoAlquiler}
                        onChange={(e) => setContactoAlquiler(e.target.value)}
                      />
                    </div>
                    <div className="filter-item">
                      <label>Fecha inicio</label>
                      <input
                        type="date"
                        value={fechaIniAlquiler}
                        onChange={(e) => setFechaIniAlquiler(e.target.value)}
                      />
                    </div>
                    <div className="filter-item">
                      <label>Fecha fin</label>
                      <input
                        type="date"
                        value={fechaFinAlquiler}
                        onChange={(e) => setFechaFinAlquiler(e.target.value)}
                      />
                    </div>
                    <div className="filter-item filter-item-full">
                      <label>Comentarios</label>
                      <input
                        type="text"
                        placeholder="Comentarios adicionales"
                        value={comentariosAlquiler}
                        onChange={(e) => setComentariosAlquiler(e.target.value)}
                      />
                    </div>
                    <div className="filter-actions">
                      <button
                        className="btn-primary"
                        onClick={() => handleReservar()}
                        disabled={alquilerCargando}
                      >
                        {alquilerCargando ? 'Enviando...' : 'Enviar solicitud'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <p className="no-selection-message">Selecciona un espacio disponible para iniciar la solicitud de alquiler.</p>
              )}
              {alquilerMensaje && <div className="success-message">{alquilerMensaje}</div>}
              {alquilerError && <div className="error-message">{alquilerError}</div>}
            </div>

            <div className="tickets-grid">
              {filteredEspacios.length > 0 ? (
                filteredEspacios.map((espacio) => (
                  <div className="ticket-card" key={espacio.id}>
                    <div className="ticket-info">
                      <span className={`ticket-type ${espacio.type === 'carpa' ? 'vip' : ''}`}>{espacio.label}</span>
                      <h3>{espacio.title}</h3>
                      <p className="ticket-date"><i className="fa-solid fa-ruler-combined"></i> {espacio.dimensions}</p>
                      <p className="ticket-location"><i className="fa-solid fa-location-dot"></i> {espacio.locationLabel}</p>
                      <p className="ticket-price"><i className="fa-solid fa-euro-sign"></i> {espacio.priceLabel}</p>
                    </div>
                    <div className="ticket-actions">
                      <button className="btn-secondary" onClick={(e) => e.preventDefault()}>Ver Detalles</button>
                      <button
                        className={`btn-primary ${espacioSeleccionado?.id === espacio.id ? 'selected' : ''}`}
                        onClick={() => seleccionarEspacio(espacio)}
                        disabled={alquilerCargando}
                      >
                        {espacioSeleccionado?.id === espacio.id ? 'Espacio seleccionado' : 'Alquilar'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>No se encontraron espacios con esos filtros.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </section>
    </main>
  );
}