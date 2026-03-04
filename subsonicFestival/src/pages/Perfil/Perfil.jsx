// src/pages/Perfil.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import PerfilCliente from '../../components/PerfilCliente/PerfilCliente';
// import PerfilProveedor from '../../components/PerfilProveedor/PerfilProveedor';
// import PerfilAdmin from '../../components/PerfilAdmin';

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
    <div className="dashboard-page" style={{ paddingTop: '73px', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {rol === 'client' && <PerfilCliente />}
      {/* {rol === 'provider' && <PerfilProveedor />} */}
      {/* {rol === 'admin' && <PerfilAdmin />} */}
      
      {/* BOTÓN DE EMERGENCIA: Si el rol no es cliente ni proveedor, muestra esto para poder salir */}
      {rol !== 'client' && (
        <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>
          <h2>Área de {rol} en construcción</h2>
          <p>Todavía no hemos programado esta vista.</p>
          <button 
            onClick={() => { localStorage.removeItem('usuarioRol'); window.location.href = '/'; }}
            style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#bc0850', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Volver al Inicio (Cerrar Sesión)
          </button>
        </div>
      )}
    </div>
  );
}