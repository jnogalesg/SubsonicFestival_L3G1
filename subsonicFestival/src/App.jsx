import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Inicio from './pages/Inicio';
import Perfil from './pages/Perfil';

function App() {
  return (
    <BrowserRouter>
      {/* El Navbar y Footer están fuera de las Routes para que se vean siempre */}
      <Navbar /> 
      
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;