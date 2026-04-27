import { useEffect, useState } from 'react';

export default function ModalCheckout({ isOpen, onClose, ticketData, onConfirm, loading = false, checkoutType = 'festival' }) {
  const [talla, setTalla] = useState('M');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [errorFormulario, setErrorFormulario] = useState('');
  const esMerch = checkoutType === 'merch';

  useEffect(() => {
    if (isOpen) {
      setTalla('M');
      setNombre('');
      setEmail('');
      setTarjeta('');
      setErrorFormulario('');
    }
  }, [isOpen, checkoutType]);

  if (!isOpen) return null; // Si no está abierto, no renderiza nada

  const emailEsValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const tarjetaNormalizada = tarjeta.replace(/\s+/g, '');
  const tarjetaEsValida = /^\d{16}$/.test(tarjetaNormalizada);
  const formularioValido = nombre.trim().length > 1 && emailEsValido && tarjetaEsValida;

  const confirmarCompra = () => {
    if (!formularioValido) {
      setErrorFormulario('Completa nombre, email y tarjeta (16 dígitos) para continuar.');
      return;
    }

    if (!loading && onConfirm) {
      onConfirm({ talla, nombre: nombre.trim(), email: email.trim(), tarjeta: tarjetaNormalizada }); 
    }
  };
  
  return (
    <div className="modal-overlay activo" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{esMerch ? 'COMPRAR PRODUCTO' : 'COMPRAR ENTRADA'}</h3>
        <p>Resumen de tu pedido</p>
        
        <div className="checkout-resumen">
          {esMerch ? (
            <>
              <div className="checkout-fila"><span>Producto</span><span>{ticketData?.producto || ticketData?.tipo}</span></div>
              <div className="checkout-fila"><span>Descripción</span><span>{ticketData?.descripcion || ticketData?.lugar}</span></div>
              <div className="checkout-fila"><span>Talla</span><span>{talla}</span></div>
            </>
          ) : (
            <>
              <div className="checkout-fila"><span>Evento</span><span>{ticketData?.evento}</span></div>
              <div className="checkout-fila"><span>Fecha</span><span>{ticketData?.fecha}</span></div>
              <div className="checkout-fila"><span>Lugar</span><span>{ticketData?.lugar}</span></div>
              <div className="checkout-fila"><span>Tipo</span><span>{ticketData?.tipo}</span></div>
            </>
          )}
          <div className="checkout-fila"><span>Total</span><span>{ticketData?.precio} €</span></div>
        </div>

        {esMerch && (
          <div className="campo">
            <label>Talla</label>
            <select value={talla} onChange={(e) => setTalla(e.target.value)}>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>
          
        )}

        <div className="campo">
          <label>Nombre completo</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (errorFormulario) setErrorFormulario('');
            }}
            required
          />
        </div>
        <div className="campo">
          <label>Email</label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorFormulario) setErrorFormulario('');
            }}
            required
          />
        </div>
        <div className="campo">
          <label>Tarjeta</label>
          <input
            type="text"
            placeholder="0000000000000000"
            value={tarjeta}
            onChange={(e) => {
              const soloDigitos = e.target.value.replace(/\D/g, '').slice(0, 16);
              setTarjeta(soloDigitos);
              if (errorFormulario) setErrorFormulario('');
            }}
            required
            inputMode="numeric"
            maxLength={16}
          />
        </div>

        {errorFormulario && <p className="auth-error">{errorFormulario}</p>}
        
        <div className="modal-btns">
          <button className="btn-cerrar" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn-login" onClick={confirmarCompra} disabled={loading}>
            {loading ? 'Procesando...' : 'Confirmar compra →'}
          </button>
        </div>
      </div>
    </div>
  );
}
