# 🎵 Subsonic Festival - L3G1

![React](https://img.shields.io/badge/react_19-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![FontAwesome](https://img.shields.io/badge/Font_Awesome-339AF0?style=for-the-badge&logo=fontawesome&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-000000?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-009688?style=for-the-badge&logo=pydantic&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-FF4088?style=for-the-badge&logo=uvicorn&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%2320232a.svg?style=for-the-badge&logo=docker&logoColor=white)

> Proyecto de la asignatura Programación en Internet en el sexto semestre de *Ingeniería del Software en la Universidad de Extremadura, curso 2025 - 2026.*

Bienvenido al repositorio de **Subsonic Festival**, una plataforma web Full Stack para la gestión integral de un festival de música electrónica a nivel global.

**Incluye** venta de entradas, tienda de merchandising, perfiles de usuario (Cliente, Proveedor, Administrador), alquiler de espacios comerciales y gestión de artistas favoritos, con un panel de administración en tiempo real.

Este proyecto consiste en una **Single Page Application (SPA)** moderna utilizando **React** y **Vite** en el frontend, y una API RESTful construida con **FastAPI** en el backend, con autenticación gestionada por **Firebase Authentication**.

---

## ✨ Características Principales

La aplicación ha sido diseñada para soportar cuatro perfiles de usuario interactivos:

* 👤 **Visitante:** Exploración de festivales, catálogo de merchandising, visualización de artistas y consulta del calendario.
* 🎫 **Cliente:** Compra de entradas y merchandising y gestión del perfil personal (datos personales, gestión de entradas y artistas favoritos).
* 🏪 **Proveedor:** Alquiler de espacios en festivales, gestión de alquileres, historial de eventos, gestión de cuenta (gestión de datos personales y de servicio, desactivar o eliminar la cuenta).
* ⚙️ **Administrador:** Dashboard avanzado de administración, estadísticas en tiempo real, creación y gestión de eventos, creación y gestión de espacios y moderación de usuarios y proveedores.

---

## 🛠️ Tecnologías Utilizadas

- **React 19**: Librería principal para la construcción de la interfaz de usuario (UI).
- **JavaScript (ES6+)**: Lenguaje base para toda la lógica de la aplicación, manejo de estado y rutas.
- **Vite**: Entorno de desarrollo ultrarrápido y empaquetador del proyecto.
- **React Router DOM**: Gestión de rutas para la navegación Single Page Application (SPA).
- **CSS3**: Estilos modulares y globales usando Flexbox y CSS Grid.
- **FontAwesome**: Sistema de iconografía vectorial para la interfaz.
- **React QR Code**: Generación de códigos QR para las entradas.
- **Firebase Authentication**: Sistema de autenticación seguro con soporte para Google Sign-In.
- **Firebase Admin SDK**: Verificación de tokens y gestión de autenticación desde el backend.
- **FastAPI**: Framework backend para la creación de una API RESTful eficiente y escalable.
- **Python**: Lenguaje base del backend.
- **SQLAlchemy**: ORM utilizado para el acceso y gestión de la base de datos.
- **Pydantic**: Validación y serialización de datos mediante DTOs.
- **Uvicorn**: Servidor ASGI para ejecutar la API de FastAPI.
- **SQLite**: Base de datos ligera utilizada para el almacenamiento local del proyecto.
- **Docker**: Contenerización de la aplicación para facilitar su despliegue y ejecución en cualquier entorno.

---
## 🚀 Instalación y Despliegue Local

### 📌 Requisitos Previos

Antes de ejecutar este proyecto, asegúrate de tener instalado en tu sistema lo siguiente:

* **[Node.js](https://nodejs.org/)** (Recomendado versión LTS): Entorno de ejecución necesario para instalar paquetes y correr el servidor de desarrollo frontend. Al instalar Node.js, también se instalará automáticamente **npm** (Node Package Manager).
* **[Python 3.10+](https://www.python.org/)**: Para el servidor backend y la base de datos.
* **[Git](https://git-scm.com/)**: Para poder clonar el repositorio en tu equipo.

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/jnogalesg/SubsonicFestival_L3G1
cd subsonicfestival_l3g1

# Navegar al directorio con los archivos docker
cd docker
# Arrancar docker-compose para el despliegue local de la aplicación 
docker-compose up --build
```

---

## 📂 Arquitectura del Proyecto

La arquitectura del proyecto está dividida en **dos bloques independientes** (Frontend y Backend).

* **El FrontEnd** sigue una estructura modular basada en componentes, con una clara separación entre vistas (pages) y componentes reutilizables.
* **El BackEnd** está organizado siguiendo los patrones de diseño MVC, DAO, DTO y Factory para una mejor organización y escalabilidad:

```text
SubsonicFestival_L3G1/
├── docker-compose.yml             # Orquestación de servicios backend y frontend
|
├── backend/                       # BACKEND FASTAPI (PYTHON)
│   ├── Dockerfile                 # Imagen Docker del backend
│   ├── config/                    # Configuraciones generales
│   │   ├── cors_config.py         # Configuración de políticas CORS
│   │   └── database.py            # Conexión principal a SQLite (SQLAlchemy)
│   ├── controller/                # Endpoints y Rutas de la API (Endpoints)                  
│   ├── model/                     # Base de Datos y Transferencia
│   │   ├── dao/                   # Lógica de persistencia (Consultas BD)
│   │   ├── dto/                   # Objetos de Transferencia de Datos (Validación Pydantic)
│   │   ├── factory/               # Factory Method para inyección de DAOs
│   │   └── models.py              # Definición de Tablas SQLAlchemy (ORM)
│   ├── scripts/                   # Scripts de inicialización
│   │   └── poblar_bd.py           # Script para crear y rellenar tablas iniciales
│   ├── main.py                    # Punto de entrada de FastAPI
│   └── README.md                  # Documentación del backend
│
├── subsonicFestival/              # FRONTEND REACT (JAVASCRIPT)
│   ├── Dockerfile                 # Imagen Docker del frontend
│   ├── public/                    # Assets estáticos directos e imágenes
│   ├── src/
│   │   ├── assets/                # Imágenes y recursos del bundle (vite)
│   │   ├── components/            # Componentes UI reutilizables (Co-location con CSS)    
│   │   ├── data/                  # Datos estáticos temporales (mock data)
│   │   ├── firebase/              # Configuración y servicios de Autenticación
│   │   │   ├── firebaseConfig.js  # Conexión principal con Google Firebase
│   │   │   └── userRoleService.js # Puente de peticiones FETCH al Backend
│   │   ├── pages/                 # Vistas principales de la aplicación (Rutas)
│   │   ├── App.jsx                # Router principal de React
│   │   ├── main.jsx               # Punto de entrada de React
│   │   └── main.css               # Estilos globales y paleta de colores
│   ├── index.html                 # Esqueleto HTML principal
│   └── package.json               # Dependencias de npm y scripts
│
└── README.md                      # Documentación del proyecto
```