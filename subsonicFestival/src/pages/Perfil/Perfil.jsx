// src/pages/Perfil.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { obtenerUsuario, obtenerPerfilCompleto } from '../../firebase/userRoleService';

import PerfilCliente from '../../components/PerfilCliente/PerfilCliente';
import PerfilProveedor from '../../components/PerfilProveedor/PerfilProveedor';
import PerfilAdmin from '../../components/PerfilAdmin/PerfilAdmin';

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      // si no hay un usuario con sesión activa, se redirige a la página de inicio y se limpia el rol.
      if (!usuario) {
        navigate('/');
        return;
      }

      // Obtener los datos del usuario desde el backend y actualizar los datos del perfil.
      try {
        const datosPerfil = await obtenerPerfilCompleto();

        setUsuario(datosPerfil);

      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
        setUsuario(null);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // mostrar un mensaje de carga mientras se obtiene el usuario 
  if (!usuario) return <p>Cargando perfil...</p>;

return (
  // Contenedor principal del perfil, activa la vista correspondiente según el rol del usuario activo.
    <div className="dashboard-page" style={{ paddingTop: '73px', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {usuario && usuario.rol === 'cliente' && <PerfilCliente datos={usuario} />}
      {usuario && usuario.rol === 'proveedor' && <PerfilProveedor datos={usuario} />}
      {usuario && usuario.rol === 'admin' && <PerfilAdmin datos={usuario} />}
    </div>
  );
}
