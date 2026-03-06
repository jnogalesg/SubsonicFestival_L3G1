import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import Inicio from './pages/Inicio';
import Perfil from './pages/Perfil/Perfil';
import Calendario from './pages/CalendarioEventos';

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
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;