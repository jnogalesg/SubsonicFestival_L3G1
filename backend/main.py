from fastapi import FastAPI
import firebase_admin
import config.database as database
from firebase_admin import credentials
from controller import controller, tienda_controller, festival_controller, entrada_controller, usuario_controller
from config.cors_config import configurar_cors
from model.models import Base
from config.database import engine

# Inicialización de Firebase
try:
    cred = credentials.Certificate("firebase-claves.json") 
    firebase_admin.initialize_app(cred)
    print("Firebase inicializado correctamente")
except Exception as e:
    print(f"Error al iniciar Firebase: {e}")

from controller import controller, tienda_controller, festival_controller, entrada_controller, usuario_controller, espacio_controller
from config.cors_config import configurar_cors

# Creación de la aplicación FastAPI
app = FastAPI(title="SubsonicAPI")


# Aplicación de CORS (Para que el frontend pueda llamar al backend)
configurar_cors(app)

# Añadir rutas a los controladores
app.include_router(controller.router)
app.include_router(festival_controller.router)
app.include_router(tienda_controller.router)
app.include_router(espacio_controller.router)
app.include_router(entrada_controller.router)
app.include_router(usuario_controller.router)

if __name__ == "__main__":
    import uvicorn
    # reload=True es clave para que el servidor se reinicie solo al guardar cambios
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)