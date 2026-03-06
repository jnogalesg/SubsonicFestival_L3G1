import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ModalLogin from './ModalLogin';

export default function Navbar() {
  // Estado para controlar si el modal está abierto o cerrado
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para saber si el usuario ya inició sesión
  const [userRol, setUserRol] = useState(null);
  
  // Detecta cambios de ruta (para actualizar la navbar al navegar)
  const location = useLocation();
  const navigate = useNavigate();

  // useEffect se ejecuta cada vez que cambia la ruta (location).
  useEffect(() => {
    const rolActual = localStorage.getItem('usuarioRol');
    setUserRol(rolActual);
  }, [location]);

  const rolValido = userRol === 'client' || userRol === 'provider' || userRol === 'admin';

  // Maneja el clic en el enlace de inicio. 
  // Si ya estamos en la página de inicio sin hash, simplemente hacemos scroll al top.
  const irAInicio = (e) => {
    if (location.pathname === '/' && !location.hash) {
      e.preventDefault();
      // Scroll suave al top de la página de inicio
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Limpiamos el hash de la URL para evitar confusiones si el usuario vuelve a hacer clic en "Inicio"
      window.history.replaceState(null, '', `/`);
    }
  };

  // Maneja el clic en los enlaces de sección (Eventos, Música).
  // Si ya estamos en la página de inicio, hacemos scroll a la sección correspondiente.
  // Si no, navegamos a la página de inicio con el hash para que el efecto de scroll se active al cargar.
  const irASeccionInicio = (e, sectionId) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const section = document.getElementById(sectionId); 
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', `/#${sectionId}`);
      }
      return;
    }

    navigate(`/#${sectionId}`);
  };

  return (
    <>
      <nav>
        {/* Usamos <Link> de React Router en lugar de <a href="/"> */}
        <Link to="/" className="logo">
          <img src="/SubsonicIcon.svg" alt="Subsonic" className="logo-img" />
          SUB<span>SONIC</span>
        </Link>
        
        <ul className="nav-links">
          <li><Link to="/" onClick={irAInicio}>Inicio</Link></li>
          <li><Link to="/#eventos" onClick={(e) => irASeccionInicio(e, 'eventos')}>Eventos</Link></li>
          <li><Link to="/#musica" onClick={(e) => irASeccionInicio(e, 'musica')}>Música</Link></li>
          <li><Link to="/#tienda" onClick={(e) => irASeccionInicio(e, 'tienda')}>Tienda</Link></li>
        </ul>
        
        {/* Renderizado condicional: Si está iniciada la sesión, mostrar botón de Mi Perfil */}
        {rolValido ? (
          <Link to="/perfil">
            <button className="btn-nav">Mi Perfil</button>
          </Link>
        ) : ( // Si no hay sesión iniciada, mostrar botón de Iniciar Sesión
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