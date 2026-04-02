import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';

import './PerfilAdmin.css';

export default function PerfilAdmin() {
  // Estado para controlar qué sección del menú está activa
  const [seccionActiva, setSeccionActiva] = useState('overview');
  const [eventos, setEventos] = useState([
    {
      nombre: 'Subsonic Belgium',
      escenario: 'Main',
      artistas: ['DJ Sonic'],
      entradasVendidas: 118500,
      facturacion: 950000
    },
    {
      nombre: 'Subsonic Spain',
      escenario: 'Beach',
      artistas: ['DJ Luna'],
      entradasVendidas: 85000,
      facturacion: 670000
    }
  ]);
  const [artistas, setArtistas] = useState([]);
  const [nuevoEvento, setNuevoEvento] = useState({ nombre: '', escenario: '', artistas: [] });
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: 'Pedro', rol: 'Administrador', permisos: ['Crear', 'Editar', 'Eliminar'] },
    { id: 2, nombre: 'Ana', rol: 'Usuario', permisos: ['Ver'] },
    { id: 3, nombre: 'Luis', rol: 'Proveedor', permisos: ['Ver', 'Crear'] }
  ]);
  const [proveedores, setProveedores] = useState([
    { id: 1, nombre: 'FoodTruck "Burger Beat"', espacio: 'Zona Norte', merchandising: 120 },
    { id: 2, nombre: 'Stand "Vinyl Vibes"', espacio: 'Zona Sur', merchandising: 45 }
  ]);
  const [nuevoProveedor, setNuevoProveedor] = useState({ nombre: '', espacio: '', merchandising: 0 });
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleCrearEvento = (e) => {
    e.preventDefault();
    setEventos([...eventos, nuevoEvento]);
    setNuevoEvento({ nombre: '', escenario: '', artistas: [] });
  };

  const handleRolChange = (id, nuevoRol) => {
    setUsuarios(usuarios.map(u => u.id === id ? { ...u, rol: nuevoRol } : u));
  };

  const handlePermisoToggle = (id, permiso) => {
    setUsuarios(usuarios.map(u => {
      if (u.id === id) {
        const tienePermiso = u.permisos.includes(permiso);
        return {
          ...u,
          permisos: tienePermiso
            ? u.permisos.filter(p => p !== permiso)
            : [...u.permisos, permiso]
        };
      }
      return u;
    }));
  };

  const handleAgregarProveedor = (e) => {
    e.preventDefault();
    setProveedores([
      ...proveedores,
      { ...nuevoProveedor, id: Date.now() }
    ]);
    setNuevoProveedor({ nombre: '', espacio: '', merchandising: 0 });
  };

  const handleMerchandisingChange = (id, valor) => {
    setProveedores(proveedores.map(p =>
      p.id === id ? { ...p, merchandising: valor } : p
    ));
  };

  return (
    <main className="dashboard-container perfil-admin">
        
      {/* --- BARRA LATERAL (SIDEBAR) --- */}
      <aside className="dashboard-sidebar">
        <div className="user-profile-summary">
          <div className="user-avatar">
            <i className="fa-solid fa-crown"></i>
          </div>
          <h3>Usuario Administrador</h3>
          <p className="user-role">Administrador de la página</p>
        </div>
        
        <div className="sidebar-nav">
          <ul>
            <li>
              <a href="#overview" className={seccionActiva === 'overview' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('overview'); }}>
                <i className="fa-solid fa-chart-line"></i> Visión General
              </a>
            </li>
            <li>
              <a href="#eventos" className={seccionActiva === 'eventos' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('eventos'); }}>
                <i className="fa-solid fa-calendar-days"></i> Gestión de Eventos
              </a>
            </li>
            <li>
              <a href="#usuarios" className={seccionActiva === 'usuarios' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('usuarios'); }}>
                <i className="fa-solid fa-users"></i> Usuarios y Accesos
              </a>
            </li>
            <li>
              <a href="#proveedores" className={seccionActiva === 'proveedores' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('proveedores'); }}>
                <i className="fa-solid fa-store"></i> Control Proveedores
              </a>
            </li>
            <li>
              <a href="#finanzas" className={seccionActiva === 'finanzas' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('finanzas'); }}>
                <i className="fa-solid fa-vault"></i> Finanzas y Ventas
              </a>
            </li>
          </ul>
        </div>

        {/* Botón de cerrar sesión anclado al final */}
        <button className="btn-secondary" style={{ marginTop: 'auto', width: '100%' }} onClick={cerrarSesion}>
          Cerrar Sesión
        </button>
      </aside>

      {/* --- ÁREA DE CONTENIDO --- */}
      <section className="dashboard-content">
          
        {/* VISIÓN GENERAL */}
        {seccionActiva === 'overview' && (
          <div className="dashboard-section active">
            <header className="section-header">
              <h2>Panel de Control Maestro</h2>
              <p>Métricas en tiempo real y gestión global del Subsonic Festival.</p>
            </header>

            <div className="resumen-grid">
              <div className="resumen-card">
                <div className="resumen-titulo">Entradas Vendidas</div>
                <div className="resumen-numero">142.5K</div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Ingresos Totales</div>
                <div className="resumen-numero">8.4M <span style={{fontSize: '20px'}}>€</span></div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Proveedores Activos</div>
                <div className="resumen-numero">34</div>
              </div>
            </div>

            <div className="tickets-grid">
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type admin-badge">Aforo Máximo</span>
                  <h3>Subsonic Belgium</h3>
                  <p className="ticket-date"><i className="fa-solid fa-circle-exclamation"></i> Alerta de seguridad</p>
                  <p className="ticket-location"><i className="fa-solid fa-users"></i> 118,500 / 120,000 asistentes</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Gestionar Aforo</button>
                  <button className="btn-secondary">Ver Cámaras</button>
                </div>
              </div>

              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type admin-badge">Nueva Solicitud</span>
                  <h3>FoodTruck "Burger Beat"</h3>
                  <p className="ticket-date"><i className="fa-solid fa-store"></i> Zona Norte, Escenario 2</p>
                  <p className="ticket-location"><i className="fa-solid fa-file-invoice"></i> Pendiente de aprobación</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Aprobar Permiso</button>
                  <button className="btn-secondary">Revisar Documentación</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secciones vacías preparadas para el resto de pestañas */}
        {seccionActiva === 'eventos' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Gestión de Eventos</h2>
              <p>Crea nuevos festivales y asigna artistas a los escenarios.</p>
            </header>
            {/* Tarjetas resumen */}
            <div className="resumen-grid">
              <div className="resumen-card">
                <div className="resumen-titulo">Eventos Registrados</div>
                <div className="resumen-numero">{eventos.length}</div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Artistas Disponibles</div>
                <div className="resumen-numero">{artistas.length}</div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Escenarios</div>
                <div className="resumen-numero">
                  {[...new Set(eventos.map(ev => ev.escenario))].length}
                </div>
              </div>
            </div>
            {/* Formulario y lista de eventos */}
            <form className="evento-form" onSubmit={handleCrearEvento}>
              <input
                type="text"
                placeholder="Nombre del evento"
                value={nuevoEvento.nombre}
                onChange={e => setNuevoEvento({ ...nuevoEvento, nombre: e.target.value })}
              />
              <input
                type="text"
                placeholder="Escenario"
                value={nuevoEvento.escenario}
                onChange={e => setNuevoEvento({ ...nuevoEvento, escenario: e.target.value })}
              />
              <select
                multiple
                value={nuevoEvento.artistas}
                onChange={e =>
                  setNuevoEvento({
                    ...nuevoEvento,
                    artistas: Array.from(e.target.selectedOptions, option => option.value)
                  })
                }
              >
                {artistas.map(artista => (
                  <option key={artista.id} value={artista.nombre}>{artista.nombre}</option>
                ))}
              </select>
              <button type="submit">Crear Evento</button>
            </form>
            <ul>
              {eventos.map(evento => (
                <li key={evento.nombre}>
                  {evento.nombre} - {evento.escenario} | Artistas: {evento.artistas.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {seccionActiva === 'usuarios' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Usuarios y Accesos</h2>
              <p>Administra los roles y permisos de las cuentas registradas.</p>
            </header>
            {/* Tarjetas resumen */}
            <div className="resumen-grid">
              <div className="resumen-card">
                <div className="resumen-titulo">Usuarios Totales</div>
                <div className="resumen-numero">{usuarios.length}</div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Administradores</div>
                <div className="resumen-numero">{usuarios.filter(u => u.rol === 'Administrador').length}</div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Proveedores</div>
                <div className="resumen-numero">{usuarios.filter(u => u.rol === 'Proveedor').length}</div>
              </div>
            </div>
            {/* Tabla de usuarios */}
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th>Permisos</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}</td>
                    <td>
                      <select
                        value={usuario.rol}
                        onChange={e => handleRolChange(usuario.id, e.target.value)}
                      >
                        <option>Administrador</option>
                        <option>Usuario</option>
                        <option>Proveedor</option>
                      </select>
                    </td>
                    <td>
                      {['Ver', 'Crear', 'Editar', 'Eliminar'].map(permiso => (
                        <label key={permiso} style={{ marginRight: 8 }}>
                          <input
                            type="checkbox"
                            checked={usuario.permisos.includes(permiso)}
                            onChange={() => handlePermisoToggle(usuario.id, permiso)}
                          />
                          {permiso}
                        </label>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {seccionActiva === 'proveedores' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Control de Proveedores</h2>
              <p>Gestiona los espacios alquilados y el merchandising vendido.</p>
            </header>
            {/* Tarjetas resumen */}
            <div className="resumen-grid">
              <div className="resumen-card">
                <div className="resumen-titulo">Proveedores Activos</div>
                <div className="resumen-numero">{proveedores.length}</div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Espacios Alquilados</div>
                <div className="resumen-numero">
                  {[...new Set(proveedores.map(p => p.espacio))].length}
                </div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Merchandising Total</div>
                <div className="resumen-numero">
                  {proveedores.reduce((acc, p) => acc + (p.merchandising || 0), 0)}
                </div>
              </div>
            </div>
            {/* Formulario y tabla de proveedores */}
            <form className="evento-form" onSubmit={handleAgregarProveedor}>
              <input
                type="text"
                placeholder="Nombre del proveedor"
                value={nuevoProveedor.nombre}
                onChange={e => setNuevoProveedor({ ...nuevoProveedor, nombre: e.target.value })}
              />
              <input
                type="text"
                placeholder="Espacio alquilado"
                value={nuevoProveedor.espacio}
                onChange={e => setNuevoProveedor({ ...nuevoProveedor, espacio: e.target.value })}
              />
              <input
                type="number"
                placeholder="Merchandising vendido"
                value={nuevoProveedor.merchandising}
                min={0}
                onChange={e => setNuevoProveedor({ ...nuevoProveedor, merchandising: Number(e.target.value) })}
              />
              <button type="submit">Agregar Proveedor</button>
            </form>
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Espacio</th>
                  <th>Merchandising Vendido</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map(p => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.espacio}</td>
                    <td>
                      <input
                        type="number"
                        value={p.merchandising}
                        min={0}
                        style={{ width: '80px', background: '#222', color: '#fff', borderRadius: '6px', border: '1px solid #e0e0e0', padding: '6px 10px' }}
                        onChange={e => handleMerchandisingChange(p.id, Number(e.target.value))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {seccionActiva === 'finanzas' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Finanzas y Ventas</h2>
              <p>Reportes de facturación y analíticas de venta de entradas.</p>
            </header>
            {/* Tarjetas resumen como en Visión General */}
            <div className="resumen-grid">
              <div className="resumen-card">
                <div className="resumen-titulo">Entradas Vendidas</div>
                <div className="resumen-numero">
                  {eventos.reduce((acc, ev) => acc + (ev.entradasVendidas || 0), 0).toLocaleString()}
                </div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Facturación Total</div>
                <div className="resumen-numero">
                  {eventos.reduce((acc, ev) => acc + (ev.facturacion || 0), 0).toLocaleString()} <span style={{fontSize: '20px'}}>€</span>
                </div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Eventos Registrados</div>
                <div className="resumen-numero">{eventos.length}</div>
              </div>
            </div>
            {/* Tabla de detalle */}
            <table className="usuarios-table" style={{marginTop: '32px'}}>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Entradas Vendidas</th>
                  <th>Facturación (€)</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map(evento => (
                  <tr key={evento.nombre}>
                    <td>{evento.nombre}</td>
                    <td>{evento.entradasVendidas}</td>
                    <td>{evento.facturacion.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </section>
    </main>
  );
}