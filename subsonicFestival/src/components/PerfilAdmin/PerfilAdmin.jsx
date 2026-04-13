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

  const [nuevoEvento, setNuevoEvento] = useState({ 
    titulo: '', 
    pais: '',
    ubicacion: '', 
    fechas: '',
    desc: '',
    precioDia: '',
    precioFinde: '',
    servicios: '', 
    horarios: [] // Lista de escenarios: { stage: '', acts: [] }
  });

  // Variables temporales para los inputs de artistas
  const [tempStage, setTempStage] = useState('');
  const [tempArtista, setTempArtista] = useState('');
  const [tempHora, setTempHora] = useState('');

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

  const handleCrearEvento = async (e) => {
    e.preventDefault();

    // 1. Verificamos que haya escenarios añadidos
    if (nuevoEvento.horarios.length === 0) {
      alert("Error: Debes añadir al menos un escenario con el botón '+'");
      return;
    }

    // 2. Preparamos el objeto para tu backend de Python
    const festivalData = {
      id: `evento-${Date.now()}`, // ID temporal único
      titulo: nuevoEvento.titulo,
      pais: nuevoEvento.pais,
      ubicacion: nuevoEvento.ubicacion,
      fechas: nuevoEvento.fechas,
      desc: nuevoEvento.desc,
      img: nuevoEvento.titulo.toLowerCase().includes('brazil') ? '/subsonic_brasil.jpg' : 
           nuevoEvento.titulo.toLowerCase().includes('thailand') ? '/subsonic_tailandia.jpg' : 
                                                                  '/subsonic_belgica.jpg',
      tagsBusqueda: [nuevoEvento.pais.toLowerCase()],
      precios: { 
        day: Number(nuevoEvento.precioDia), 
        weekend: Number(nuevoEvento.precioFinde) 
      },
      servicios: nuevoEvento.servicios.split(',').map(s => s.trim()),
      horarios: nuevoEvento.horarios
    };

    try {
      // 3. ENVÍO REAL A LA BASE DE DATOS (Backend Python)
      const response = await fetch('http://127.0.0.1:8000/api/festivales/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(festivalData),
      });

      if (response.ok) {
        // 4. EL MENSAJE QUE TE FALTA
        alert("¡FESTIVAL PUBLICADO CON ÉXITO!");
        
        // Limpiamos el formulario
        setNuevoEvento({ 
          titulo: '', pais: '', ubicacion: '', fechas: '', desc: '', 
          precioDia: '', precioFinde: '', servicios: '', horarios: [] 
        });
      } else {
        alert("Error: El servidor recibió los datos pero no pudo guardarlos.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error: No se pudo conectar con el servidor de Python (FastAPI).");
    }
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
            <form className="evento-form" onSubmit={handleCrearEvento} style={{display: 'flex', flexDirection: 'column', gap: '15px', background: '#1a1a1a', padding: '25px', borderRadius: '12px', border: '1px solid #333', color: '#fff'}}>
              <h3 style={{color: '#ff0055', marginBottom: '10px', fontSize: '20px'}}>Datos del Festival</h3>
              
              {/* Campos básicos */}
              <input type="text" placeholder="Título (Ej: Subsonic Belgium)" value={nuevoEvento.titulo} onChange={e => setNuevoEvento({...nuevoEvento, titulo: e.target.value})} required style={{padding: '10px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444'}} />
              
              <div style={{display: 'flex', gap: '10px'}}>
                <input type="text" placeholder="País" value={nuevoEvento.pais} onChange={e => setNuevoEvento({...nuevoEvento, pais: e.target.value})} required style={{flex: 1, padding: '10px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444'}} />
                <input type="text" placeholder="Ubicación" value={nuevoEvento.ubicacion} onChange={e => setNuevoEvento({...nuevoEvento, ubicacion: e.target.value})} required style={{flex: 1, padding: '10px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444'}} />
              </div>

              <input type="text" placeholder="Fechas (Ej: 18 – 27 Julio 2026)" value={nuevoEvento.fechas} onChange={e => setNuevoEvento({...nuevoEvento, fechas: e.target.value})} required style={{padding: '10px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444'}} />
              
              <textarea placeholder="Descripción detallada..." value={nuevoEvento.desc} onChange={e => setNuevoEvento({...nuevoEvento, desc: e.target.value})} required style={{minHeight: '80px', padding: '10px', borderRadius: '8px', background: '#222', color: '#fff', border: '1px solid #444'}} />

              <div style={{display: 'flex', gap: '10px'}}>
                <input type="number" placeholder="Precio Día (€)" value={nuevoEvento.precioDia} onChange={e => setNuevoEvento({...nuevoEvento, precioDia: e.target.value})} required style={{flex: 1, padding: '10px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444'}} />
                <input type="number" placeholder="Precio Abono (€)" value={nuevoEvento.precioFinde} onChange={e => setNuevoEvento({...nuevoEvento, precioFinde: e.target.value})} required style={{flex: 1, padding: '10px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444'}} />
              </div>

              <input type="text" placeholder="Servicios (Separados por comas)" value={nuevoEvento.servicios} onChange={e => setNuevoEvento({...nuevoEvento, servicios: e.target.value})} style={{padding: '10px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444'}} />

              {/* LÓGICA DE ESCENARIOS Y HORARIOS */}
              <div style={{background: '#222', padding: '15px', borderRadius: '8px', border: '1px solid #ff0055'}}>
                <h4 style={{margin: '0 0 10px 0', color: '#ff0055'}}>Configurar Escenarios y Horarios</h4>
                
                <input type="text" placeholder="Nombre Escenario (ej: Main Stage)" value={tempStage} onChange={e => setTempStage(e.target.value)} style={{width: '100%', marginBottom: '10px', padding: '8px', borderRadius: '4px', background: '#333', color: '#fff', border: '1px solid #555'}} />
                
                <div style={{display: 'flex', gap: '5px'}}>
                  <input type="text" placeholder="Artista" value={tempArtista} onChange={e => setTempArtista(e.target.value)} style={{flex: 2, padding: '8px', borderRadius: '4px', background: '#333', color: '#fff', border: '1px solid #555'}} />
                  <input type="text" placeholder="Hora" value={tempHora} onChange={e => setTempHora(e.target.value)} style={{flex: 1, padding: '8px', borderRadius: '4px', background: '#333', color: '#fff', border: '1px solid #555'}} />
                  <button type="button" onClick={() => {
                      if (!tempStage || !tempArtista || !tempHora) return;
                      let nuevosHorarios = [...nuevoEvento.horarios];
                      let idx = nuevosHorarios.findIndex(h => h.stage === tempStage);
                      if (idx > -1) {
                        nuevosHorarios[idx].acts.push({ artist: tempArtista, time: tempHora });
                      } else {
                        nuevosHorarios.push({ stage: tempStage, acts: [{ artist: tempArtista, time: tempHora }] });
                      }
                      setNuevoEvento({...nuevoEvento, horarios: nuevosHorarios});
                      setTempArtista(''); setTempHora('');
                  }} style={{background: '#ff0055', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer'}}> + </button>
                </div>

                {/* Vista previa segura de los horarios añadidos */}
                <div style={{marginTop: '15px', maxHeight: '150px', overflowY: 'auto', fontSize: '13px'}}>
                  {nuevoEvento.horarios && nuevoEvento.horarios.map((h, i) => (
                    <div key={i} style={{marginBottom: '10px', borderLeft: '3px solid #ff0055', paddingLeft: '10px'}}>
                      <div style={{color: '#ff0055', fontWeight: 'bold'}}>{h.stage}</div>
                      {h.acts.map((a, j) => (
                        <div key={j} style={{display: 'flex', justifyContent: 'space-between'}}>
                          <span>{a.artist}</span><span style={{color: '#888'}}>{a.time}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-publicar">
                PUBLICAR FESTIVAL OFICIAL
              </button>
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