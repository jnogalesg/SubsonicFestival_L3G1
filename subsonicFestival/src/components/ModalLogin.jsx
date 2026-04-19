import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebaseConfig';
import { guardarRolUsuario, obtenerUsuario } from '../firebase/userRoleService';

export default function ModalLogin({ isOpen, onClose }) {
  const navigate = useNavigate();
  
  // Estado para controlar si estamos en "Login" o en "Registro"
  const [enLogin, setenLogin] = useState(true);
  // Estados de los campos del formulario
  const [rol, setRol] = useState('cliente');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState(''); // Solo se usará en el registro
  const [apellidos, setApellidos] = useState(''); // Solo se usará en el registro
  const [emailError, setEmailError] = useState('');
  const [authError, setAuthError] = useState(''); // Gestión de errores de autenticación con Firebase
  const [authSuccess, setAuthSuccess] = useState('');
  const [cargando, setCargando] = useState(false);

  // Comprobación básica de formato de email
  const emailEsValido = (valor) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(valor);
  };

  // Inicio de sesión con Google
  const handleGoogleLogin = async () => {
    try {
      setAuthError('');
      setAuthSuccess('');
      setCargando(true);
      // 1. Abrir el popup de Google
      const userCredential = await signInWithPopup(auth, googleProvider);

      // solo permite acceso si el usuario ya existe en la BD local.
      await obtenerUsuario(userCredential.user);

      if (userCredential.user?.email) {
        localStorage.setItem('userEmail', userCredential.user.email);
      }

      // Navegar y cerrar
      navigate('/perfil');
      onClose();

    } catch (error) {
      console.error("Error al autenticar:", error);
      if ((error?.message || '').includes('Usuario no registrado en la base de datos local')) {
        await signOut(auth);
        setAuthError('Tu cuenta existe en Firebase, pero no está registrada en la base de datos local. Contacta con un administrador.');
      } else {
        setAuthError('Fallo al iniciar sesión con Google.');
      }
    } finally {
      setCargando(false);
    }
  };

  const recuperarContrasena = async () => {
    const emailNormalizado = (email || '').trim();
    setAuthError('');
    setAuthSuccess('');
    setEmailError('');

    if (!emailNormalizado) {
      setEmailError('Introduce tu email para recuperar la contraseña.');
      return;
    }

    if (!emailEsValido(emailNormalizado)) {
      setEmailError('Introduce un email válido.');
      return;
    }

    setCargando(true);
    try {
      await sendPasswordResetEmail(auth, emailNormalizado);
      setAuthSuccess('Te hemos enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.');
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error.code || error.message || error);
      if (error.code === 'auth/invalid-email') {
        setEmailError('El formato del email no es válido.');
      } else {
        setAuthError('No se pudo enviar el correo de recuperación. Inténtalo de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  };

  // Si no se abre, no se renderiza
  if (!isOpen) return null;

  // Envio del formulario con correo y contraseña (inicio y registro)
  const procesarFormulario = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setAuthError('');
    setAuthSuccess('');
    setEmailError('');

    if (!emailEsValido(email)) {
      setEmailError('Introduce un email válido.');
      return;
    }

    if (!enLogin && nombre.trim().length === 0) {
      setAuthError('Debes indicar un nombre para registrarte.');
      return;
    }

    if (!enLogin && apellidos.trim().length === 0) {
      setAuthError('Debes indicar tus apellidos para registrarte.');
      return;
    }

    if (!enLogin && password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    try {
      let userCredential;

      if (enLogin) {
        // LOGIN
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        await obtenerUsuario(userCredential.user);
        localStorage.setItem('userEmail', userCredential.user?.email || email);
      } else {
        // REGISTRO
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Actualizamos el nombre en el perfil de Firebase
        await updateProfile(userCredential.user, { displayName: `${nombre} ${apellidos}`.trim() });
        // Registro del perfil en SQLite usando token validado por Firebase.
        await guardarRolUsuario(userCredential.user.uid, rol, {
          nombre,
          apellidos,
        }, userCredential.user);
        localStorage.setItem('userEmail', userCredential.user?.email || email);
      }

      // Navegar y cerrar una vez que Firebase confirma la sesión
      navigate('/perfil');
      onClose();

    } catch (error) {
      console.error("Error en formulario:", error.code || error.message || error);
      if ((error?.message || '').includes('Usuario no registrado en la base de datos local')) {
        await signOut(auth);
        setAuthError('Tu cuenta existe en Firebase, pero no está registrada en la base de datos local.');
      }
      if (error.code === 'auth/user-not-found') setAuthError('Email o contraseña incorrectos.');
      else if (error.code === 'auth/wrong-password') setAuthError('Email o contraseña incorrectos.');
      else if (error.code === 'auth/invalid-credential') setAuthError('Email o contraseña incorrectos.');
      else if (error.code === 'auth/invalid-email') setAuthError('El formato del email no es válido.');
      else if (error.code === 'auth/email-already-in-use') setAuthError('El email ya está registrado.');
      else if (error.code === 'auth/weak-password') setAuthError('La contraseña debe tener al menos 6 caracteres.');
      else if (!(error?.message || '').includes('Usuario no registrado en la base de datos local')) setAuthError('Error al procesar la solicitud.');

    } finally {
      setCargando(false);
    }
  };

  const alternarModo = () => {
    setenLogin(!enLogin);
    setRol('cliente');
    setEmailError(''); // Quitar errores al cambiar de inicio a registro
    setAuthError('');
    setAuthSuccess('');
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
              <label>Nombre</label>
              <input 
                type="text" 
                placeholder="Ej: Jane" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required={!enLogin}
              />
            </div>
          )}
          {!enLogin && (
            <div className="campo">
              <label>Apellidos</label>
              <input 
                type="text" 
                placeholder="Ej: Doe" 
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
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
                if (authSuccess) setAuthSuccess('');
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
              minLength={enLogin ? 1 : 6}
              required
            />
            {!enLogin && (
              <small className="password-hint">La contraseña debe tener al menos 6 caracteres.</small>
            )}
            {/* Enlace de contraseña olvidada (SOLO en Login) */}
            {enLogin && (
              <div className="forgot-password">
                <a
                  href="#recuperar"
                  onClick={(e) => {
                    e.preventDefault();
                    recuperarContrasena();
                  }}
                  aria-disabled={cargando}
                >
                  {cargando ? 'Enviando...' : '¿Has olvidado tu contraseña?'}
                </a>
              </div>
            )}
          </div>
          
          {/* Selector de tipo de cuenta (solo en registro) */}
          {!enLogin && (
            <div className="campo">
              <label>Tipo de Cuenta</label>
              <select value={rol} onChange={(e) => setRol(e.target.value)}>
                <option value="cliente">Cliente</option>
                <option value="proveedor">Proveedor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          )}
          
          {/* Botones de inicio / registro */}
          <div className="modal-btns">
            <button type="button" className="btn-cerrar" onClick={onClose} disabled={cargando}>Cancelar</button>
            <button type="submit" className="btn-login" disabled={cargando}>
              {cargando ? 'Cargando...' : (enLogin ? 'Acceder' : 'Registrarse')}
            </button>
          </div>
        </form>

        {authError && <p className="auth-error">{authError}</p>}
  {authSuccess && <p style={{ color: '#2e7d32' }}>{authSuccess}</p>}

        {/* Separador */}
        <div className="auth-divider">
          <span>O</span>
        </div>

        {/* Botón de inicio con Google */}
        <button className="btn-google" type="button" onClick={handleGoogleLogin} disabled={cargando}>
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