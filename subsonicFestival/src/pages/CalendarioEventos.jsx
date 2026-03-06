import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function Calendario() {
  const eventosCalendario = [
    { mes: 'JULIO 2026', dia: '18-27', evento: 'Subsonic Belgium', lugar: 'Boom, Bélgica', estado: 'Confirmado' },
    { mes: 'AGOSTO 2026', dia: '08-17', evento: 'Subsonic Thailand', lugar: 'Pattaya, Tailandia', estado: 'Confirmado' },
    { mes: 'SEPTIEMBRE 2026', dia: '12-21', evento: 'Subsonic Brazil', lugar: 'Itu, Brasil', estado: 'Pocas Entradas' },
  ];

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--negro)', color: '#fff' }}>
        <section>
          <div className="section-label">Agenda Global</div>
          <h2>CALENDARIO 2026</h2>
          
          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {eventosCalendario.map((ev, index) => (
              <div key={index} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--gris2)', padding: '30px', borderRadius: '12px',
                borderLeft: '4px solid var(--rojo)'
              }}>
                <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', minWidth: '100px' }}>
                    <div style={{ fontSize: '14px', color: '#888', letterSpacing: '2px' }}>{ev.mes}</div>
                    <div style={{ fontSize: '32px', fontFamily: 'Bebas Neue', color: '#fff' }}>{ev.dia}</div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#fff' }}>{ev.evento}</h3>
                    <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>📍 {ev.lugar}</p>
                  </div>
                </div>
                <div style={{ 
                  padding: '8px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
                  background: ev.estado === 'Pocas Entradas' ? 'rgba(255,165,0,0.2)' : 'rgba(0,255,0,0.1)',
                  color: ev.estado === 'Pocas Entradas' ? 'orange' : '#0f0'
                }}>
                  {ev.estado}
                </div>
              </div>
            ))}
          </div>

          {/* BOTÓN VOLVER AL INICIO */}
          <div style={{textAlign: 'center', marginTop: 50}}>
              <Link to="/" className="btn-outline-small" style={{textDecoration: 'none'}}>
                ← Volver al Inicio
              </Link>
          </div>

        </section>
      </div>
    </>
  );
}