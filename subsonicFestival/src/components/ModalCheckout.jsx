import { useState } from 'react';

export default function ModalCheckout({ isOpen, onClose, ticketData }) {
  const [paso, setPaso] = useState(1);
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState('');
  const [datosPago, setDatosPago] = useState({
    titular: '',
    tarjeta: '',
    caducidad: '',
    cvv: '',
  });

  if (!isOpen) return null;

  const handleCerrar = () => {
    setPaso(1);
    setError('');
    setDatosPago({ titular: '', tarjeta: '', caducidad: '', cvv: '' });
    onClose();
  };

  const validarPago = () => {
    if (!datosPago.titular.trim()) return 'Introduce el nombre del titular.';
    if (datosPago.tarjeta.replace(/\s/g, '').length !== 16) return 'La tarjeta debe tener 16 dígitos.';
    if (!datosPago.caducidad.match(/^\d{2}\/\d{2}$/)) return 'La caducidad debe tener el formato MM/AA.';
    if (datosPago.cvv.length !== 3) return 'El CVV debe tener 3 dígitos.';
    return null;
  };

  const confirmarCompra = async () => {
    const errorValidacion = validarPago();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    const emailUsuario = localStorage.getItem('userEmail');

    if (!emailUsuario) {
      setError('Debes iniciar sesión para comprar una entrada.');
      return;
    }

    setComprando(true);
    setError('');

    try {
      // Solo llamamos al endpoint de entradas si el checkout corresponde a un festival.
      if (ticketData?.id_festival) {
        const response = await fetch('http://127.0.0.1:8000/api/entradas/comprar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_festival: ticketData.id_festival,
            tipo: ticketData.tipo,
            comprador_nombre: datosPago.titular,
            comprador_email: emailUsuario,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail || 'No se pudo completar la compra.');
        }
      }

      setPaso(3);
    } catch (err) {
      setError(err.message || 'Error al procesar la compra. Inténtalo de nuevo.');
    } finally {
      setComprando(false);
    }
  };

  const formatearTarjeta = (valor) => {
    const soloNumeros = valor.replace(/\D/g, '').slice(0, 16);
    return soloNumeros.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div className="modal-overlay activo" onClick={handleCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {paso === 1 && (
          <>
            <h3>COMPRAR ENTRADA</h3>
            <p>Resumen de tu pedido</p>

            <div className="checkout-resumen">
              <div className="checkout-fila"><span>Evento</span><span>{ticketData?.evento}</span></div>
              <div className="checkout-fila"><span>Fecha</span><span>{ticketData?.fecha}</span></div>
              <div className="checkout-fila"><span>Lugar</span><span>{ticketData?.lugar}</span></div>
              <div className="checkout-fila"><span>Tipo</span><span>{ticketData?.tipo}</span></div>
              <div className="checkout-fila"><span>Total</span><strong>{ticketData?.precio} €</strong></div>
            </div>

            <div className="modal-btns">
              <button className="btn-cerrar" onClick={handleCerrar}>Cancelar</button>
              <button className="btn-login" onClick={() => setPaso(2)}>Ir al pago →</button>
            </div>
          </>
        )}

        {paso === 2 && (
          <>
            <h3>DATOS DE PAGO</h3>
            <p>Introduce los datos de tu tarjeta</p>

            <div className="campo">
              <label>Titular de la tarjeta</label>
              <input
                type="text"
                placeholder="Nombre Apellidos"
                value={datosPago.titular}
                onChange={(e) => setDatosPago({ ...datosPago, titular: e.target.value })}
              />
            </div>

            <div className="campo">
              <label>Número de tarjeta</label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                value={datosPago.tarjeta}
                onChange={(e) => setDatosPago({ ...datosPago, tarjeta: formatearTarjeta(e.target.value) })}
                maxLength={19}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="campo" style={{ flex: 1 }}>
                <label>Caducidad</label>
                <input
                  type="text"
                  placeholder="MM/AA"
                  value={datosPago.caducidad}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    if (val.length > 2) val = `${val.slice(0, 2)}/${val.slice(2)}`;
                    setDatosPago({ ...datosPago, caducidad: val });
                  }}
                  maxLength={5}
                />
              </div>

              <div className="campo" style={{ flex: 1 }}>
                <label>CVV</label>
                <input
                  type="password"
                  placeholder="..."
                  value={datosPago.cvv}
                  onChange={(e) => setDatosPago({ ...datosPago, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                  maxLength={3}
                />
              </div>
            </div>

            <div className="checkout-resumen" style={{ marginTop: '12px' }}>
              <div className="checkout-fila"><span>Total a pagar</span><strong>{ticketData?.precio} €</strong></div>
            </div>

            {error && <p style={{ color: '#d32f2f', margin: '8px 0' }}>{error}</p>}

            <div className="modal-btns">
              <button className="btn-cerrar" onClick={() => { setPaso(1); setError(''); }} disabled={comprando}>
                Volver
              </button>
              <button className="btn-login" onClick={confirmarCompra} disabled={comprando}>
                {comprando ? 'Procesando...' : `Pagar ${ticketData?.precio} €`}
              </button>
            </div>
          </>
        )}

        {paso === 3 && (
          <>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>Compra completada</div>
              <h3>COMPRA REALIZADA</h3>
              <p style={{ margin: '12px 0' }}>Tu pedido para <strong>{ticketData?.evento}</strong> esta confirmado.</p>
              <p style={{ opacity: 0.7, fontSize: '14px' }}>Puedes verlo en tu perfil, en Mis Entradas.</p>
            </div>
            <div className="modal-btns" style={{ justifyContent: 'center' }}>
              <button className="btn-login" onClick={handleCerrar}>Cerrar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}