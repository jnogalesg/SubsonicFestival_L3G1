import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const USER_PROFILES_COLLECTION = 'userProfiles';

export async function guardarRolUsuario(uid, rol) {
  const perfilRef = doc(db, USER_PROFILES_COLLECTION, uid);
  await setDoc(
    perfilRef,
    {
      rol,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export async function obtenerRolUsuario(uid) {
  try {
    const perfilRef = doc(db, USER_PROFILES_COLLECTION, uid);
    const perfilSnapshot = await getDoc(perfilRef);

    if (!perfilSnapshot.exists()) {
      return null;
    }

    return perfilSnapshot.data().rol ?? null;
  } catch (error) {
    console.error('No se pudo obtener el rol del usuario en Firestore:', error);
    return null;
  }
}
