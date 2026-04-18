import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { obtenerTodosUsuarios, obtenerEstadisticasAdmin, obtenerControlProveedoresAdmin, actualizarRolUsuario, obtenerVentasPorEventoAdmin } from '../../firebase/userRoleService';

import './PerfilAdmin.css';

export default function PerfilAdmin({ datos }) {
  // Estado para controlar qué sección del menú está activa
  const [seccionActiva, setSeccionActiva] = useState('overview');
  
  const [eventos, setEventos] = useState([]);
  const [espacios, setEspacios] = useState([]); 
  const [estadisticas, setEstadisticas] = useState({
    entradas_vendidas: 0,
    ingresos_totales: 0,
    proveedores_activos: 0,
  });

    const [ventasPorEvento, setVentasPorEvento] = useState([]);


  const [nuevoEspacioData, setNuevoEspacioData] = useState({
    id_festival: '',
    tipo: 'catering',
    tamaño: 'mediano',
    precio: 0,
    ubicacion: '',
    desc: ''
  });
  const [espacioEnEdicion, setEspacioEnEdicion] = useState(null);

  const [proveedores, setProveedores] = useState([]);

  const [cargando, setCargando] = useState(true);

    useEffect(() => {
      const cargarDatos = async () => {
        try {
          // Cargar Eventos
          const resEventos = await fetch('http://localhost:8000/api/festivales/');
          if (resEventos.ok) setEventos(await resEventos.json());

          // --- AÑADE ESTO AQUÍ ---
          const resEspacios = await fetch('http://localhost:8000/api/espacios/');
          if (resEspacios.ok) setEspacios(await resEspacios.json());
          // -----------------------

        } catch (error) {
          console.error("Error cargando datos:", error);
        } finally {
          setCargando(false);
        }
      };
      cargarDatos();
    }, [seccionActiva]); // Importante que dependa de seccionActiva para refrescar

    // Función para obtener cuántas parcelas tiene un festival específico
    const obtenerConteoEspacios = (festivalId) => {
      // Filtramos la lista de espacios que ya tenemos en el estado por el ID del festival
      // Nota: Asegúrate de tener un estado global de 'espacios' o cárgalos aquí
      return espacios.filter(esp => esp.id_festival === festivalId).length;
    };

    useEffect(() => {
      const cargarEstadisticas = async () => {
        try {
          const datos = await obtenerEstadisticasAdmin();
          setEstadisticas(datos);
        } catch (error) {
          console.error('Error al cargar estadisticas admin:', error);
        }
      };

      if (seccionActiva === 'overview' || seccionActiva === 'finanzas') {
        cargarEstadisticas();
      }
    }, [seccionActiva]);

    useEffect(() => {
      const cargarVentasPorEvento = async () => {
        try {
          const datos = await obtenerVentasPorEventoAdmin();
          setVentasPorEvento(Array.isArray(datos) ? datos : []);
        } catch (error) {
          console.error('Error al cargar ventas por evento:', error);
          setVentasPorEvento([]);
        }
      };

      if (seccionActiva === 'finanzas') {
        cargarVentasPorEvento();
      }
    }, [seccionActiva]);

    useEffect(() => {
      const cargarProveedores = async () => {
        try {
          const datos = await obtenerControlProveedoresAdmin();
          setProveedores(Array.isArray(datos) ? datos : []);
        } catch (error) {
          console.error('Error al cargar control de proveedores:', error);
          setProveedores([]);
        }
      };

      if (seccionActiva === 'proveedores') {
        cargarProveedores();
      }
    }, [seccionActiva]);

  const [artistas, setArtistas] = useState([]);

  const [nuevoEvento, setNuevoEvento] = useState({ 
    titulo: '',
    img: '',
    pais: '',
    ubicacion: '', 
    fechas: '',
    desc: '',
    precioDia: '',
    precioFinde: '',
    servicios: '', 
    horarios: [] // Lista de escenarios: { stage: '', acts: [] }
  });

  // Controla si estamos creando (null) o editando un ID específico
  const [eventoEnEdicion, setEventoEnEdicion] = useState(null);

  // Variables temporales para los inputs de artistas
  const [tempStage, setTempStage] = useState('');
  const [tempArtista, setTempArtista] = useState('');
  const [tempHora, setTempHora] = useState('');

  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  const totalAdministradores = usuarios.filter((u) => (u.rol || '').toLowerCase() === 'admin').length;
  const totalProveedores = usuarios.filter((u) => (u.rol || '').toLowerCase() === 'proveedor').length;

  const cerrarSesion = async () => {
    await signOut(auth);
    navigate('/');
  };

  // 1. Función para cargar los datos en el formulario al pulsar "Editar"
  const handleEditarClic = (evento) => {
    setNuevoEvento({
      titulo: evento.titulo || '',
      img: evento.img || '',
      pais: evento.pais || '',
      ubicacion: evento.ubicacion || '',
      fechas: evento.fechas || '',
      desc: evento.desc || '',
      precioDia: evento.precios?.day || '',
      precioFinde: evento.precios?.weekend || '',
      servicios: Array.isArray(evento.servicios) ? evento.servicios.join(', ') : (evento.servicios || ''),
      horarios: evento.horarios || []
    });
    setEventoEnEdicion(evento.id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube al formulario
  };

  // 2. Función para limpiar el formulario y cancelar edición
  const handleCancelarEdicion = () => {
    setNuevoEvento({ 
      titulo: '', img: '', pais: '', ubicacion: '', fechas: '', desc: '', 
      precioDia: '', precioFinde: '', servicios: '', horarios: [] 
    });
    setEventoEnEdicion(null);
  };

  // 3. Función para eliminar un artista de un escenario
  const handleEliminarActo = (stageIndex, actIndex) => {
    // Hacemos una copia profunda de los horarios actuales
    const nuevosHorarios = [...nuevoEvento.horarios];
    
    // Eliminamos el artista específico usando su índice
    nuevosHorarios[stageIndex].acts.splice(actIndex, 1);
    
    // Si el escenario se ha quedado vacío (sin artistas), lo borramos entero también
    if (nuevosHorarios[stageIndex].acts.length === 0) {
      nuevosHorarios.splice(stageIndex, 1);
    }
    
    // Actualizamos el estado
    setNuevoEvento({...nuevoEvento, horarios: nuevosHorarios});
  };

  // Función para poder modificar los artistas de un evento que se quiera editar
  const handleCargarActoParaEditar = (stageIndex, actIndex) => {
    const acto = nuevoEvento.horarios[stageIndex].acts[actIndex];
    const escenario = nuevoEvento.horarios[stageIndex].stage;

    // Subimos los datos a los campitos temporales
    setTempStage(escenario);
    setTempArtista(acto.artist);
    setTempHora(acto.time);

    // Lo quitamos de la lista para que al darle al "+" se actualice
    handleEliminarActo(stageIndex, actIndex);
  };

  // 4. Función handleCrearEvento (Crear y Actualizar la info de los eventos)
  const handleCrearEvento = async (e) => {
    e.preventDefault();

    if (nuevoEvento.horarios.length === 0) {
      alert("Error: Debes añadir al menos un escenario con el botón '+'");
      return;
    }

    // Si editamos, usamos su ID real. Si es nuevo, generamos uno.
    const festivalId = eventoEnEdicion || `evento-${Date.now()}`;

    const festivalData = {
      id: festivalId,
      titulo: nuevoEvento.titulo,
      pais: nuevoEvento.pais,
      ubicacion: nuevoEvento.ubicacion,
      fechas: nuevoEvento.fechas,
      desc: nuevoEvento.desc,
      img: nuevoEvento.img || '/subsonic_belgica.jpg',
      tagsBusqueda: [nuevoEvento.pais.toLowerCase()],
      precios: { 
        day: Number(nuevoEvento.precioDia), 
        weekend: Number(nuevoEvento.precioFinde) 
      },
      // Limpieza de servicios para enviarlos siempre como Array
      servicios: typeof nuevoEvento.servicios === 'string' 
        ? nuevoEvento.servicios.split(',').map(s => s.trim()).filter(s => s !== "")
        : nuevoEvento.servicios,
      horarios: nuevoEvento.horarios
    };

    try {
      // Si hay un ID en edición usamos PUT, si no POST
      const url = eventoEnEdicion 
        ? `http://127.0.0.1:8000/api/festivales/${eventoEnEdicion}` 
        : 'http://127.0.0.1:8000/api/festivales/';
      
      const method = eventoEnEdicion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(festivalData),
      });

      if (response.ok) {
        alert(eventoEnEdicion ? "¡FESTIVAL ACTUALIZADO CON ÉXITO!" : "¡FESTIVAL PUBLICADO CON ÉXITO!");
        
        // Actualizamos la lista local para no tener que recargar la página
        if (eventoEnEdicion) {
          setEventos(eventos.map(ev => ev.id === eventoEnEdicion ? festivalData : ev));
        } else {
          setEventos([...eventos, festivalData]);
        }
        
        handleCancelarEdicion(); // Limpia el formulario y resetea estados
      } else {
        alert("Error: El servidor no pudo procesar los datos.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error: No se pudo conectar con el servidor de Python.");
    }
  };

  // Función para ELIMINAR un festival
  const handleEliminarFestival = async (id, titulo) => {
    // 1. Pedimos confirmación para no borrar por accidente
    if (window.confirm(`¿Estás seguro de que quieres eliminar permanentemente el festival "${titulo}"?`)) {
      try {
        // 2. Avisamos a Python (Backend)
        const response = await fetch(`http://localhost:8000/api/festivales/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // 3. Si Python dice OK, lo quitamos de la pantalla
          alert("¡Festival eliminado con éxito!");
          setEventos(eventos.filter(ev => ev.id !== id));
        } else {
          alert("Hubo un problema al intentar eliminar el festival en el servidor.");
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error de conexión con el servidor.");
      }
    }
  };

  const handleRolChange = async (email, nuevoRol) => {
    try {
      const usuarioActualizado = await actualizarRolUsuario(email, nuevoRol);
      if (usuarioActualizado) {
        setUsuarios((prevUsuarios) => prevUsuarios.map((u) => (
          u.email === email ? { ...u, rol: usuarioActualizado.rol } : u
        )));
      }
    } catch (error) {
      alert('No se pudo actualizar el rol: ' + error.message);
    }
  };

  const resetFormularioEspacio = () => {
    setNuevoEspacioData({
      id_festival: '',
      tipo: 'catering',
      tamaño: 'mediano',
      precio: 0,
      ubicacion: '',
      desc: ''
    });
    setEspacioEnEdicion(null);
  };
  
  // Función para crear parcelas/espacios libres en un festival
  const crearEspacio = async (nuevoEspacio) => {
      try {
        const respuesta = await fetch('http://localhost:8000/api/espacios/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoEspacio)
        });

        if (respuesta.ok) {
          const objetoCreado = await respuesta.json();
          setEspacios(prev => [...prev, objetoCreado]); // Actualiza la tabla automáticamente
          alert("¡Parcela creada con éxito!");
          resetFormularioEspacio();
        } else {
          alert("Hubo un error al crear el espacio");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

  const actualizarEspacio = async (idEspacio, espacioActualizado) => {
    try {
      const respuesta = await fetch(`http://localhost:8000/api/espacios/${encodeURIComponent(idEspacio)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(espacioActualizado)
      });

      if (respuesta.ok) {
        const objetoActualizado = await respuesta.json();
        setEspacios(prev => prev.map((esp) => (esp.id === idEspacio ? objetoActualizado : esp)));
        alert('¡Parcela actualizada con éxito!');
        resetFormularioEspacio();
      } else {
        const errorData = await respuesta.json().catch(() => ({}));
        alert(errorData?.detail || 'Hubo un error al actualizar la parcela');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al actualizar la parcela.');
    }
  };

  const eliminarEspacio = async (idEspacio) => {
    const confirmado = window.confirm('¿Seguro que quieres eliminar esta parcela?');
    if (!confirmado) {
      return;
    }

    try {
      const respuesta = await fetch(`http://localhost:8000/api/espacios/${encodeURIComponent(idEspacio)}`, {
        method: 'DELETE'
      });

      if (respuesta.ok) {
        setEspacios((prev) => prev.filter((esp) => esp.id !== idEspacio));
        if (espacioEnEdicion?.id === idEspacio) {
          resetFormularioEspacio();
        }
        alert('Parcela eliminada correctamente.');
      } else {
        const errorData = await respuesta.json().catch(() => ({}));
        alert(errorData?.detail || 'No se pudo eliminar la parcela.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al eliminar la parcela.');
    }
  };

  const cargarEspacioParaEdicion = (espacio) => {
    setNuevoEspacioData({
      id_festival: espacio.id_festival || '',
      tipo: espacio.tipo || 'catering',
      tamaño: espacio.tamaño || 'mediano',
      precio: Number(espacio.precio) || 0,
      ubicacion: espacio.ubicacion || '',
      desc: espacio.desc || ''
    });
    setEspacioEnEdicion(espacio);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Carga de la lista de usuarios con los datos de la BD.
  useEffect(() => {
    if (seccionActiva === 'usuarios') {
      const cargarUsuarios = async () => {
        try {
          const datosBD = await obtenerTodosUsuarios();
          setUsuarios(datosBD);
        } catch (error) {
          alert("Error al cargar la lista de usuarios: " + error.message);
        }
      };
      cargarUsuarios();
    }
  }, [seccionActiva]);

  useEffect(() => {
    const cargarTodosLosEspacios = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/espacios/');
        if (res.ok) {
          const datos = await res.json();
          setEspacios(datos);
        }
      } catch (err) {
        console.error("Error cargando espacios:", err);
      }
    };
    cargarTodosLosEspacios();
  }, [seccionActiva]);

  return (
    <main className="dashboard-container perfil-admin">
        
      {/* --- BARRA LATERAL (SIDEBAR) --- */}
      <aside className="dashboard-sidebar">
        <div className="user-profile-summary">
          <div className="user-avatar">
            <i className="fa-solid fa-crown"></i>
          </div>
          <h3>{datos.nombre} {datos.apellidos}</h3>
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
              <a href="#espacios" className={seccionActiva === 'espacios' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('espacios'); }}>
                <i className="fa-solid fa-map-location-dot"></i> Gestión de Espacios
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
                <div className="resumen-numero">{estadisticas.entradas_vendidas.toLocaleString()}</div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Ingresos Totales</div>
                <div className="resumen-numero">{estadisticas.ingresos_totales.toLocaleString()} <span style={{fontSize: '20px'}}>€</span></div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Proveedores Activos</div>
                <div className="resumen-numero">{estadisticas.proveedores_activos.toLocaleString()}</div>
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
                <div className="resumen-titulo">Escenarios Totales</div>
                <div className="resumen-numero">
                  {eventos.reduce((acc, ev) => acc + (ev.horarios ? ev.horarios.length : 0), 0)}
                </div>
              </div>
            </div>

            {/* Formulario y lista de eventos */}
            <form className="evento-form" onSubmit={handleCrearEvento} style={{display: 'flex', flexDirection: 'column', gap: '15px', background: '#1a1a1a', padding: '25px', borderRadius: '12px', border: '1px solid #333', color: '#fff'}}>
              <h3 style={{color: 'var(--color-admin)', marginBottom: '10px', fontSize: '20px'}}>Datos del Festival</h3>
              
              {/* Campos básicos */}
              <input type="text" placeholder="Título (Ej: Subsonic Belgium)" value={nuevoEvento.titulo} onChange={e => setNuevoEvento({...nuevoEvento, titulo: e.target.value})} required style={{padding: '10px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444'}} />
              
              {/* --- NUEVO CAMPO PARA LA IMAGEN --- */}
              <input 
                type="text" 
                placeholder="URL de la imagen (Ej: /subsonic_belgica.jpg o https://...)" 
                value={nuevoEvento.img || ''} 
                onChange={e => setNuevoEvento({...nuevoEvento, img: e.target.value})} 
                required 
                style={{padding: '10px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444'}} 
              />

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
              {/* LÓGICA DE ESCENARIOS Y HORARIOS */}
              <div style={{background: '#222', padding: '15px', borderRadius: '8px', border: '1px solid var(--color-admin)'}}>
                <h4 style={{margin: '0 0 10px 0', color: 'var(--color-admin)'}}>Configurar Escenarios y Horarios</h4>
                
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
                  }} style={{background: 'var(--color-admin)', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer'}}> + </button>
                </div>

                {/* Vista previa con Editar y Borrar */}
                <div style={{marginTop: '15px', maxHeight: '150px', overflowY: 'auto', fontSize: '13px'}}>
                  {nuevoEvento.horarios && nuevoEvento.horarios.map((h, i) => (
                    <div key={i} style={{marginBottom: '10px', borderLeft: '3px solid var(--color-admin)', paddingLeft: '10px'}}>
                      <div style={{color: 'var(--color-admin)', fontWeight: 'bold', marginBottom: '5px'}}>{h.stage}</div>
                      {h.acts.map((a, j) => (
                        <div key={j} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#333', padding: '4px 8px', borderRadius: '4px', marginBottom: '4px'}}>
                          <span>
                            {a.artist} 
                            <span style={{color: '#aaa', marginLeft: '10px'}}>
                              <i className="fa-regular fa-clock"></i> {a.time}
                            </span>
                          </span>
                          
                          <div style={{display: 'flex', gap: '8px'}}>
                            {/* BOTÓN EDITAR ACTO (Lápiz) */}
                            <button 
                              type="button" 
                              onClick={() => handleCargarActoParaEditar(i, j)}
                              style={{background: 'none', border: 'none', color: 'var(--color-admin)', cursor: 'pointer'}}
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>

                            {/* BOTÓN BORRAR ACTO (X) */}
                            <button 
                              type="button" 
                              onClick={() => handleEliminarActo(i, j)}
                              style={{background: 'none', border: 'none', color: 'var(--color-admin)', cursor: 'pointer'}}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div> {/* <--- Aquí se cierra la caja roja correctamente */}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" className="btn-publicar" style={{ flex: 1, background: eventoEnEdicion ? 'var(--color-admin)' : 'var(--color-admin)' }}>
                  {eventoEnEdicion ? "GUARDAR CAMBIOS" : "PUBLICAR FESTIVAL OFICIAL"}
                </button>
                {eventoEnEdicion && (
                  <button type="button" onClick={handleCancelarEdicion} className="btn-secondary" style={{ flex: 0.5, background: 'var(--color-admin-soft)', color: 'white', border: 'none', borderRadius: '4px' }}>
                    CANCELAR
                  </button>
                )}
              </div>
            </form>

            {/* LISTA DE EVENTOS (CON SPINNER Y BOTÓN DE BORRAR) */}
            {cargando ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-admin)' }}>
                <i className="fa-solid fa-circle-notch fa-spin fa-3x"></i>
                <p style={{ marginTop: '15px', fontWeight: 'bold' }}>Cargando festivales desde la base de datos...</p>
              </div>
            ) : (
              <ul style={{ marginTop: '30px', listStyle: 'none', padding: 0 }}>
                {eventos.map(evento => (
                  <li key={evento.id || evento.titulo} style={{ marginBottom: '15px', background: 'var(--gris)', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--color-admin-soft)' }}>
                    
                    {/* INFORMACIÓN DEL EVENTO */}
                    <div>
                      <strong style={{ color: 'var(--color-admin)', fontSize: '18px' }}>{evento.titulo}</strong> 
                      <span style={{ color: 'var(--apagado)', marginLeft: '10px' }}>- {evento.ubicacion}</span>
                      <span style={{ display: 'block', fontSize: '13px', color: 'var(--apagado)', marginTop: '5px' }}>
                        <i className="fa-solid fa-microphone"></i> {evento.horarios ? evento.horarios.length : 0} escenarios configurados
                      </span>
                    </div>

                    {/* BOTONERA (EDITAR Y ELIMINAR) */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => handleEditarClic(evento)}
                        style={{ background: 'var(--color-admin)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        <i className="fa-solid fa-pen"></i> Editar
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => handleEliminarFestival(evento.id, evento.titulo)}
                        style={{ background: 'var(--color-admin-soft)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        <i className="fa-solid fa-trash"></i> Eliminar
                      </button>
                    </div>

                  </li>
                ))}
              </ul>
            )}
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
                <div className="resumen-numero">{totalAdministradores}</div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Proveedores</div>
                <div className="resumen-numero">{totalProveedores}</div>
              </div>
            </div>
            {/* Tabla de usuarios */}
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>Nombre y Apellidos</th>
                  <th>Email</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}><td>{usuario.nombre} {usuario.apellidos}</td><td>{usuario.email}</td><td><select value={usuario.rol} onChange={e => handleRolChange(usuario.email, e.target.value)} style={{ textTransform: 'capitalize' }}><option value="admin">Administrador</option><option value="cliente">Cliente</option><option value="proveedor">Proveedor</option></select></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {seccionActiva === 'proveedores' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Control de Proveedores</h2>
              <p>Consulta los proveedores activos y sus espacios alquilados desde la base de datos.</p>
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
                <div className="resumen-titulo">Alquileres Activos</div>
                <div className="resumen-numero">
                  {proveedores.reduce((acc, p) => acc + (p.alquileres_activos || 0), 0)}
                </div>
              </div>
            </div>
            <table className="usuarios-table">
              <thead>
                <tr><th>Proveedor</th><th>Espacio</th><th>Alquileres Activos</th></tr>
              </thead>
              <tbody>
                {proveedores.map(p => (
                  <tr key={p.id}><td>{p.nombre}</td><td>{p.espacio}</td><td>{p.alquileres_activos}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SECCIÓN DE GESTIÓN DE ESPACIOS */}
        {seccionActiva === 'espacios' && (
          <div className="dashboard-section active">
            <header className="section-header">
              <h2><i className="fa-solid fa-map-location-dot"></i> Gestión de Espacios</h2>
              <p>Configura las parcelas comerciales para los festivales activos.</p>
            </header>
            
            <div className="evento-form" style={{ background: '#1a1a1a', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
              <h3 style={{ color: 'var(--color-admin)', marginBottom: '20px', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {espacioEnEdicion ? 'Editar Parcela de Alquiler' : 'Crear Nueva Parcela de Alquiler'}
              </h3>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: 'var(--apagado)', fontSize: '0.9rem' }}>Festival Destino</label>
                  <select 
                    style={{ padding: '12px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px', outline: 'none' }}
                    value={nuevoEspacioData.id_festival}
                    onChange={(e) => setNuevoEspacioData({...nuevoEspacioData, id_festival: e.target.value})}
                  >
                    <option value="">-- Selecciona Festival --</option>
                    {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.titulo}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: 'var(--apagado)', fontSize: '0.9rem' }}>Tipo de Servicio</label>
                  <select 
                    style={{ padding: '12px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px' }}
                    value={nuevoEspacioData.tipo}
                    onChange={(e) => setNuevoEspacioData({...nuevoEspacioData, tipo: e.target.value})}
                  >
                    <option value="">-- Selecciona Tipo --</option>
                    <option value="catering">Catering</option>
                    <option value="bebidas">Bebidas / Coctelería</option>
                    <option value="food-truck">Food Truck</option>
                    <option value="merchandising">Merchandising</option>
                    <option value="alquiler-espacios">Alquiler de espacios</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: 'var(--apagado)', fontSize: '0.9rem' }}>Ubicación (Nombre Parcela)</label>
                  <input 
                    style={{ padding: '12px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px' }}
                    type="text" 
                    placeholder="Ej: Zona Norte A1" 
                    value={nuevoEspacioData.ubicacion}
                    onChange={(e) => setNuevoEspacioData({...nuevoEspacioData, ubicacion: e.target.value})}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: 'var(--apagado)', fontSize: '0.9rem' }}>Tamaño de la parcela</label>
                  <select
                    style={{ padding: '12px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px' }}
                    value={nuevoEspacioData.tamaño}
                    onChange={(e) => setNuevoEspacioData({ ...nuevoEspacioData, tamaño: e.target.value })}
                  >
                    <option value="grande">Grande</option>
                    <option value="mediano">Mediano</option>
                    <option value="pequeño">Pequeño</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ color: 'var(--apagado)', fontSize: '0.9rem' }}>Precio de Alquiler (€)</label>
                  <input 
                    style={{ padding: '12px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px' }}
                    type="number" 
                    value={nuevoEspacioData.precio}
                    onChange={(e) => setNuevoEspacioData({...nuevoEspacioData, precio: Number(e.target.value)})}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                  <label style={{ color: 'var(--apagado)', fontSize: '0.9rem' }}>Descripción</label>
                  <textarea
                    style={{ padding: '12px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px', minHeight: '100px', resize: 'vertical' }}
                    placeholder="Describe la parcela: servicios, ubicación exacta, accesos, etc."
                    value={nuevoEspacioData.desc}
                    onChange={(e) => setNuevoEspacioData({ ...nuevoEspacioData, desc: e.target.value })}
                  />
                </div>

              </div>
              
              <button 
                className="btn-publicar" 
                style={{ marginTop: '30px', width: '100%', padding: '15px', fontWeight: 'bold' }}
                onClick={() => {
                  if (!nuevoEspacioData.id_festival) {
                    alert("Por favor, selecciona un festival.");
                    return;
                  }

                  const idEspacio = espacioEnEdicion?.id || `esp-${Date.now()}`;
                  const dataAEnviar = {
                    id: idEspacio,
                    espacio_id: idEspacio,
                    tipo: nuevoEspacioData.tipo,
                    tamaño: nuevoEspacioData.tamaño,
                    ubicacion: nuevoEspacioData.ubicacion,
                    precio: parseFloat(nuevoEspacioData.precio),
                    disponibilidad: true,
                    id_festival: nuevoEspacioData.id_festival,
                    desc: nuevoEspacioData.desc,
                    dimensiones: "Estándar",
                    servicios: []
                  };

                  console.log("Enviando datos corregidos:", dataAEnviar);

                  if (espacioEnEdicion) {
                    actualizarEspacio(espacioEnEdicion.id, dataAEnviar);
                  } else {
                    crearEspacio(dataAEnviar);
                  }
                }}
              >
                <i className="fa-solid fa-cloud-arrow-up"></i> {espacioEnEdicion ? 'GUARDAR CAMBIOS DE LA PARCELA' : 'PUBLICAR ESPACIO PARA PROVEEDORES'}
              </button>

              {espacioEnEdicion && (
                <button
                  className="btn-publicar"
                  style={{ marginTop: '10px', width: '100%', padding: '12px', background: '#333' }}
                  onClick={resetFormularioEspacio}
                >
                  Cancelar edición
                </button>
              )}
            </div>

            <div className="evento-form" style={{ background: '#1a1a1a', padding: '30px', borderRadius: '12px', border: '1px solid #333', marginTop: '20px' }}>
              <h3 style={{ color: 'var(--color-admin)', marginBottom: '20px', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Parcelas ya creadas
              </h3>

              {espacios.length === 0 ? (
                <p style={{ color: '#aaa' }}>Aun no hay parcelas registradas.</p>
              ) : (
                <table className="usuarios-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Festival</th>
                      <th>Tipo</th>
                      <th>Tamaño</th>
                      <th>Ubicación</th>
                      <th>Precio</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {espacios.map((espacio) => {
                      const festivalNombre = eventos.find((ev) => ev.id === espacio.id_festival)?.titulo || espacio.id_festival;

                      return (
                        <tr key={espacio.id}>
                          <td>{espacio.id}</td>
                          <td>{festivalNombre}</td>
                          <td>{espacio.tipo}</td>
                          <td>{espacio.tamaño}</td>
                          <td>{espacio.ubicacion}</td>
                          <td>{espacio.precio} €</td>
                          <td>{espacio.desc || '-'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => cargarEspacioParaEdicion(espacio)}
                                style={{ background: 'var(--color-admin)', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => eliminarEspacio(espacio.id)}
                                style={{ background: '#a30036', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
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
                  {estadisticas.entradas_vendidas.toLocaleString()}
                </div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Facturación Total</div>
                <div className="resumen-numero">
                  {estadisticas.ingresos_totales.toLocaleString()} <span style={{fontSize: '20px'}}>€</span>
                </div>
              </div>
              <div className="resumen-card">
                <div className="resumen-titulo">Eventos Registrados</div>
                <div className="resumen-numero">{estadisticas.eventos_registrados || 0}</div>
              </div>
            </div>
            {/* Tabla de detalle */}
            <table className="usuarios-table" style={{ marginTop: '32px' }}>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Ventas / Facturación</th>
                  <th>Espacios y Parcelas</th> {/* Nueva columna */}
                </tr>
              </thead>
              <tbody>
                {eventos.map(evento => {
                  // Filtramos espacios que pertenecen a este festival
                  const espaciosDelEvento = espacios.filter(e => e.id_festival === evento.id);

                  return (
                    <tr key={evento.id}>
                      <td style={{ fontWeight: 'bold', color: '#ff0055' }}>{evento.titulo}</td>
                      <td>{evento.entradasVendidas} tickets / {evento.facturacion}€</td>
                      <td>
                        {espaciosDelEvento.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {espaciosDelEvento.map(esp => (
                              <div key={esp.id} style={{ 
                                fontSize: '0.75rem', 
                                background: '#1a1a1a', 
                                padding: '5px 10px', 
                                borderRadius: '4px',
                                borderLeft: '3px solid #00ffcc'
                              }}>
                                <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>{esp.tipo.toUpperCase()}:</span> {esp.ubicacion}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#666', fontSize: '0.8rem' }}>Sin parcelas creadas</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </section>
    </main>
  );
}