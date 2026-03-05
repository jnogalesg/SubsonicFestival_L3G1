import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PerfilProveedor.css'; 

export default function PerfilProveedor() {
  const [seccionActiva, setSeccionActiva] = useState('mis-servicios');
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioRol');
    navigate('/');
  };

  return (
    <main className="dashboard-container perfil-proveedor">
      
      {/* --- BARRA LATERAL (Misma estructura que Cliente) --- */}
      <aside className="dashboard-sidebar">
        <div className="user-profile-summary">
          <div className="user-avatar"><i className="fa-solid fa-shop"></i></div>
          <h3>Panel Proveedor</h3>
          <p className="user-role">Socio Comercial</p>
        </div>
        
        <div className="sidebar-nav">
          <ul>
            <li>
              <a href="#mis-servicios" 
                 className={seccionActiva === 'mis-servicios' ? 'active' : ''} 
                 onClick={(e) => { e.preventDefault(); setSeccionActiva('mis-servicios'); }}>
                <i className="fa-solid fa-boxes-stacked"></i> Mis Servicios
              </a>
            </li>
            <li>
              <a href="#ventas" 
                 className={seccionActiva === 'ventas' ? 'active' : ''} 
                 onClick={(e) => { e.preventDefault(); setSeccionActiva('ventas'); }}>
                <i className="fa-solid fa-chart-line"></i> Ventas
              </a>
            </li>
            <li>
              <a href="#configuracion" 
                 className={seccionActiva === 'configuracion' ? 'active' : ''} 
                 onClick={(e) => { e.preventDefault(); setSeccionActiva('configuracion'); }}>
                <i className="fa-solid fa-gears"></i> Configuración
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
        
        {seccionActiva === 'mis-servicios' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Mis Servicios y Puestos</h2>
              <p>Gestiona tu presencia y stock en los eventos activos.</p>
              <button className="btn-primary" style={{marginTop: '15px'}}>+ Registrar Nuevo</button>
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

        {seccionActiva === 'ventas' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Resumen de Ventas</h2>
              <p>Control de ingresos en tiempo real a través de pulseras NFC / Cashless.</p>
            </header>
            <div className="ticket-card" style={{maxWidth: '400px'}}>
               <span className="ticket-type">Balance Total</span>
               <h3 style={{fontSize: '48px'}}>$12.450,00</h3>
               <p className="ticket-date">Ventas totales del último fin de semana.</p>
               <button className="btn-primary">Descargar Reporte</button>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}