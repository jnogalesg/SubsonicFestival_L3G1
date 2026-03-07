import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

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
      <footer>
        <div>
          <div className="footer-logo">SUB<span>SONIC</span></div>
          <p className="footer-desc">La experiencia definitiva de música electrónica en los destinos más espectaculares del mundo.</p>
        </div>
        <div>
          <div className="footer-titulo">Navegación</div>
          <ul className="footer-links">
            <li><Link to="/" onClick={irAInicio}>Inicio</Link></li>
            <li><Link to="/#eventos" onClick={(e) => irASeccionInicio(e, 'eventos')}>Eventos</Link></li>
            <li><Link to="/calendario"> Calendario</Link></li>
            <li><Link to="/#musica" onClick={(e) => irASeccionInicio(e, 'musica')}>Música</Link></li>
            <li><Link to="/tienda">Tienda</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-titulo">Contacto</div>
          <ul className="footer-links">
            <li><a href="#">info@subsonicfestival.com</a></li>
            <li><a href="#">Prensa y medios</a></li>
            <li><a href="#">Proveedores</a></li>
          </ul>
        </div>
      </footer>
      <div className="footer-bottom">© 2026 Subsonic Festival. Todos los derechos reservados.</div>
    </>
  );
}