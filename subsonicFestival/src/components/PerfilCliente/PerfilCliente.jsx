// src/components/perfil/PerfilCliente.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../PerfilCliente/PerfilCliente.css'; 

export default function PerfilCliente() {
  const [seccionActiva, setSeccionActiva] = useState('mis-entradas');
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioRol');
    navigate('/');
  };

  return (
    // ESTRUCTURA PRINCIPAL DEL PERFIL CLIENTE
    <main className="dashboard-container">
      
      {/* --- BARRA LATERAL --- */}
      <aside className="dashboard-sidebar">
        <div className="user-profile-summary">
          <div className="user-avatar"><i className="fa-solid fa-user"></i></div>
          <h3>Usuario Cliente</h3>
          <p className="user-role">Asistente</p>
        </div>
        
        <div className="sidebar-nav">
          <ul>
            <li>
              <a href="#mis-entradas" className={seccionActiva === 'mis-entradas' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('mis-entradas'); }}>
                <i className="fa-solid fa-ticket"></i> Mis Entradas
              </a>
            </li>
            <li>
              <a href="#datos-personales" className={seccionActiva === 'datos-personales' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setSeccionActiva('datos-personales'); }}>
                <i className="fa-solid fa-user-gear"></i> Datos Personales
              </a>
            </li>
          </ul>
        </div>

        <button className="btn-secondary" style={{ marginTop: 'auto', width: '100%' }} onClick={cerrarSesion}>
          Cerrar Sesión
        </button>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <section className="dashboard-content">
        {seccionActiva === 'mis-entradas' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Mis Entradas Activas</h2>
              <p>Gestiona tus accesos para los próximos festivales.</p>
            </header>

            <div className="tickets-grid">
              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type">Abono General</span>
                  <h3>Subsonic Summer 2026</h3>
                  <p className="ticket-date"><i className="fa-regular fa-calendar"></i> 15-17 de Julio, 2026</p>
                  <p className="ticket-location"><i className="fa-solid fa-location-dot"></i> Recinto Ferial, Madrid</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Ver Entrada / QR</button>
                  <button className="btn-secondary">Revender</button>
                </div>
              </div>

              <div className="ticket-card">
                <div className="ticket-info">
                  <span className="ticket-type vip">Pase VIP</span>
                  <h3>Electrobeach Festival</h3>
                  <p className="ticket-date"><i className="fa-regular fa-calendar"></i> 22 de Agosto, 2026</p>
                  <p className="ticket-location"><i className="fa-solid fa-location-dot"></i> Playa de San Juan, Alicante</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-primary">Ver Entrada / QR</button>
                  <button className="btn-secondary">Opciones VIP</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {seccionActiva === 'datos-personales' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Datos Personales</h2>
              <p>Aquí irá tu formulario de datos.</p>
            </header>
          </div>
        )}
      </section>
      
    </main>
  );
}