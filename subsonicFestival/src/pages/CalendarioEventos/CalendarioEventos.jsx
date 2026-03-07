import { Link } from 'react-router-dom';
import './CalendarioEventos.css';

export default function Calendario() {
  const eventosCalendario = [
    { mes: 'JULIO 2026', dia: '18-27', evento: 'Subsonic Belgium', lugar: 'Boom, Bélgica', estado: 'Confirmado' },
    { mes: 'AGOSTO 2026', dia: '08-17', evento: 'Subsonic Thailand', lugar: 'Pattaya, Tailandia', estado: 'Confirmado' },
    { mes: 'SEPTIEMBRE 2026', dia: '12-21', evento: 'Subsonic Brazil', lugar: 'Itu, Brasil', estado: 'Pocas Entradas' },
  ];

  return (
    <>
      <div className="calendario-page">
        <section>
          <div className="section-label">Agenda Global</div>
          <h2>CALENDARIO 2026</h2>
          
          <div className="calendario-lista">
            {eventosCalendario.map((ev, index) => (
              <div key={index} className="calendario-card">
                <div className="calendario-card-main">
                  <div className="calendario-fecha-box">
                    <div className="calendario-mes">{ev.mes}</div>
                    <div className="calendario-dia">{ev.dia}</div>
                  </div>
                  <div>
                    <h3 className="calendario-evento">{ev.evento}</h3>
                    <p className="calendario-lugar"> <i className="fa-solid fa-location-dot"></i> {ev.lugar}</p>
                  </div>
                </div>
                <div className={`calendario-estado ${ev.estado === 'Pocas Entradas' ? 'warning' : 'ok'}`}>
                  {ev.estado}
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