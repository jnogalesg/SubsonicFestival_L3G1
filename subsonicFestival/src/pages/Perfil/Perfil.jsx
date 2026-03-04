import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './Perfil.css';

import PerfilCliente from '../../components/PerfilCliente/PerfilCliente';
import PerfilProveedor from '../../components/PerfilProveedor/PerfilProveedor';

export default function Perfil() {
  const [rol, setRol] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioRol = localStorage.getItem('usuarioRol');
    if (!usuarioRol) {
      navigate('/');
    } else {
      setRol(usuarioRol);
    }
  }, [navigate]);

  // Pantalla de carga mientras lee el rol
  if (!rol) {
    return (
      <div className="perfil-estado">
        <h2>Cargando perfil...</h2>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div className="perfil-wrapper">
      {rol === 'client' && <PerfilCliente />}
      {rol === 'provider' && <PerfilProveedor />}
      
      {/* error si el rol es inválido */}
      {rol !== 'client' && rol !== 'provider' && rol !== 'manager' && (
         <div className="perfil-estado">
            <h2 className="perfil-error-titulo">¡Aviso para el desarrollador!</h2>
            <p>El rol guardado es: <strong>"{rol}"</strong>, y no tiene ningún componente asignado.</p>
         </div>
      )}
    </div>
  );
}