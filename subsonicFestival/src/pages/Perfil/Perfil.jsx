// src/pages/Perfil.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { guardarRolUsuario, obtenerRolUsuario } from '../../firebase/userRoleService';

import PerfilCliente from '../../components/PerfilCliente/PerfilCliente';
import PerfilProveedor from '../../components/PerfilProveedor/PerfilProveedor';
import PerfilAdmin from '../../components/PerfilAdmin/PerfilAdmin';

export default function Perfil() {
  const [rol, setRol] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // si no hay un usuario con sesión activa, se redirige a la página de inicio y se limpia el rol.
      if (!user) {
        setRol(null);
        navigate('/');
        return;
      }

      // si el usuario no tiene un rol guardado, se le asigna el rol de cliente por defecto.
      const usuarioRol = await obtenerRolUsuario(user.uid);
      if (!usuarioRol) {
        await guardarRolUsuario(user.uid, 'cliente');
        setRol('cliente');
        return;
      }

      // se actualiza el estado del rol con el valor obtenido de Firebase.
      setRol(usuarioRol);
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