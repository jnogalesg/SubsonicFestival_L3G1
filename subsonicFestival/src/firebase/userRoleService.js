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

const callAuthApi = async (path, body = undefined, firebaseUser = null, method = 'POST') => {
  const currentUser = firebaseUser || auth.currentUser;
  if (!currentUser) {
    throw new Error('No hay usuario autenticado en Firebase.');
  }

  const requestWithToken = async (idToken) => {
    const headers = {
      Authorization: `Bearer ${idToken}`,
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let response = await requestWithToken(await currentUser.getIdToken());

  // Reintento único cuando el backend devuelve 401 por token no válido.
  if (response.status === 401) {
    response = await requestWithToken(await currentUser.getIdToken(true));
  }

  if (!response.ok) {
    throw new Error(await parseBackendError(response));
  }

  return response.json();
};

export async function guardarRolUsuario(uid, rol, datosUsuario = {}, firebaseUser = null) {
  const payload = {
    rol: validarRol(rol),
    nombre: datosUsuario.nombre || null,
    apellidos: datosUsuario.apellidos || null,
  };

  const data = await callAuthApi('/api/auth/register', payload, firebaseUser, 'POST');
  return data?.usuario ?? null;
}

export async function obtenerRolUsuario(uid, firebaseUser = null) {
  try {
    const data = await callAuthApi('/api/auth/login', undefined, firebaseUser, 'GET');
    return data?.usuario?.rol ?? null;
  } catch (error) {
    console.error('No se pudo obtener el rol del usuario desde el backend:', error);
    return null;
  }
}

export async function obtenerUsuario(firebaseUser = null) {
  const data = await callAuthApi('/api/auth/login', undefined, firebaseUser, 'GET');
  return data?.usuario ?? null;
}

export async function obtenerPerfilCompleto() {
  try {
    // llama al endpoint del backend de usuario
    const data = await callAuthApi('/api/auth/perfil', undefined, null, 'GET');
    
    // devuelve todos los datos del usuario
    return data; 
  } catch (error) {
    console.error('Error al obtener el perfil completo:', error);
    throw error;
  }
}

export async function actualizarPerfilUsuario(datosActualizados) {
  try {
    // Llamamos al endpoint PUT que creamos en FastAPI
    return await callAuthApi('/api/auth/perfil', datosActualizados, null, 'PUT');
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    throw error;
  }
}

export async function desactivarCuentaUsuario() {
  try {
    return await callAuthApi('/api/auth/cuenta/desactivar', undefined, null, 'POST');
  } catch (error) {
    console.error('Error al desactivar la cuenta:', error);
    throw error;
  }
}

export async function eliminarCuentaUsuario() {
  try {
    return await callAuthApi('/api/auth/cuenta', undefined, null, 'DELETE');
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error);
    throw error;
  }
}

export async function obtenerTodosUsuarios() {
  try {
    const data = await callAuthApi('/api/auth/usuarios', undefined, null, 'GET');
    return data; 
  } catch (error) {
    console.error('Error al obtener la lista de usuarios:', error);
    throw error;
  }
}
