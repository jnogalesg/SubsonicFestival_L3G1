import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ModalLogin from './ModalLogin';

export default function Navbar() {
  // Estado para controlar si el modal está abierto o cerrado
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para saber si el usuario ya inició sesión
  const [userRol, setUserRol] = useState(null);
  
  // Detecta cambios de ruta (para actualizar la navbar al navegar)
  const location = useLocation();

  // useEffect se ejecuta cada vez que cambia la ruta (location).
  // Es el equivalente moderno a tu window.onload
  useEffect(() => {
    const rolActual = localStorage.getItem('usuarioRol');
    setUserRol(rolActual);
  }, [location]);

  return (
    <>
      <nav>
        {/* Usamos <Link> de React Router en lugar de <a href="/"> */}
        <Link to="/" className="logo">SUB<span>SONIC</span></Link>
        
        <ul className="nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#eventos">Eventos</a></li>
          <li><a href="#artistas">Artistas</a></li>
        </ul>
        
        {/* Renderizado condicional: ¿Está logueado? */}
        {userRol ? (
          <Link to={userRol === 'client' ? '/perfil-cliente' : '/perfil'}>
            <button className="btn-nav">Mi Perfil</button>
          </Link>
        ) : (
          <button className="btn-nav" onClick={() => setIsModalOpen(true)}>
            Iniciar sesión
          </button>
        )}
      </nav>

      {/* Aquí insertamos el Modal. Le pasamos el estado y la función para cerrarlo */}
      <ModalLogin 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}