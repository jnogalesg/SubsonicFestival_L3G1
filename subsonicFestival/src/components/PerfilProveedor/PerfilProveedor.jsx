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
      
      {/* --- BARRA LATERAL --- */}
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
              <a href="#alquiler" 
                 className={seccionActiva === 'alquiler' ? 'active' : ''} 
                 onClick={(e) => { e.preventDefault(); setSeccionActiva('alquiler'); }}>
                <i className="fa-solid fa-map-location-dot"></i> Alquilar Espacios
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

        <button className="btn-secondary logout-button" onClick={cerrarSesion}>
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

            <header className="section-header" style={{marginTop: '40px'}}>
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

        {seccionActiva === 'ventas' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Resumen de Ventas</h2>
              <p>Control de ingresos en tiempo real a través de pulseras NFC / Cashless.</p>
            </header>
            <div className="ticket-card sales-card">
               <span className="ticket-type">Balance Total</span>
               <h3 className="sales-balance-title">12.450,00 €</h3>
               <p className="ticket-date">Ventas totales del último fin de semana.</p>
               <button className="btn-primary">Descargar Reporte</button>
            </div>
          </div>
        )}

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
                  <p className="ticket-price"><i className="fa-solid fa-dollar-sign"></i> 250,00 €/día</p>
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
                  <p className="ticket-price"><i className="fa-solid fa-dollar-sign"></i> 550,00 €/día</p>
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
                  <p className="ticket-price"><i className="fa-solid fa-dollar-sign"></i> 180,00 €/día</p>
                </div>
                <div className="ticket-actions">
                  <button className="btn-secondary" onClick={(e) => e.preventDefault()}>Ver Detalles</button>
                  <button className="btn-primary" onClick={(e) => e.preventDefault()}>Reservar</button>
                </div>
              </div>
            </div>

          </div>
        )}

        {seccionActiva === 'configuracion' && (
          <div className="dashboard-section">
            <header className="section-header">
              <h2>Configuración</h2>
              <p>Próximamente será implementada</p>
            </header>
          </div>
        )}

      </section>
    </main>
  );
}