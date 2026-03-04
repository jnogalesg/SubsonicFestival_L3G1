import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ModalLogin({ isOpen, onClose }) {
  const navigate = useNavigate();
  // Guardamos el rol seleccionado en el estado de React
  const [rol, setRol] = useState('client');

  // Si isOpen es falso, no renderizamos absolutamente nada (escondemos el modal)
  if (!isOpen) return null;

  const hacerLogin = () => {
    // 1. Guardamos el rol en el navegador (igual que hacías en JS)
    localStorage.setItem('usuarioRol', rol);
    
    // 2. Redirigimos según el rol
    Maps('/perfil'); // La ruta /perfil se encargará de mostrar la vista correcta según el rol
    
    // 3. Cerramos el modal
    onClose();
  };

  return (
    // La clase "activo" se la ponemos fija porque si el componente se renderiza, es que está activo.
    // El onClick del overlay permite cerrar el modal si hacemos clic fuera de la caja.
    <div className="modal-overlay activo" onClick={onClose}>
      
      {/* e.stopPropagation() evita que al hacer clic DENTRO del modal blanco, este se cierre */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>ACCEDER</h3>
        <p>Introduce tus credenciales para acceder a tu cuenta</p>
        
        <div className="campo">
          <label>Email</label>
          <input type="email" placeholder="tu@email.com" />
        </div>
        
        <div className="campo">
          <label>Contraseña</label>
          <input type="password" placeholder="••••••••" />
        </div>
        
        <div className="campo">
          <label>Rol</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="client">Cliente</option>
            <option value="provider">Proveedor</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        
        <div className="modal-btns">
          {/* onClick={onClose} llama a la función de la Navbar para cerrar el modal */}
          <button className="btn-cerrar" onClick={onClose}>Cancelar</button>
          <button className="btn-login" onClick={hacerLogin}>Entrar →</button>
        </div>
      </div>
    </div>
  );
}