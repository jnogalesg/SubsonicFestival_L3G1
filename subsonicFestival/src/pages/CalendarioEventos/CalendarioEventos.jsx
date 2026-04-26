import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CalendarioEventos.css';

export default function Calendario() {
  const [eventosBackend, setEventosBackend] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('http://subsonicfestival-l3g1.duckdns.org:8000/api/festivales/')
      .then(res => res.json())
      .then(data => {
        setEventosBackend(data);
        setCargando(false);
      })
      .catch(error => {
        console.error("Error cargando el calendario:", error);
        setCargando(false);
      });
  }, []);

  if (cargando) return <div className="calendario-page"><h2 style={{color: 'white', textAlign: 'center'}}>Cargando calendario...</h2></div>;

  return (
    <>
      <div className="calendario-page">
        <section>
          <div className="section-label">Agenda Global</div>
          <h2>CALENDARIO 2026</h2>
          
          <div className="calendario-lista">
            {eventosBackend.map((ev, index) => (
              <div key={ev.id || index} className="calendario-card">
                <div className="calendario-card-main">
                  <div className="calendario-fecha-box">
                    {/* Adaptamos la caja para mostrar la fecha de SQLite */}
                    <div className="calendario-mes" style={{fontSize: '0.8rem'}}>FESTIVAL</div>
                    <div className="calendario-dia" style={{fontSize: '1rem', padding: '5px'}}>{ev.fechas}</div>
                  </div>
                  <div>
                    <h3 className="calendario-evento">{ev.titulo}</h3>
                    <p className="calendario-lugar"> <i className="fa-solid fa-location-dot"></i> {ev.ubicacion}</p>
                  </div>
                </div>
                {/* De momento ponemos "Confirmado" por defecto para todos */}
                <div className="calendario-estado ok">
                  Confirmado
                </div>
              </div>
            ))}
          </div>

          {/* BOTÓN VOLVER AL INICIO */}
          <div className="calendario-back">
            <Link to="/#eventos" className="btn-outline-small calendario-back-link">
              ← Volver al Inicio
            </Link>
          </div>

        </section>
      </div>
    </>
  );
}
