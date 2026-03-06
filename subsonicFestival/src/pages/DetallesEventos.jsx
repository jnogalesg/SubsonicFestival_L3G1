import { useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Para leer la URL
import NavBar from '../components/NavBar';
import Footer from '../components/Footer'; 
import ModalCheckout from '../components/ModalCheckout';
import { datosEventos } from '../data/dataEventos'; // Importamos los datos

export default function DetallesEventos() {
  const { id } = useParams(); // Captura el ID de la URL
  const evento = datosEventos.find(ev => ev.id === id); // Busca el evento correcto
  
  const [tab, setTab] = useState('artistas');
  const [checkoutData, setCheckoutData] = useState(null);

  const abrirCheckout = (tipo, precio, evt, fecha, lugar) => {
    setCheckoutData({ tipo, precio, evento: evt, fecha, lugar });
  };

  // Si alguien pone una URL inventada, mostramos error
  if (!evento) return <div style={{color:'white', padding:100}}>Evento no encontrado</div>;

  return (
    <>
      <NavBar />
      
      {/* CABECERA GIGANTE */}
      <div style={{
        height: '60vh', 
        background: `url(${evento.img}) center/cover no-repeat`,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end'
      }}>
        <div style={{
          background: 'linear-gradient(to top, var(--negro), transparent)',
          width: '100%',
          padding: '40px 5%',
          paddingBottom: '80px'
        }}>
          <h1 style={{fontSize: 'clamp(40px, 5vw, 80px)', margin: 0}}>{evento.titulo}</h1>
          <p style={{fontSize: '20px', color: '#ccc'}}>📍 {evento.ubicacion} &nbsp;|&nbsp; 📅 {evento.fechas}</p>
        </div>
      </div>

      {/* CUERPO DE LA PÁGINA */}
      <div style={{ background: 'var(--negro)', minHeight: '50vh', padding: '0 5% 80px' }}>
        
        {/* PESTAÑAS */}
        <div className="evento-tabs-header" style={{ justifyContent: 'center' }}>
          <button className={`tab-btn ${tab === 'artistas' ? 'activo' : ''}`} onClick={() => setTab('artistas')}>🎵 Artistas</button>
          <button className={`tab-btn ${tab === 'horarios' ? 'activo' : ''}`} onClick={() => setTab('horarios')}>🕒 Horarios</button>
          <button className={`tab-btn ${tab === 'servicios' ? 'activo' : ''}`} onClick={() => setTab('servicios')}>🍔 Servicios</button>
          <button className={`tab-btn ${tab === 'pases' ? 'activo' : ''}`} onClick={() => setTab('pases')}>🎟 Pases</button>
        </div>

        {/* CONTENIDO PESTAÑAS */}
        <div className="tab-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* ARTISTAS */}
            {tab === 'artistas' && (
              <div className="mini-grid-artistas" style={{justifyContent: 'center'}}>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW_bhHSBpSm9A6W1pDkSqCpXYJbBNzm6PMGw&s" alt="DJ Apex" /><span>DJ Apex</span></div>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF-_OCnG4F3tsCAPLpTcWwxvmQYyGR7OefMQ&s" alt="Armin" /><span>Armin van Buuren</span></div>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSySq2NtSO7oM_ZCN0VmHPXIpl7l_2GgURFDw&s" alt="Martin" /><span>Martin Garrix</span></div>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeo_wr98JZby-RJpcPQ7TefoCsBj0exx-YuA&s" alt="Guetta" /><span>David Guetta</span></div>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbnua9TEJezEWsj9Eohmbdi0udF6O27t6NmQ&s" alt="Tiësto" /><span>Tiësto</span></div>
                  <p style={{width: '100%', textAlign: 'center', color: '#999', marginTop: '20px', fontSize: '14px', fontWeight: '500'}}>
                    +50 artistas internacionales confirmados
                  </p>
              </div>
            )}

            {/* HORARIOS */}
            {tab === 'horarios' && (
              <div className="horarios-list">
                {evento.horarios.map((stage, idx) => (
                  <div key={idx} style={{marginBottom:30, background: 'var(--gris2)', padding: 20, borderRadius: 12}}>
                     <h4 style={{color:'var(--rojo)', marginBottom:12, textTransform:'uppercase'}}>{stage.stage}</h4>
                     {stage.acts.map((act, i) => (
                        <div key={i} className="horario-row">
                          <div className="horario-artista"><strong>{act.artist}</strong></div>
                          <div className="horario-hora">{act.time}</div>
                        </div>
                     ))}
                  </div>
                ))}
              </div>
            )}

            {/* SERVICIOS */}
            {tab === 'servicios' && (
               <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:16}}>
                 {evento.servicios.map((serv, i) => (
                   <div key={i} style={{background:'var(--gris2)', padding:24, borderRadius:8, display:'flex', alignItems:'center', gap:10, border: '1px solid rgba(255,255,255,0.1)'}}>
                      <span style={{color:'var(--rojo)', fontSize: 24}}>✓</span> <span style={{fontSize: 18}}>{serv}</span>
                   </div>
                 ))}
               </div>
            )}

            {/* PASES */}
            {tab === 'pases' && (
              <div className="evento-tickets" style={{justifyContent: 'center'}}>
                  <div className="ticket-box" onClick={() => abrirCheckout('Day Pass', evento.precios.day, evento.titulo, evento.fechas, evento.ubicacion)}>
                    <div className="ticket-content">
                      <span className="ticket-tipo">Day Pass</span>
                      <span className="ticket-precio">{evento.precios.day}€</span>
                    </div>
                  </div>
                  <div className="ticket-box" onClick={() => abrirCheckout('Weekend Pass', evento.precios.weekend, evento.titulo, evento.fechas, evento.ubicacion)}>
                    <div className="ticket-content">
                      <span className="ticket-tipo">Weekend Pass</span>
                      <span className="ticket-precio">{evento.precios.weekend}€</span>
                    </div>
                  </div>
              </div>
            )}
        </div>
        
        <div style={{textAlign: 'center', marginTop: 50}}>
            <Link to="/" className="btn-outline-small">← Volver al Inicio</Link>
        </div>
      </div>

      <ModalCheckout isOpen={!!checkoutData} onClose={() => setCheckoutData(null)} ticketData={checkoutData} />
    </>
  );
}