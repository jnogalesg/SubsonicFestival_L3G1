# Backend de Subsonic Festival

Backend REST de **Subsonic Festival**, desarrollado con **FastAPI** y persistencia en **SQLite**. Este proyecto expone la lógica de negocio para festivales, entradas, usuarios, espacios comerciales, tienda de merchandising, favoritos y autenticación integrada con Firebase.

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
- **SQLite**: base de datos local del proyecto.
- **SQLAlchemy**: ORM utilizado para mapear las tablas y acceder a la BD.
- **Pydantic**: validación y serialización de datos mediante DTOs.
- **Firebase Admin SDK**: inicialización y verificación de Firebase desde el backend.
- **python-dotenv**: carga de variables de entorno desde `.env`.
- **CORS**: configuración para aceptar peticiones del frontend.

### 📌 Requisitos previos

Antes de arrancar el backend asegúrate de tener instalado:

- **Python 3.10 o superior**.
- **pip**.
- **Git** si vas a clonar el repositorio.

### ⚠️ Nota importante para la corrección (Variables de Entorno y Firebase)

Por motivos de seguridad, los archivos de credenciales de Firebase y variables de entorno **no están incluidos en este repositorio**. 

Para poder ejecutar el backend y probar la autenticación, necesitas los archivos originales. 
Junto con la entrega en el Campus Virtual, se ha adjuntado un archivo `.zip` que contiene:
1. La documentación completa del proyecto (`L3-G1_Entrega 03.pdf`)
2. El archivo `.env`
3. El archivo `firebase-claves.json`

**Instrucciones:**
Por favor, coloca ambos archivos en la raíz de la carpeta `/backend` antes de ejecutar `python main.py`. Tienes los archivos `.example` en la carpeta como referencia de la estructura esperada.

## Instalación y ejecución local

### 1. Entrar en la carpeta del backend

```bash
cd backend
```

### 2. Crear y activar el entorno virtual

```bash
python -m venv .venv
```

En **PowerShell**:

```powershell
.\.venv\Scripts\Activate.ps1
```

En **CMD**:

```cmd
.\.venv\Scripts\activate.bat
```

En **Mac/Linux**:

```bash
source .venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Poblar la base de datos inicial

Este paso carga datos de ejemplo para festivales, usuarios, espacios y otros elementos del proyecto.

```bash
python scripts/poblar_bd.py
```

Se incluye una lista de usuarios y festivales de prueba con datos precargados para probar sus funcionalidades:
- **Usuarios**:
  - Cliente: `cliente@subsonic.com` / `123456`
  - Proveedor: `proveedor@subsonic.com` / `123456`
  - Administrador: `admin@subsonic.com` / `123456`

### 5. Ejecutar el servidor

```bash
python main.py
```

El backend quedará disponible en:

- **API**: http://127.0.0.1:8000
- **Documentación automática**: http://127.0.0.1:8000/docs

Para salir del entorno virtual:

```bash
deactivate
```

## Notas importantes

- La base de datos se crea automáticamente en `subsonic.db` al arrancar la aplicación.
- El proyecto inicializa Firebase usando `firebase-claves.json`.
- `main.py` carga también un archivo `.env` si existe en la carpeta del backend.
- Se utiliza la API externa **Youtube Data API** para obtener vídeos relacionados con los festivales. Si diese un error por falta de token, acceder al archivo `.env` cambiar el token por la que está comentada y volver a arrancar el servidor.
- CORS está habilitado para permitir peticiones desde el frontend de React.

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
├── config/                  # Configuraciones globales del proyecto
│   ├── cors_config.py       # Política CORS para permitir llamadas desde el frontend
│   └── database.py          # Conexión a SQLite y sesión de SQLAlchemy
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
