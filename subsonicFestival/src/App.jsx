import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import Inicio from './pages/Inicio';
import Perfil from './pages/Perfil/Perfil';
import Tienda from './pages/Tienda/Tienda';
import Calendario from './pages/CalendarioEventos/CalendarioEventos';
import DetallesEventos from './components/DetallesEventos/DetallesEventos';
// 1. IMPORTAMOS EL PERFIL DE ADMINISTRADOR
import PerfilAdmin from './components/PerfilAdmin/PerfilAdmin';

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const id = location.hash.replace('#', '');
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      {/* El Navbar y Footer están fuera de las Routes para que se vean siempre */}
      <Navbar /> 
      
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/evento/:id" element={<DetallesEventos />} />
        <Route path="/tienda" element={<Tienda />} />
        
        {/* 2. CREAMOS LA RUTA SECRETA PARA SALTARNOS EL LOGIN */}
        <Route path="/admin-test" element={<PerfilAdmin />} />

      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;