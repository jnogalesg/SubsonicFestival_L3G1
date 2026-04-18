import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Para leer la URL
import ModalCheckout from '../ModalCheckout';
import { auth } from '../../firebase/firebaseConfig';
import { obtenerPerfilCompleto } from '../../firebase/userRoleService';
import './DetallesEventos.css';

export default function DetallesEventos() {
  const { id } = useParams(); // Captura el ID de la URL

  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [tab, setTab] = useState('artistas');
  const [checkoutData, setCheckoutData] = useState(null);
  const [comprando, setComprando] = useState(false);
  const [pasesDisponibles, setPasesDisponibles] = useState([]);

  useEffect(() => {
    let cancelado = false;

    const cargarFestival = async () => {
      setCargando(true);

      try {
        const [festivalResponse, catalogoResponse] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/festivales/${id}`),
          fetch(`http://127.0.0.1:8000/api/entradas/festival/${id}/catalogo`),
        ]);

        if (!festivalResponse.ok) {
          setEvento(null);
          return;
        }

        const data = await festivalResponse.json();
        let pases = [];

        if (catalogoResponse.ok) {
          const catalogoData = await catalogoResponse.json();
          pases = Array.isArray(catalogoData?.pases) ? catalogoData.pases : [];
        }

        if (!cancelado) {
          setEvento(data);
          setPasesDisponibles(pases);
        }
      } catch (error) {
        console.error('Error al cargar el detalle del festival:', error);
        if (!cancelado) {
          setEvento(null);
          setPasesDisponibles([]);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargarFestival();

    return () => {
      cancelado = true;
    };
  }, [id]);

  const abrirCheckout = (tipo, precio, evt, fecha, lugar) => {
    if (!auth.currentUser) {
      alert('Debes iniciar sesión para comprar entradas.');
      return;
    }

    setCheckoutData({ tipo, precio, evento: evt, fecha, lugar, id_festival: evento.id });
  };

  if (cargando) return <div className="detalles-error">Cargando festival...</div>;
  if (!evento) return <div className="detalles-error">Evento no encontrado en la base de datos</div>;

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
        alert(`Compra realizada. Entrada vinculada a ${entrada.comprador_email}.`);
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
        style={{ backgroundImage: `url(${evento.img || "/subsonic_belgica.jpg"})` }}
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
              <div className="artistas-container-nuevo">
                {evento.horarios && evento.horarios.length > 0 ? (
                  [...new Set(evento.horarios.flatMap(stage => stage.acts.map(act => act.artist)))].map((artista, idx) => (
                    <div key={idx} className="artista-badge">
                      {artista}
                    </div>
                  ))
                ) : (
                  <div className="sin-datos-aviso">
                    No hay artistas confirmados todavía para este evento.
                  </div>
                )}
              </div>
            )}

            {/* HORARIOS */}
            {tab === 'horarios' && (
              <div className="horarios-list">
                {evento.horarios?.map((stage, idx) => (  // la ?: para que si no tiene horarios guardados, no se rompa la app
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
                 {evento.servicios?.map((serv, i) => (  // la ?: para que si no tiene servicios guardados, no se rompa la app
                 <div key={i} className="detalles-servicio-card">
                   <span className="detalles-servicio-check">✓</span> <span className="detalles-servicio-text">{serv}</span>
                   </div>
                 ))}
               </div>
            )}

            {/* PASES */}
            {tab === 'pases' && (
              <div className="evento-tickets detalles-tickets-centered">
                {pasesDisponibles.length === 0 && (
                  <div className="detalles-error">No hay entradas configuradas para este festival.</div>
                )}

                {pasesDisponibles.map((pase, idx) => (
                  <div
                    key={`${pase.tipo}-${idx}`}
                    className="ticket-box"
                    onClick={() => abrirCheckout(pase.tipo, pase.precio, evento.titulo, evento.fechas, evento.ubicacion)}
                  >
                    <div className="ticket-content">
                      <span className="ticket-tipo">{pase.tipo}</span>
                      <span className="ticket-precio">{pase.precio !== null && pase.precio !== undefined ? `${pase.precio}€` : '--'}</span>
                    </div>
                  </div>
                ))}
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