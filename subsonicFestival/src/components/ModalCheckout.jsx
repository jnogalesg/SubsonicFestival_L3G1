export default function ModalCheckout({ isOpen, onClose, ticketData }) {
  if (!isOpen) return null; // Si no está abierto, no renderiza nada

  const confirmarCompra = () => {
    alert('🎉 ¡Compra realizada con éxito!');
    onClose();
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
        
        <div className="campo">
          <label>Nombre completo</label>
          <input type="text" placeholder="Tu nombre" />
        </div>
        <div className="campo">
          <label>Email</label>
          <input type="email" placeholder="tu@email.com" />
        </div>
        <div className="campo">
          <label>Tarjeta (simulado)</label>
          <input type="text" placeholder="0000 0000 0000 0000" />
        </div>
        
        <div className="modal-btns">
          <button className="btn-cerrar" onClick={onClose}>Cancelar</button>
          <button className="btn-login" onClick={confirmarCompra}>Confirmar compra →</button>
        </div>
      </div>
    </div>
  );
}