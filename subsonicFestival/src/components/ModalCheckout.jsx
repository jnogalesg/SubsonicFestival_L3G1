import { useState } from 'react';

export default function ModalCheckout({ isOpen, onClose, ticketData }) {
  const [comprando, setComprando] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const confirmarCompra = async () => {
    const emailUsuario = localStorage.getItem('userEmail');

    if (!emailUsuario) {
      setError('Debes iniciar sesión para comprar una entrada.');
      return;
    }

    setComprando(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/entradas/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_festival: ticketData.id_festival,
          tipo: ticketData.tipo,
          comprador_nombre: ticketData.nombre || emailUsuario,
          comprador_email: emailUsuario,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'No se pudo completar la compra.');
      }

      alert('🎉 ¡Compra realizada con éxito! Puedes ver tu entrada en Mis Entradas.');
      onClose();
    } catch (err) {
      setError(err.message || 'Error al procesar la compra. Inténtalo de nuevo.');
    } finally {
      setComprando(false);
    }
  };

  return (
    <div className="modal-overlay activo" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>COMPRAR ENTRADA</h3>
        <p>Resumen de tu pedido</p>
        
        {/* Usamos el objeto ticketData para mostrar la información dinámica */}
        <div className="checkout-resumen">
          <div className="checkout-fila"><span>Evento</span><span>{ticketData?.evento}</span></div>
          <div className="checkout-fila"><span>Fecha</span><span>{ticketData?.fecha}</span></div>
          <div className="checkout-fila"><span>Lugar</span><span>{ticketData?.lugar}</span></div>
          <div className="checkout-fila"><span>Tipo</span><span>{ticketData?.tipo}</span></div>
          <div className="checkout-fila"><span>Total</span><span>{ticketData?.precio} €</span></div>
        </div>
        
        {error && <p style={{ color: '#d32f2f', marginBottom: '10px' }}>{error}</p>}
        
        <div className="modal-btns">
          <button className="btn-cerrar" onClick={onClose} disabled={comprando}>Cancelar</button>
          <button className="btn-login" onClick={confirmarCompra} disabled={comprando}>
            {comprando ? 'Procesando...' : 'Confirmar compra →'}
          </button>
        </div>
      </div>
    </div>
  );
}