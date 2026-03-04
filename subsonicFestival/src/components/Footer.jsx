export default function Footer() {
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
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#eventos">Eventos</a></li>
            <li><a href="#artistas">Artistas</a></li>
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