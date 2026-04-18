# backend/model/dao/usuario_dao.py
from firebase_admin import auth
from config.database import SessionLocal
from sqlalchemy import func, cast, String
from model.models import Usuarios, Entradas, Festivales, Alquileres, Espacios
from model.dto.usuario_dto import UsuarioDTO, AuthUserPayload, ClienteDTO, ProveedorDTO, AdminDTO

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
        rol = usuario_db.rol or 'cliente'
    
        # si es proveedor, se crea un ProveedorDTO, que contiene todos los campos del usuario, y los del servicio
        if rol == 'proveedor':
            return ProveedorDTO(
                id=str(usuario_db.id),
                nombre=usuario_db.nombre,
                apellidos=usuario_db.apellidos,
                email=usuario_db.email,
                direccion=usuario_db.direccion,
                activo=getattr(usuario_db, 'activo', True),
                rol=usuario_db.rol,
                tipo_servicio=usuario_db.tipo_servicio, 
                descripcion_servicio=usuario_db.descripcion_servicio
            )
        elif rol == 'admin': 
            return AdminDTO(
                id=str(usuario_db.id),
                nombre=usuario_db.nombre,
                apellidos=usuario_db.apellidos,
                email=usuario_db.email,
                direccion=usuario_db.direccion,
                activo=getattr(usuario_db, 'activo', True),
                rol=usuario_db.rol,
            )
        else: # cliente por defecto
            return ClienteDTO(
                id=str(usuario_db.id),
                nombre=usuario_db.nombre,
                apellidos=usuario_db.apellidos,
                email=usuario_db.email,
                direccion=usuario_db.direccion,
                activo=getattr(usuario_db, 'activo', True),
                rol=usuario_db.rol,
            )
            

    def obtener_por_email(self, email: str):
        """Devuelve el DTO del usuario con ese email, o None si no existe."""
        db = SessionLocal()
        try:
            usuario_db = db.query(Usuarios).filter(Usuarios.email == email).first()
            return self._a_dto(usuario_db) if usuario_db else None
        finally:
            db.close()

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
                        rol=rol_final,
                        activo=True,
                    )
                    db.add(usuario_db)
                else:
                    if not getattr(usuario_db, 'activo', True):
                        raise ValueError('La cuenta está desactivada')
                    usuario_db.nombre = nombre_final or usuario_db.nombre
                    usuario_db.apellidos = apellidos_final or usuario_db.apellidos
                    usuario_db.rol = rol_final or usuario_db.rol

                db.commit()
                db.refresh(usuario_db)
                return self._a_dto(usuario_db)
            finally:
                db.close()

        except ValueError:
            raise
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
                if not getattr(usuario_db, 'activo', True):
                    raise ValueError('La cuenta está desactivada')

                return self._a_dto(usuario_db)
            finally:
                db.close()

        except ValueError:
            raise
        except auth.ExpiredIdTokenError:
            raise ValueError('El token de acceso ha expirado')
        except auth.InvalidIdTokenError as e:
            raise ValueError(f'Token de autenticacion invalido: {str(e)}')
        except Exception as e:
            raise ValueError(f'Error de autenticacion: {str(e)}')
        
    def obtener_usuario(self, email: str) -> UsuarioDTO:
        db = SessionLocal()
        try:
            usuario_db = db.query(Usuarios).filter(Usuarios.email == email).first()
            if not usuario_db:
                raise ValueError('Usuario no encontrado')
            if not getattr(usuario_db, 'activo', True):
                raise ValueError('La cuenta está desactivada')

            return self._a_dto(usuario_db)
        finally:
            db.close()  
            
    def obtener_usuarios_todos(self) -> list[UsuarioDTO]:
        db = SessionLocal()
        try:
            # obtener todos los usuarios de la bd
            usuarios_db = db.query(Usuarios).all()
            # se pasan al modelo dto
            return [self._a_dto(u) for u in usuarios_db]
        finally:
            db.close()
            
    def actualizar_usuario(self, email: str, datos_nuevos: UsuarioDTO) -> UsuarioDTO:
        db = SessionLocal()
        try:
            # 1. Buscamos al usuario en la BD
            usuario_db = db.query(Usuarios).filter(Usuarios.email == email).first()
            if not usuario_db:
                raise ValueError('Usuario no encontrado')

            # 2. Actualizamos los campos básicos
            usuario_db.nombre = datos_nuevos.nombre
            usuario_db.apellidos = datos_nuevos.apellidos
            usuario_db.telefono = getattr(datos_nuevos, 'telefono', usuario_db.telefono)
            usuario_db.direccion = getattr(datos_nuevos, 'direccion', usuario_db.direccion)

            # 3. Si es proveedor, actualizamos también sus campos específicos
            if usuario_db.rol == 'proveedor' and isinstance(datos_nuevos, ProveedorDTO):
                usuario_db.tipo_servicio = datos_nuevos.tipo_servicio
                usuario_db.descripcion_servicio = datos_nuevos.descripcion_servicio

            # 4. Guardamos los cambios
            db.commit()
            db.refresh(usuario_db)
            
            # 5. Devolvemos el usuario actualizado usando nuestro método inteligente
            return self._a_dto(usuario_db)
            
        finally:
            db.close()

    def actualizar_rol_usuario(self, email: str, nuevo_rol: str) -> UsuarioDTO:
        db = SessionLocal()
        try:
            usuario_db = db.query(Usuarios).filter(Usuarios.email == email).first()
            if not usuario_db:
                raise ValueError('Usuario no encontrado')

            usuario_db.rol = self.validar_rol(nuevo_rol)
            db.commit()
            db.refresh(usuario_db)
            return self._a_dto(usuario_db)
        finally:
            db.close()

    def desactivar_usuario(self, email: str) -> UsuarioDTO:
        db = SessionLocal()
        try:
            usuario_db = db.query(Usuarios).filter(Usuarios.email == email).first()
            if not usuario_db:
                raise ValueError('Usuario no encontrado')

            usuario_db.activo = False
            db.commit()
            db.refresh(usuario_db)
            return self._a_dto(usuario_db)
        finally:
            db.close()

    def eliminar_usuario(self, email: str) -> None:
        db = SessionLocal()
        try:
            db.query(Entradas).filter(Entradas.comprador_email == email).delete(synchronize_session=False)
            db.query(Usuarios).filter(Usuarios.email == email).delete(synchronize_session=False)
            db.commit()
        finally:
            db.close()

    def obtener_estadisticas_admin(self) -> dict:
        db = SessionLocal()
        try:
            entradas_vendidas = (
                db.query(Entradas)
                .filter(Entradas.comprador_email.isnot(None))
                .filter(Entradas.comprador_email != '')
                .count()
            )

            ingresos_totales = db.query(func.coalesce(func.sum(Entradas.precio), 0)).filter(
                Entradas.comprador_email.isnot(None),
                Entradas.comprador_email != ''
            ).scalar() or 0

            proveedores_activos = db.query(Usuarios).filter(
                Usuarios.rol == 'proveedor',
                Usuarios.activo.is_(True)
            ).count()

            eventos_registrados = db.query(Festivales).count()

            return {
                'entradas_vendidas': int(entradas_vendidas),
                'ingresos_totales': float(ingresos_totales),
                'proveedores_activos': int(proveedores_activos),
                'eventos_registrados': int(eventos_registrados),
            }
        finally:
            db.close()

    def obtener_control_proveedores_admin(self) -> list[dict]:
        db = SessionLocal()
        try:
            proveedores = db.query(Usuarios).filter(
                Usuarios.rol == 'proveedor',
                Usuarios.activo.is_(True)
            ).all()

            registros_alquileres = (
                db.query(Alquileres, Espacios)
                .join(Espacios, Alquileres.espacio_id == Espacios.espacio_id, isouter=True)
                .all()
            )

            alquileres_por_proveedor = {}
            for alquiler, espacio in registros_alquileres:
                proveedor_id = str(alquiler.proveedor_id)
                alquileres_por_proveedor.setdefault(proveedor_id, []).append({
                    'evento_id': alquiler.evento_id,
                    'espacio_id': alquiler.espacio_id,
                    'espacio': espacio.ubicacion if espacio else alquiler.espacio_id,
                    'estado': alquiler.estado,
                })

            control = []
            for proveedor in proveedores:
                proveedor_id = str(proveedor.id)
                alquileres = alquileres_por_proveedor.get(proveedor_id, [])
                espacio_actual = alquileres[0]['espacio'] if alquileres else 'Sin espacio'
                control.append({
                    'id': proveedor_id,
                    'nombre': f"{proveedor.nombre or ''} {proveedor.apellidos or ''}".strip() or proveedor.email,
                    'email': proveedor.email,
                    'espacio': espacio_actual,
                    'alquileres_activos': len([a for a in alquileres if a['estado'] != 'cancelado']),
                    'estado': 'activo' if getattr(proveedor, 'activo', True) else 'inactivo',
                })

            return control
        finally:
            db.close()