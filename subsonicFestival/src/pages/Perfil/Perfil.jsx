// src/pages/Perfil.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { obtenerUsuario } from '../../firebase/userRoleService';

import PerfilCliente from '../../components/PerfilCliente/PerfilCliente';
import PerfilProveedor from '../../components/PerfilProveedor/PerfilProveedor';
import PerfilAdmin from '../../components/PerfilAdmin/PerfilAdmin';

export default function Perfil() {
  const [rol, setRol] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      // si no hay un usuario con sesión activa, se redirige a la página de inicio y se limpia el rol.
      if (!usuario) {
        setRol(null);
        navigate('/');
        return;
      }

      // Obtener el rol del usuario desde el backend y actualizar el estado del rol.
      try {
        const usuario = await obtenerUsuario();
        if (usuario && usuario.rol) {
          setRol(usuario.rol);
        } else {
          setRol(null);
        }
      } catch (error) {
        console.error('No se pudo obtener el rol del backend:', error);
        setRol(null);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Si el rol no es válido, no se muestra nada
  if (!rol) return null;

return (
  // Contenedor principal del perfil, activa la vista correspondiente según el rol del usuario activo.
    <div className="dashboard-page" style={{ paddingTop: '73px', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {rol === 'cliente' && <PerfilCliente />}
      {rol === 'proveedor' && <PerfilProveedor />}
      {rol === 'admin' && <PerfilAdmin />}
    </div>
  );
}