import { useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Para leer la URL
import ModalCheckout from '../ModalCheckout';
import { datosEventos } from '../../data/dataEventos'; // Importamos los datos
import { auth } from '../../firebase/firebaseConfig';
import { obtenerPerfilCompleto } from '../../firebase/userRoleService';
import './DetallesEventos.css';

export default function DetallesEventos() {
  const { id } = useParams(); // Captura el ID de la URL
  const evento = datosEventos.find(ev => ev.id === id); // Busca el evento correcto
  
  const [tab, setTab] = useState('artistas');
  const [checkoutData, setCheckoutData] = useState(null);
  const [comprando, setComprando] = useState(false);

  const abrirCheckout = (tipo, precio, evt, fecha, lugar) => {
    if (!auth.currentUser) {
      alert('Debes iniciar sesión para comprar entradas.');
      return;
    }

    setCheckoutData({ tipo, precio, evento: evt, fecha, lugar, id_festival: evento.id });
  };

  // Si alguien pone una URL incorrecta, mostramos error
  if (!evento) return <div className="detalles-error">Evento no encontrado</div>;

  const procesarCompraFinal = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert('Debes iniciar sesión para comprar entradas.');
      return;
    }

    if (!checkoutData) {
      return;
    }

    setComprando(true);

    try {
      const token = await currentUser.getIdToken();
      const perfil = await obtenerPerfilCompleto();

      const response = await fetch('http://127.0.0.1:8000/api/entradas/comprar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_festival: checkoutData.id_festival,
          tipo: checkoutData.tipo,
          comprador_nombre: `${perfil?.nombre || ''} ${perfil?.apellidos || ''}`.trim() || currentUser.displayName || 'Cliente',
          comprador_email: perfil?.email || currentUser.email,
        }),
      });

      if (response.ok) {
        const entrada = await response.json();
        alert(`Compra realizada. Entrada ${entrada.id_entrada} vinculada a ${entrada.comprador_email}.`);
        setCheckoutData(null);
        return;
      }

      const errorData = await response.json().catch(() => ({}));
      const detalle = errorData?.detail || 'No se pudo completar la compra.';

      if (response.status === 401) {
        alert('Debes iniciar sesión para comprar entradas.');
      } else if (response.status === 403) {
        alert(`Acceso denegado. ${detalle}`);
      } else {
        alert(`Error al comprar entrada: ${detalle}`);
      }
    } catch (error) {
      console.error('Error al procesar la compra de entrada:', error);
      alert('Error de conexión al procesar la compra de la entrada.');
    } finally {
      setComprando(false);
    }
  };

  return (
    <>
      {/* CABECERA */}
      <div
        className="detalles-hero"
        style={{ background: `url(${evento.img}) center/cover no-repeat` }}
      >
        <div className="detalles-hero-overlay">
          <h1 className="detalles-title">{evento.titulo}</h1>
          <p className="detalles-subtitle">
              <i className="fa-solid fa-location-dot"></i> {evento.ubicacion} &nbsp;
              |&nbsp; <i className="fa-solid fa-calendar"></i> {evento.fechas}</p>
        </div>
      </div>

      {/* CUERPO DE LA PÁGINA */}
      <div className="detalles-body">
        
        {/* PESTAÑAS */}
        <div className="evento-tabs-header detalles-tabs-centered">
          <button className={`tab-btn ${tab === 'artistas' ? 'activo' : ''}`} onClick={() => setTab('artistas')}> <i className="fa-solid fa-music"></i> Artistas</button>
          <button className={`tab-btn ${tab === 'horarios' ? 'activo' : ''}`} onClick={() => setTab('horarios')}><i className="fa-solid fa-clock"></i> Horarios</button>
          <button className={`tab-btn ${tab === 'servicios' ? 'activo' : ''}`} onClick={() => setTab('servicios')}><i className="fa-solid fa-utensils"></i> Servicios</button>
          <button className={`tab-btn ${tab === 'pases' ? 'activo' : ''}`} onClick={() => setTab('pases')}><i className="fa-solid fa-ticket"></i> Pases</button>
        </div>

        {/* CONTENIDO PESTAÑAS */}
        <div className="tab-content detalles-tab-content">
            
            {/* ARTISTAS */}
            {tab === 'artistas' && (
              <div className="mini-grid-artistas detalles-artistas-centered">
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW_bhHSBpSm9A6W1pDkSqCpXYJbBNzm6PMGw&s" alt="DJ Apex" /><span>DJ Apex</span></div>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF-_OCnG4F3tsCAPLpTcWwxvmQYyGR7OefMQ&s" alt="Armin" /><span>Armin van Buuren</span></div>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSySq2NtSO7oM_ZCN0VmHPXIpl7l_2GgURFDw&s" alt="Martin" /><span>Martin Garrix</span></div>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeo_wr98JZby-RJpcPQ7TefoCsBj0exx-YuA&s" alt="Guetta" /><span>David Guetta</span></div>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbnua9TEJezEWsj9Eohmbdi0udF6O27t6NmQ&s" alt="Tiësto" /><span>Tiësto</span></div>
                  <p className="detalles-artistas-note">
                    +50 artistas internacionales confirmados
                  </p>
              </div>
            )}

            {/* HORARIOS */}
            {tab === 'horarios' && (
              <div className="horarios-list">
                {evento.horarios.map((stage, idx) => (
                  <div key={idx} className="detalles-stage-card">
                     <h4 className="detalles-stage-title">{stage.stage}</h4>
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
              <div className="detalles-servicios-grid">
                 {evento.servicios.map((serv, i) => (
                 <div key={i} className="detalles-servicio-card">
                   <span className="detalles-servicio-check">✓</span> <span className="detalles-servicio-text">{serv}</span>
                   </div>
                 ))}
               </div>
            )}

            {/* PASES */}
            {tab === 'pases' && (
              <div className="evento-tickets detalles-tickets-centered">
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
        
        <div className="detalles-back-wrap">
            <Link to="/#eventos" className="btn-outline-small detalles-back-link">
                ← Volver al Inicio
              </Link>
        </div>
      </div>

      <ModalCheckout
        isOpen={!!checkoutData}
        onClose={() => setCheckoutData(null)}
        ticketData={checkoutData}
        onConfirm={procesarCompraFinal}
        loading={comprando}
      />
    </>
  );
}