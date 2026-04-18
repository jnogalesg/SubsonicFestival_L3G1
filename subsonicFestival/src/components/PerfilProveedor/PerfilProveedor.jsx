import { useState, useEffect } from 'react';
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
  const navigate = useNavigate();

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
              {/* Información Básica Empresa */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type">Información Básica</span>
                  <h3>SubSonic Catering S.L.</h3>
                  <p className="ticket-date"><i className="fa-solid fa-id-card"></i> CIF: B-06789456</p>
                  <p className="ticket-location"><i className="fa-solid fa-calendar-check"></i> Fundada: Enero 2020</p>
                  <p className="ticket-location"><i className="fa-solid fa-users"></i> Empleados: 15-25</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Editar Información</button>
                  <button className="btn-secondary">Ver Certificados</button>
                </div>
              </div>

              {/* Contacto Empresarial */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type vip">Contacto Empresarial</span>
                  <h3>Datos de Contacto</h3>
                  <p className="ticket-date"><i className="fa-solid fa-envelope"></i> info@subsonicatering.com</p>
                  <p className="ticket-location"><i className="fa-solid fa-phone"></i> +34 927 123 456</p>
                  <p className="ticket-location"><i className="fa-solid fa-map-marker-alt"></i> Polígono Industrial - Cáceres</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Actualizar Contacto</button>
                  <button className="btn-secondary">Verificar Datos</button>
                </div>
              </div>

              {/* Especialización */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type">Especialización</span>
                  <h3>Servicios Principales</h3>
                  <p className="ticket-date"><i className="fa-solid fa-utensils"></i> Gastronomía Gourmet</p>
                  <p className="ticket-location"><i className="fa-solid fa-cocktail"></i> Coctelería Premium</p>
                  <p className="ticket-location"><i className="fa-solid fa-truck"></i> Food Truck Móvil</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Gestionar Servicios</button>
                  <button className="btn-secondary">Ver Catálogo</button>
                </div>
              </div>

              {/* Datos Financieros */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type">Financiero</span>
                  <h3>Información Bancaria</h3>
                  <p className="ticket-date"><i className="fa-solid fa-university"></i> Banco Santander</p>
                  <p className="ticket-location"><i className="fa-solid fa-credit-card"></i> ES76 **** **** **** 5678</p>
                  <p className="ticket-location"><i className="fa-solid fa-percentage"></i> Comisión plataforma: 3.5%</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Cambiar Cuenta</button>
                  <button className="btn-secondary">Historial Pagos</button>
                </div>
              </div>

              {/* Certificaciones */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type vip">Certificaciones</span>
                  <h3>Licencias y Permisos</h3>
                  <p className="ticket-date"><i className="fa-solid fa-certificate"></i> Manipulador Alimentos</p>
                  <p className="ticket-location"><i className="fa-solid fa-award"></i> ISO 9001:2015</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Renovar Licencias</button>
                  <button className="btn-secondary">Descargar Docs</button>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type">Estadísticas</span>
                  <h3>Rendimiento Global</h3>
                  <p className="ticket-date"><i className="fa-solid fa-star"></i> Valoración: 4.8/5</p>
                  <p className="ticket-location"><i className="fa-solid fa-calendar"></i> Eventos completados: 47</p>
                  <p className="ticket-location"><i className="fa-solid fa-chart-line"></i> Ingresos 2025: 85.670,00 €</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Ver Analytics</button>
                  <button className="btn-secondary">Exportar Datos</button>
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
              {/* Card de Servicio 1 */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type">Gastronomía</span>
                  <h3>Burger Station VIP</h3>
                  <p className="ticket-date"><i className="fa-solid fa-location-dot"></i> Zona A - Escenario Principal</p>
                  <p className="ticket-location"><i className="fa-solid fa-circle-check"></i> Estado: Activo</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Editar Menú</button>
                  <button className="btn-secondary">Ver Inventario</button>
                </div>
              </div>

              {/* Card de Servicio 2 */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type vip">Premium</span>
                  <h3>Coctelería Subsonic</h3>
                  <p className="ticket-date"><i className="fa-solid fa-location-dot"></i> Zona C - Chill Out</p>
                  <p className="ticket-location"><i className="fa-solid fa-clock"></i> Pendiente de Aprobación</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Modificar Datos</button>
                  <button className="btn-secondary">Retirar Propuesta</button>
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
              {/* Evento Pasado 1 */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type finalizado">Finalizado</span>
                  <h3>Subsonic Festival 2025</h3>
                  <p className="ticket-date"><i className="fa-solid fa-calendar"></i> 15-17 Agosto 2025</p>
                  <p className="ticket-location"><i className="fa-solid fa-location-dot"></i> Cáceres, España</p>
                  <p className="ticket-location"><i className="fa-solid fa-euro-sign"></i> Ingresos: 8.450,00 €</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-secondary">Ver Detalles</button>
                  <button className="btn-secondary">Descargar Reporte</button>
                </div>
              </div>

              {/* Evento Pasado 2 */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type finalizado">Finalizado</span>
                  <h3>Summer Beats 2025</h3>
                  <p className="ticket-date"><i className="fa-solid fa-calendar"></i> 20-22 Julio 2025</p>
                  <p className="ticket-location"><i className="fa-solid fa-location-dot"></i> Badajoz, España</p>
                  <p className="ticket-location"><i className="fa-solid fa-euro-sign"></i> Ingresos: 5.280,00 €</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-secondary">Ver Detalles</button>
                  <button className="btn-secondary">Descargar Reporte</button>
                </div>
              </div>

              {/* Evento Pasado 3 */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type finalizado">Finalizado</span>
                  <h3>Rock en el Campo 2024</h3>
                  <p className="ticket-date"><i className="fa-solid fa-calendar"></i> 10-12 Septiembre 2024</p>
                  <p className="ticket-location"><i className="fa-solid fa-location-dot"></i> Mérida, España</p>
                  <p className="ticket-location"><i className="fa-solid fa-euro-sign"></i> Ingresos: 6.790,00 €</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-secondary">Ver Detalles</button>
                  <button className="btn-secondary">Descargar Reporte</button>
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
              <form onSubmit={(e) => e.preventDefault()} className="filters-form">
                <div className="filter-item">
                  <label>Tipo de espacio</label>
                  <select defaultValue="">
                    <option value="">Cualquiera</option>
                    <option value="carpa">Carpa</option>
                    <option value="foodtruck">Food Truck</option>
                    <option value="stand">Stand</option>
                    <option value="escenario">Escenario</option>
                  </select>
                </div>

                <div className="filter-item">
                  <label>Tamaño</label>
                  <select defaultValue="">
                    <option value="">Cualquiera</option>
                    <option value="pequeno">Pequeño</option>
                    <option value="mediano">Mediano</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>

                <div className="filter-item">
                  <label>Ubicación</label>
                  <select defaultValue="">
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
                    <input type="number" placeholder="Min" className="price-input" />
                    <input type="number" placeholder="Max" className="price-input" />
                  </div>
                </div>

                <div className="filter-actions">
                  <button className="btn-primary" onClick={(e) => e.preventDefault()}>Aplicar filtros</button>
                  <button className="btn-secondary" onClick={(e) => e.preventDefault()}>Limpiar</button>
                </div>
              </form>
            </div>

            <div className="tickets-grid">
              {/* Espacio 1 */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type">Stand</span>
                  <h3>Stand Exterior - Zona A</h3>
                  <p className="ticket-date"><i className="fa-solid fa-ruler-combined"></i> 3x3 m</p>
                  <p className="ticket-location"><i className="fa-solid fa-location-dot"></i> Zona A - Entrada</p>
                  <p className="ticket-price"><i className="fa-solid fa-euro-sign"></i> 250,00 €/día</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-secondary" onClick={(e) => e.preventDefault()}>Ver Detalles</button>
                  <button className="btn-primary" onClick={(e) => e.preventDefault()}>Reservar</button>
                </div>
              </div>

              {/* Espacio 2 */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type vip">Carpa</span>
                  <h3>Carpa 6x6 - Zona B</h3>
                  <p className="ticket-date"><i className="fa-solid fa-ruler-combined"></i> 6x6 m</p>
                  <p className="ticket-location"><i className="fa-solid fa-location-dot"></i> Zona B - Food Area</p>
                  <p className="ticket-price"><i className="fa-solid fa-euro-sign"></i> 550,00 €/día</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-secondary" onClick={(e) => e.preventDefault()}>Ver Detalles</button>
                  <button className="btn-primary" onClick={(e) => e.preventDefault()}>Reservar</button>
                </div>
              </div>

              {/* Espacio 3 */}
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type">Food Truck</span>
                  <h3>Plaza Food Truck - Zona C</h3>
                  <p className="ticket-date"><i className="fa-solid fa-ruler-combined"></i> Espacio para 1 vehículo</p>
                  <p className="ticket-location"><i className="fa-solid fa-location-dot"></i> Zona C - Paseo</p>
                  <p className="ticket-price"><i className="fa-solid fa-euro-sign"></i> 180,00 €/día</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-secondary" onClick={(e) => e.preventDefault()}>Ver Detalles</button>
                  <button className="btn-primary" onClick={(e) => e.preventDefault()}>Reservar</button>
                </div>
              </div>
            </div>

          </div>
        )}

      </section>
    </main>
  );
}