import { useState } from 'react';

export default function ModalEventoDetalle({ data, onClose, abrirCheckout }) {
  // Estado para controlar qué pestaña estás viendo
  const [tab, setTab] = useState('artistas'); 

  return (
    <div className="modal-overlay activo" onClick={(e) => { if(e.target.className.includes('modal-overlay')) onClose() }}>
      
      <div className="modal modal-grande">
        {/* 1. CABECERA */}
        <div style={{position:'relative'}}>
          <img src={data.img} alt={data.titulo} className="modal-header-img" />
          <button onClick={onClose} style={{
            position:'absolute', top:15, right:15, 
            background:'rgba(0,0,0,0.6)', border:'none', color:'#fff', 
            width:32, height:32, borderRadius:'50%', cursor:'pointer', fontWeight:'bold'
          }}>✕</button>
          <div style={{position:'absolute', bottom:20, left:20, textShadow:'0 2px 4px rgba(0,0,0,0.8)'}}>
             <h2 style={{margin:0, fontSize:42}}>{data.titulo}</h2>
             <span style={{color:'#fff', fontSize:14}}>📍 {data.ubicacion} | 📅 {data.fechas}</span>
          </div>
        </div>

        <div className="modal-content-body">
          {/* 2. PESTAÑAS */}
          <div className="evento-tabs-header">
            <button className={`tab-btn ${tab === 'artistas' ? 'activo' : ''}`} onClick={() => setTab('artistas')}>🎵 Artistas</button>
            <button className={`tab-btn ${tab === 'horarios' ? 'activo' : ''}`} onClick={() => setTab('horarios')}>🕒 Horarios</button>
            <button className={`tab-btn ${tab === 'servicios' ? 'activo' : ''}`} onClick={() => setTab('servicios')}>🍔 Servicios</button>
            <button className={`tab-btn ${tab === 'pases' ? 'activo' : ''}`} onClick={() => setTab('pases')}>🎟 Pases</button>
          </div>

          {/* 3. CONTENIDO */}
          <div className="tab-content" style={{minHeight: 200}}>
            
            {/* ARTISTAS */}
            {tab === 'artistas' && (
              <div className="mini-grid-artistas">
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW_bhHSBpSm9A6W1pDkSqCpXYJbBNzm6PMGw&s" alt="DJ Apex" /><span>DJ Apex</span></div>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF-_OCnG4F3tsCAPLpTcWwxvmQYyGR7OefMQ&s" alt="Armin" /><span>Armin van Buuren</span></div>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSySq2NtSO7oM_ZCN0VmHPXIpl7l_2GgURFDw&s" alt="Martin" /><span>Martin Garrix</span></div>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeo_wr98JZby-RJpcPQ7TefoCsBj0exx-YuA&s" alt="Guetta" /><span>David Guetta</span></div>
                  <div className="artista-item-mini"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbnua9TEJezEWsj9Eohmbdi0udF6O27t6NmQ&s" alt="Tiësto" /><span>Tiësto</span></div>
                  <p style={{color:'#888', fontSize:13, marginTop:15}}>+50 artistas internacionales confirmados.</p>
              </div>
            )}

            {/* HORARIOS */}
            {tab === 'horarios' && (
              <div className="horarios-list">
                {data.horarios.map((stage, idx) => (
                  <div key={idx} style={{marginBottom:20}}>
                     <h4 style={{color:'var(--rojo)', marginBottom:8, textTransform:'uppercase'}}>{stage.stage}</h4>
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
               <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
                 {data.servicios.map((serv, i) => (
                   <div key={i} style={{background:'rgba(255,255,255,0.05)', padding:16, borderRadius:8, display:'flex', alignItems:'center', gap:10}}>
                      <span style={{color:'var(--rojo)'}}>✓</span> {serv}
                   </div>
                 ))}
               </div>
            )}

            {/* PASES */}
            {tab === 'pases' && (
              <div className="evento-tickets">
                  <div className="ticket-box" onClick={() => abrirCheckout('Day Pass', data.precios.day, data.titulo, data.fechas, data.ubicacion)}>
                    <div className="ticket-content">
                      <span className="ticket-tipo">Day Pass</span>
                      <span className="ticket-precio">{data.precios.day}€</span>
                    </div>
                  </div>
                  <div className="ticket-box" onClick={() => abrirCheckout('Weekend Pass', data.precios.weekend, data.titulo, data.fechas, data.ubicacion)}>
                    <div className="ticket-content">
                      <span className="ticket-tipo">Weekend Pass</span>
                      <span className="ticket-precio">{data.precios.weekend}€</span>
                    </div>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}