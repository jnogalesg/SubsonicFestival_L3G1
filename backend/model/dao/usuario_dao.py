# backend/model/dao/usuario_dao.py
from firebase_admin import auth
from config.database import SessionLocal
from model.models import Usuarios
from model.dto.usuario_dto import UsuarioDTO, AuthUserPayload

class UsuarioDAO:
    roles = {'cliente', 'proveedor', 'admin'}

    @staticmethod
    def _texto_o_vacio(valor: str | None) -> str:
        return (valor or '').strip()

    @staticmethod
    def validar_rol(rol: str | None) -> str:
        if not rol:
            return 'cliente'

        if rol not in UsuarioDAO.roles:
            raise ValueError("Rol invalido. Solo se permiten: cliente, proveedor, admin")

        return rol

    @staticmethod
    def _a_dto(usuario_db: Usuarios) -> UsuarioDTO:
        return UsuarioDTO(
            id=str(usuario_db.id),
            nombre=usuario_db.nombre,
            apellidos=usuario_db.apellidos,
            email=usuario_db.email,
            ciudad=usuario_db.ciudad,
            rol=usuario_db.rol or 'cliente'
        )

    def registrar_usuario(self, id_token: str, payload: AuthUserPayload) -> UsuarioDTO:
        try:
            # se saca el email del token de Firebase para obtener el correo asociado
            decoded_token = auth.verify_id_token(id_token)
            email = decoded_token.get('email', '')
            display_name = decoded_token.get('name', '')

            if not email:
                raise ValueError('No se pudo obtener el email del token de Firebase')

            nombre_final = self._texto_o_vacio(payload.nombre) or self._texto_o_vacio(display_name)
            apellidos_final = self._texto_o_vacio(payload.apellidos)
            rol_final = self.validar_rol(payload.rol)

            db = SessionLocal()
            try:
                usuario_db = db.query(Usuarios).filter(Usuarios.email == email).first()
                if not usuario_db:
                    usuario_db = Usuarios(
                        nombre=nombre_final,
                        apellidos=apellidos_final,
                        email=email,
                        rol=rol_final
                    )
                    db.add(usuario_db)
                else:
                    usuario_db.nombre = nombre_final or usuario_db.nombre
                    usuario_db.apellidos = apellidos_final or usuario_db.apellidos
                    usuario_db.rol = rol_final or usuario_db.rol

                db.commit()
                db.refresh(usuario_db)
                return self._a_dto(usuario_db)
            finally:
                db.close()

        except auth.ExpiredIdTokenError:
            raise ValueError('El token de acceso ha expirado')
        except auth.InvalidIdTokenError as e:
            raise ValueError(f'Token de autenticacion invalido: {str(e)}')
        except Exception as e:
            raise ValueError(f'Error de autenticacion: {str(e)}')

    def login_usuario(self, idtoken: str) -> UsuarioDTO:
        try:
            # se saca el email del token de Firebase para obtener el correo asociado
            decoded_token = auth.verify_id_token(idtoken)
            email = decoded_token.get('email', '')

            if not email:
                raise ValueError('No se pudo obtener el email del token de Firebase')

            db = SessionLocal()
            try:
                # el usuario debe existir en la bd local
                usuario_db = db.query(Usuarios).filter(Usuarios.email == email).first()
                if not usuario_db:
                    raise ValueError('Usuario no registrado en la base de datos local')

                return self._a_dto(usuario_db)
            finally:
                db.close()

        except auth.ExpiredIdTokenError:
            raise ValueError('El token de acceso ha expirado')
        except auth.InvalidIdTokenError as e:
            raise ValueError(f'Token de autenticacion invalido: {str(e)}')
        except Exception as e:
            raise ValueError(f'Error de autenticacion: {str(e)}')