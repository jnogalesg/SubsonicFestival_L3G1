import { auth } from './firebaseConfig';

const API_BASE_URL = 'http://127.0.0.1:8000';
const roles = new Set(['cliente', 'proveedor', 'admin']);

const parseBackendError = async (response) => {
  try {
    const data = await response.json();
    return data.detail || data.mensaje || 'Error al procesar la solicitud.';
  } catch {
    return 'Error al procesar la solicitud.';
  }
};

const validarRol = (rol) => {
  const rolFinal = rol || 'cliente';
  if (!roles.has(rolFinal)) {
    throw new Error('Rol invalido. Solo se permiten: cliente, proveedor, admin.');
  }
  return rolFinal;
};

const callAuthApi = async (path, body = undefined) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No hay usuario autenticado en Firebase.');
  }

  const idToken = await currentUser.getIdToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseBackendError(response));
  }

  return response.json();
};

export async function guardarRolUsuario(uid, rol, datosUsuario = {}) {
  const payload = {
    rol: validarRol(rol),
    nombre: datosUsuario.nombre || null,
    apellidos: datosUsuario.apellidos || null,
    ciudad: datosUsuario.ciudad || null,
    rutaImagen: datosUsuario.rutaImagen || null,
  };

  const data = await callAuthApi('/api/auth/register', payload);
  return data?.usuario ?? null;
}

export async function obtenerRolUsuario(uid) {
  try {
    const data = await callAuthApi('/api/auth/login');
    return data?.usuario?.rol ?? null;
  } catch (error) {
    console.error('No se pudo obtener el rol del usuario desde el backend:', error);
    return null;
  }
}

export async function obtenerUsuario() {
  const data = await callAuthApi('/api/auth/login');
  return data?.usuario ?? null;
}
