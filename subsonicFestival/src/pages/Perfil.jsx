import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importamos los componentes de perfil para cada rol
import PerfilCliente from '../components/perfil/PerfilCliente';
import PerfilProveedor from '../components/perfil/PerfilProveedor';

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

  // Si todavía no ha leído el rol, mostramos un texto temporal en lugar de devolver null
  if (!rol) {
    return (
      <div style={{ paddingTop: '150px', textAlign: 'center', minHeight: '100vh' }}>
        <h2>Cargando perfil...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Si el rol coincide, dibuja tu componente */}
      {rol === 'client' && <PerfilCliente />}
      {rol === 'provider' && <PerfilProveedor />}
      
      {/* Si el rol es una palabra rara, lo mostrará en pantalla */}
      {rol !== 'client' && rol !== 'provider' && rol !== 'manager' && (
         <div style={{ paddingTop: '150px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--rojo)' }}>¡Aviso para el desarrollador!</h2>
            <p>El rol guardado es: <strong>"{rol}"</strong>, y no tiene ningún componente asignado.</p>
         </div>
      )}
    </div>
  );
}