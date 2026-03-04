// src/components/perfil/PerfilCliente.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PerfilCliente() {
  const [seccionActiva, setSeccionActiva] = useState('mis-entradas');
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioRol');
    navigate('/');
  };

  return (
    <main className="dashboard-container">
      {/* SIDEBAR DEL CLIENTE */}
      <aside className="dashboard-sidebar">
        <div className="user-profile-summary">
          <div className="user-avatar"><i className="fa-solid fa-user"></i></div>
          <h3>Usuario Cliente</h3>
          <p className="user-role">Asistente</p>
        </div>
        <nav className="sidebar-nav">
           {/* ... los enlaces del cliente que hicimos antes ... */}
        </nav>
        <button className="btn-secondary" onClick={cerrarSesion}>Cerrar Sesión</button>
      </aside>

      {/* CONTENIDO DEL CLIENTE */}
      <section className="dashboard-content">
        {seccionActiva === 'mis-entradas' && (
          <div><h2>Mis Entradas Activas</h2>{/* ... tarjetas de entradas ... */}</div>
        )}
      </section>
    </main>
  );
}