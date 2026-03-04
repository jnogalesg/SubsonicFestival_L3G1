import { useState } from 'react';
import ModalCheckout from '../components/ModalCheckout';

export default function Inicio() {
  // Estado para guardar los datos del ticket seleccionado. 
  // Si es null, el modal estará cerrado.
  const [checkoutData, setCheckoutData] = useState(null);

  // Función para abrir el modal con los datos correctos
  const abrirCheckout = (tipo, precio, evento, fecha, lugar) => {
    setCheckoutData({ tipo, precio, evento, fecha, lugar });
  };

  return (
    <>
      {/* TITULO INICIO - Fíjate en cómo se escriben los estilos en línea en React: {{ objeto }} */}
      <div id="inicio" style={{ paddingTop: '80px' }}>
        <section style={{ padding: 0, maxWidth: '100%' }}>
          <div id="inicio-content" className="hero-section">
            <div className="hero-bg"></div>
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <div className="hero-tag">Festivales de Música Electrónica</div>
              <h1>SUB<em>SONIC</em><br/>FESTIVAL</h1>
              <p className="hero-sub">Bélgica · Tailandia · Brasil &nbsp;·&nbsp; Julio – Diciembre 2026</p>
              <div className="hero-btns">
                <a href="#eventos" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Ver Eventos</a>
              </div>
            </div>
            <div className="stats-bar">
              <div className="stat"><div className="stat-num">3</div><div className="stat-label">Festivales</div></div>
              <div className="stat"><div className="stat-num">150+</div><div className="stat-label">Artistas</div></div>
              <div className="stat"><div className="stat-num">400K</div><div className="stat-label">Asistentes</div></div>
              <div className="stat"><div className="stat-num">12</div><div className="stat-label">Escenarios</div></div>
            </div>
          </div>
        </section>
      </div>

      {/* EVENTOS */}
      <div id="eventos" className="bg-gradient">
        <section>
          <div className="section-label">Próximos Festivales</div>
          <h2>EVENTOS 2026</h2>

          <div className="evento-card">
            <div className="evento-img-wrap">
              <img className="evento-img" src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600" alt="Subsonic Belgium" />
            </div>
            <div className="evento-info">
              <div className="evento-badges">
                <span className="badge badge-red">Entradas disponibles</span>
                <span className="badge badge-white">Belgium</span>
              </div>
              <div className="evento-nombre">Subsonic Belgium</div>
              <div className="evento-meta">
                <div className="meta-item"><span className="meta-icon">📍</span> Dreamville Grounds, Boom — Bélgica</div>
                <div className="meta-item"><span className="meta-icon">📅</span> 18 – 27 Julio 2026</div>
              </div>
              <p className="evento-desc">El festival más grande de Europa regresa a Bélgica con más de 50 artistas internacionales...</p>
              
              <div className="evento-tickets">
                {/* ¡OJO AQUÍ! Así se pasan funciones con parámetros en el onClick de React */}
                <div className="ticket-pill" onClick={() => abrirCheckout('Day Pass', 89, 'Subsonic Belgium', '18–27 Jul 2026', 'Boom, Belgium')}>
                  <div className="ticket-tipo">Day Pass</div>
                  <div className="ticket-precio">89<span className="ticket-moneda">€</span></div>
                </div>
                <div className="ticket-pill" onClick={() => abrirCheckout('Weekend Pass', 199, 'Subsonic Belgium', '18–27 Jul 2026', 'Boom, Belgium')}>
                  <div className="ticket-tipo">Weekend Pass</div>
                  <div className="ticket-precio">199<span className="ticket-moneda">€</span></div>
                </div>
              </div>
            </div>
          </div>
          {/* Puedes pegar el resto de tus eventos debajo siguiendo esta estructura */}
        </section>
      </div>

      {/* ARTISTAS */}
      <div id="artistas">
        <section>
          <div className="section-label">Lineup 2026</div>
          <h2>ARTISTAS</h2>
          <div className="grid-artistas">
            
            <div className="artista-card">
              <img className="artista-img" src="https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400" alt="DJ Apex" />
              <div className="artista-overlay"></div>
              <div className="artista-info">
                <div className="artista-nombre">DJ Apex</div>
                <div className="artista-genero">Techno</div>
              </div>
            </div>

            {/* Pega el resto de tus artistas aquí */}

          </div>
        </section>
      </div>

      {/* MODAL DE COMPRA */}
      <ModalCheckout 
        isOpen={!!checkoutData} // Convierte el objeto a boolean (true si hay datos, false si es null)
        onClose={() => setCheckoutData(null)} 
        ticketData={checkoutData} 
      />
    </>
  );
}