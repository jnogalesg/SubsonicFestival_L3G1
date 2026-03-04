# 🎵 Subsonic Festival - L3G1

![React](https://img.shields.io/badge/react_18-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![FontAwesome](https://img.shields.io/badge/Font_Awesome-339AF0?style=for-the-badge&logo=fontawesome&logoColor=white)

Bienvenido al repositorio frontend de **Subsonic Festival**, una plataforma web para la gestión y compra de entradas de un festival de música electrónica a nivel global.

Proyecto de la asignatura Programación en Internet en el sexto semestre de *Ingeniería del Software en la Universidad de Extremadura, curso 2025 - 2026.*

Este proyecto consiste en una **Single Page Application (SPA)** moderna utilizando **React** y **Vite**.

---

## ✨ Características Principales

La aplicación ha sido diseñada para soportar cuatro perfiles de usuario interactivos:

* 👤 **Visitante:** Exploración de festivales, catálogo de merchandising, visualización de artistas y consulta del calendario.
* 🎫 **Cliente:** Compra de pases (entradas), reproductor de música integrado y gestión del perfil personal.
* 🏪 **Proveedor:** Alquiler de espacios comerciales, control de inventario y personalización de la tienda.
* ⚙️ **Administrador:** Dashboard avanzado de administración, estadísticas en tiempo real, creación de eventos y moderación de usuarios.

---

## 🛠️ Tecnologías Utilizadas

- **React 18**: Librería principal para la construcción de la interfaz de usuario (UI).
- **JavaScript (ES6+)**: Lenguaje base para toda la lógica de la aplicación, manejo de estado y rutas.
- **Vite**: Entorno de desarrollo ultrarrápido y empaquetador del proyecto.
- **React Router DOM**: Gestión de rutas para la navegación Single Page Application (SPA).
- **CSS3**: Estilos modulares y globales usando Flexbox y CSS Grid.
- **FontAwesome**: Sistema de iconografía vectorial para la interfaz.

---
## 🚀 Instalación y Despliegue Local

### Requisitos Previos

Antes de ejecutar este proyecto, asegúrate de tener instalado en tu sistema lo siguiente:

* **[Node.js](https://nodejs.org/)** (Recomendado versión LTS): Entorno de ejecución necesario para instalar paquetes y correr el servidor de desarrollo. Al instalar Node.js, también se instalará automáticamente **npm** (Node Package Manager).
* **[Git](https://git-scm.com/)**: Para poder clonar el repositorio en tu equipo.

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/jnogalesg/SubsonicFestival_L3G1
cd subsonicfestival_l3g1
cd subsonicFestival

# Instalar las dependencias (solo la primera vez)
npm install

# Arrancar el servidor de desarrollo
npm run dev
```

Se puede acceder a la aplicación a través de **http://localhost:5173**

<!-- * **NOTA:** En esta fase (Práctica 02), la plataforma no está conectada a un back-end real. Los datos (usuarios, eventos, entradas) se sirven de manera dinámica a través de un estado simulado en memoria (src/app/data/mockData.ts) cumpliendo con el objetivo de demostrar la interacción de las vistas y el flujo de navegación. -->


---

## 📂 Estructura del Proyecto

La arquitectura del proyecto sigue el estándar de "Co-location" (cada componente vive junto a sus estilos):

```text
subsonicFestival/
├── public/                # Assets públicos (iconos, etc.)
├── src/
│   ├── assets/            # Imágenes y recursos del bundle
│   ├── components/        # Componentes reutilizables
│   ├── pages/             # Vistas de la aplicación (Rutas)
│   ├── App.jsx            # Configuración de rutas principales
│   ├── main.jsx           # Punto de entrada de React
│   └── main.css           # Estilos globales y variables
├── index.html             # Esqueleto HTML principal
└── package.json           # Dependencias y scripts
```