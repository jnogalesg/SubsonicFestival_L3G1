import { useNavigate } from 'react-router-dom';

export default function VistaProveedor() {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioRol');
    navigate('/');
  };

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <div className="section-label">Panel de Control</div>
        <h2>ÁREA DE PROVEEDORES</h2>
      </div>
      <div>
        <h3>Tus Puestos Comerciales</h3>
        <p>Gestiona tu inventario y el alquiler de espacios en los festivales.</p>
        {/* Aquí iría la tabla de productos o facturas */}
      </div>
      <button className="btn-logout" onClick={cerrarSesion}>Cerrar Sesión</button>
    </div>
  );
}