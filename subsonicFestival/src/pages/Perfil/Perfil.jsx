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
      if (!user) {
        setRol(null);
        navigate('/');
        return;
      }

      const usuarioRol = await obtenerRolUsuario(user.uid);
      if (!usuarioRol) {
        await guardarRolUsuario(user.uid, 'client');
        setRol('client');
        return;
      }

      setRol(usuarioRol);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (!rol) return null;

return (
  // Contenedor principal del perfil, activa la vista correspondiente según el rol del usuario activo.
    <div className="dashboard-page" style={{ paddingTop: '73px', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {rol === 'client' && <PerfilCliente />}
      {rol === 'provider' && <PerfilProveedor />}
      {rol === 'admin' && <PerfilAdmin />}
    </div>
  );
}