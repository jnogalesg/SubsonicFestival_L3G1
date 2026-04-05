# backend/model/dao/usuario_dao.py
from firebase_admin import auth
from config.database import SessionLocal
from model.models import Usuarios
from model.dto.usuario_dto import UsuarioDTO

class UsuarioDAO:
    def verificar_y_obtener_usuario(self, id_token: str) -> UsuarioDTO:
        try:
            # Verificación del Token JWT con Firebase
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            email = decoded_token.get('email', '')
            
            # acceso a la bd
            db = SessionLocal()


            try:
                # Buscamos si el usuario ya existe
                usuario_db = db.query(Usuarios).filter(Usuarios.email == email).first()

                if usuario_db:
                    # Si ya existía, usamos sus datos (por si un admin le cambió el rol)
                    id = str(usuario_db.id)
                    nombre = usuario_db.nombre
                    apellidos = usuario_db.apellidos
                    email = usuario_db.email
                    rol = usuario_db.rol
                    
                    
                else:
                    # Si NO existe, lo insertamos en la bd
                    nuevo_usuario = Usuarios(
                        nombre=nombre,
                        apellidos=apellidos,
                        email=email,
                        rol='cliente' # Por defecto le damos rol cliente
                    )
                    db.add(nuevo_usuario)
                    db.commit() # Guardamos los cambios
                    db.refresh(nuevo_usuario) # Recargamos para obtener el ID que le dio SQLite
                    
                    rol = nuevo_usuario.rol
                    id = str(nuevo_usuario.id)

                return UsuarioDTO(id=id, email=email, nombre=nombre, apellidos=apellidos, rol=rol)
            
            finally:
                db.close()
            
        except auth.ExpiredIdTokenError:
            raise ValueError("El token de acceso ha expirado")
        except auth.InvalidIdTokenError:
            raise ValueError("Token de autenticación inválido")
        except Exception as e:
            raise ValueError(f"Error de autenticación: {str(e)}")