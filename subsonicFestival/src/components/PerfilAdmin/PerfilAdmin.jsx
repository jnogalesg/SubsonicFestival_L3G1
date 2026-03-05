import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './PerfilAdmin.css';

export default function PerfilAdmin() {
  // Estado para controlar qué sección del menú está activa
  const [seccionActiva, setSeccionActiva] = useState('overview');
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioRol');
    navigate('/');
  };

  return (
    <main className="dashboard-container perfil-admin">
        
      {/* --- BARRA LATERAL (SIDEBAR) --- */}
      <aside className="dashboard-sidebar">
        <div className="user-profile-summary">
          <div className="user-avatar">
            <i className="fa-solid fa-crown"></i>
          </div>
          <h3>Joe</h3>
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
            {/* Contenido de eventos */}
          </div>
        )}

        {seccionActiva === 'usuarios' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Usuarios y Accesos</h2>
              <p>Administra los roles y permisos de las cuentas registradas.</p>
            </header>
          </div>
        )}

        {seccionActiva === 'proveedores' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Control de Proveedores</h2>
              <p>Gestiona los espacios alquilados y el merchandising.</p>
            </header>
          </div>
        )}

        {seccionActiva === 'finanzas' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Finanzas y Ventas</h2>
              <p>Reportes de facturación y analíticas de venta de entradas.</p>
            </header>
          </div>
        )}

      </section>
    </main>
  );
}