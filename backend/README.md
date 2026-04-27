# Backend de Subsonic Festival

Backend REST de **Subsonic Festival**, desarrollado con **FastAPI** y persistencia en **MySQL**. Este proyecto expone la lógica de negocio para festivales, entradas, usuarios, espacios comerciales, tienda de merchandising, favoritos y autenticación integrada con Firebase.

## ✨ Funcionalidades principales

- Gestión de festivales.
- Compra y administración de entradas.
- Gestión de usuarios por roles: cliente, proveedor y administrador.
- Alquiler y administración de espacios comerciales.
- Tienda de merchandising.
- Control de artistas favoritos.
- Verificación de autenticación mediante Firebase.
- CORS configurado para permitir la comunicación con el frontend en React.

## 🛠️ Tecnologías utilizadas

- **Python 3.10+**: lenguaje principal del backend.
- **FastAPI**: framework para construir la API REST.
- **Uvicorn**: servidor ASGI para ejecutar la aplicación.
- **MySQL**: base de datos relacional para persistencia del backend.
- **SQLAlchemy**: ORM utilizado para mapear las tablas y acceder a la BD.
- **Pydantic**: validación y serialización de datos mediante DTOs.
- **Firebase Admin SDK**: inicialización y verificación de Firebase desde el backend.
- **python-dotenv**: carga de variables de entorno desde `.env`.
- **CORS**: configuración para aceptar peticiones del frontend.

## Endpoints principales

Algunos routers incluidos en la aplicación son:

- Endpoints de festivales
- Endpoints de entradas
- Endpoints de usuarios
- Endpoints de espacios
- Endpoints de tienda
- Endpoints de artistas favoritos
- Endpoints de vídeos de YouTube (API Externa)

## 📁 Estructura general

```text
backend/                     # Carpeta principal del backend FastAPI
├── Dockerfile               # Imagen Docker del backend
|
├── config/                  # Configuraciones globales del proyecto
│   ├── cors_config.py       # Política CORS para permitir llamadas desde el frontend
│   └── database.py          # Conexión a MySQL y sesión de SQLAlchemy
├── controller/              # Endpoints y lógica de cada recurso de la API
├── model/                   # Capa de datos: ORM, DTOs, DAOs y factories
│   ├── dao/                 # Acceso a datos y consultas a la base de datos
│   ├── dto/                 # Objetos Pydantic para validar y transportar datos
│   ├── factory/             # Fábricas para instanciar los DAOs
│   └── models.py            # Definición de las tablas con SQLAlchemy
├── scripts/                 # Scripts auxiliares para tareas de inicialización
│   └── poblar_bd.py         # Inserta datos de prueba en la base de datos
├── firebase-claves.json     # Credenciales del servicio Firebase Admin
├── main.py                  # Punto de entrada de la aplicación FastAPI
└── requirements.txt         # Dependencias Python necesarias para ejecutar el backend
```

## Licencia

Proyecto académico desarrollado para la asignatura Programación en Internet.
