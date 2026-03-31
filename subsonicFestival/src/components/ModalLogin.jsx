import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Funciones de Firebase
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebaseConfig';

export default function ModalLogin({ isOpen, onClose }) {
  const navigate = useNavigate();
  
  // Estado para controlar si estamos en "Login" o en "Registro"
  const [enLogin, setenLogin] = useState(true);
  // Estados de los campos del formulario
  const [rol, setRol] = useState('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState(''); // Solo se usará en el registro
  const [emailError, setEmailError] = useState('');
  const [authError, setAuthError] = useState(''); // Gestión de errores de autenticación con Firebase

  // Por ahora, solo comprueba la estructura básica del email.
  // A futuro, habrá que cambiarlo para validarlo con el backend y OAuth 2.0
  const emailEsValido = (valor) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(valor);
  };

  // Inicio de sesión con Google
  const handleGoogleLogin = async () => {
    try {
      setAuthError('');
      // 1. Abrir el popup de Google
      const result = await signInWithPopup(auth, googleProvider);
      
      // 2. Obtener el Token (JWT) de Firebase
      const idToken = await result.user.getIdToken();

      // 3. Enviarlo al Backend
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) throw new Error('Error en la autenticación del servidor');

      const data = await response.json();
      
      // 4. Guardar el ROL real que devuelve tu backend
      localStorage.setItem('usuarioRol', data.usuario.rol);
      
      // 5. Navegar y cerrar
      navigate('/perfil');
      onClose();

    } catch (error) {
      console.error("Error al autenticar:", error);
      setAuthError('Fallo al conectar con Google o el servidor.');
    }
  };

  // Si no se abre, no se renderiza
  if (!isOpen) return null;

  // Envio del formulario (inicio y registro)
  const procesarFormulario = (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Comprobación de email válido
    if (!emailEsValido(email)) {
      setEmailError('Introduce un correo válido (ej: correo@correo.com)');
      return;
    }

    setEmailError('');

    // 1. Guardamos el rol en el navegador para la simulación
    localStorage.setItem('usuarioRol', rol);
    
    // 2. Redirigimos al perfil
    navigate('/perfil'); // La ruta /perfil se encargará de mostrar la vista correcta según el rol
    
    // 3. Cerramos el modal
    onClose();
  };

  const alternarModo = () => {
    setenLogin(!enLogin);
    setEmailError(''); // Quitar errores al cambiar de inicio a registro
  };

  return (
    <div className="modal-overlay activo" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>  { /* Evita que el clic dentro del modal cierre el modal */ }
        
        {/* Cabecera dinámica - cambia según la sección seleccionada*/}
        <h3>{enLogin ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}</h3>
        <p>
          {enLogin 
            ? 'Introduce tus credenciales para acceder a tu cuenta' 
            : 'Únete a Subsonic Festival y vive la experiencia'}
        </p>
        
        <form onSubmit={procesarFormulario}>
          
          {/* Campo Nombre (SOLO en Registro) */}
          {!enLogin && (
            <div className="campo">
              <label>Nombre completo</label>
              <input 
                type="text" 
                placeholder="Ej: Jane Doe" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required={!enLogin}
              />
            </div>
          )}

          <div className="campo">
            <label>Email</label>
            <input
              type="email"
              placeholder="correo@dominio.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');  // comprobación de email correcto
              }}
              required
            />
            {emailError && <small style={{ color: '#d32f2f' }}>{emailError}</small>}
          </div>
          
          <div className="campo">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Enlace de contraseña olvidada (SOLO en Login) */}
            {enLogin && (
              <div className="forgot-password">
                {/* TODO: Añadir funcionalidad para recuperar contraseña */}
                <a href="#recuperar">¿Has olvidado tu contraseña?</a>
              </div>
            )}
          </div>
          
          {/* Selector de tipo de cuenta */}
          <div className="campo">
            <label>Tipo de Cuenta</label>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="client">Cliente</option>
              <option value="provider">Proveedor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          {/* Botones de inicio / registro */}
          <div className="modal-btns">
            <button type="button" className="btn-cerrar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-login">
              {enLogin ? 'Acceder' : 'Registrarse'}
            </button>
          </div>
        </form>

        {/* Separador */}
        <div className="auth-divider">
          <span>O</span>
        </div>

        {/* Botón de inicio con Google */}
        <button className="btn-google" type="button" onClick={handleGoogleLogin}>
          <i className="fa-brands fa-google"></i> Continuar con Google
        </button>

        {/* Alternador Login / Registro */}
        <div className="auth-toggle">
          {enLogin ? (
            <p>¿No tienes cuenta? <span onClick={alternarModo}>Regístrate aquí</span></p>
          ) : (
            <p>¿Ya tienes cuenta? <span onClick={alternarModo}>Inicia sesión</span></p>
          )}
        </div>

      </div>
    </div>
  );
}