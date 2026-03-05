// src/pages/Perfil.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import PerfilCliente from '../../components/PerfilCliente/PerfilCliente';
import PerfilProveedor from '../../components/PerfilProveedor/PerfilProveedor';
import PerfilAdmin from '../../components/PerfilAdmin/PerfilAdmin';

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