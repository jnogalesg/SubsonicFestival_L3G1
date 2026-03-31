# backend/model/dao/usuario_dao.py
from firebase_admin import auth, firestore
from model.dto.usuario_dto import UsuarioDTO

class UsuarioDAO:
    def __init__(self):
        # Conexión a la base de datos Firestore
        self.db = firestore.client()

    def verificar_y_obtener_usuario(self, id_token: str) -> UsuarioDTO:
        try:
            # 1. Verificación del Token JWT con Firebase
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            email = decoded_token.get('email', '')
            nombre = decoded_token.get('name', 'Usuario Desconocido')

            # 2. Buscar si el usuario existe en Firestore
            user_ref = self.db.collection('usuarios').document(uid)
            user_doc = user_ref.get()

            if user_doc.exists():
                # Usuario existente: Obtenemos su rol y datos
                datos = user_doc.to_dict()
                rol = datos.get('rol', 'cliente') # Rol por defecto si no tiene
            else:
                # Nuevo usuario: Lo creamos en Firestore
                rol = 'cliente' # Asignamos 'cliente' por defecto
                user_ref.set({
                    'email': email,
                    'nombre': nombre,
                    'rol': rol
                })

            # 3. Pasamos el DTO con los datos
            return UsuarioDTO(id=uid, email=email, nombre=nombre, rol=rol)
            
        except auth.ExpiredIdTokenError:
            raise ValueError("El token de acceso ha expirado")
        except auth.InvalidIdTokenError:
            raise ValueError("Token de autenticación inválido")
        except Exception as e:
            raise ValueError(f"Error de autenticación: {str(e)}")