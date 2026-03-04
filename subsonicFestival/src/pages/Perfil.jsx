import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Importamos las vistas (las crearemos en el paso 3)
import VistaCliente from '../components/perfil/PerfilCliente';
// import VistaProveedor from '../components/perfil/PerfilProveedor';
// import VistaManager from '../components/perfil/PerfilAdmin';

export default function Perfil() {
  const [rol, setRol] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Leemos el rol
    const usuarioRol = localStorage.getItem('usuarioRol');
    
    // 2. Si no hay rol (no está logueado), lo echamos al inicio
    if (!usuarioRol) {
      navigate('/');
    } else {
      // 3. Si hay rol, lo guardamos en el estado
      setRol(usuarioRol);
    }
  }, [navigate]);

  // Mientras lee el rol, mostramos algo vacío o de carga para que no pegue un salto
  if (!rol) return null;

  // Renderizado condicional mágico:
  // React dibujará SOLO el componente que coincida con el rol
  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      {rol === 'client' && <VistaCliente />}
      {rol === 'provider' && <VistaProveedor />}
      {rol === 'manager' && <VistaManager />}
    </div>
  );
}