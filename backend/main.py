from fastapi import FastAPI
from controller import controller
from controller import tienda_controller
from controller import festival_controller
from controller import entrada_controller

# Creación de la aplicación FastAPI
app = FastAPI(title="SubsonicAPI")

# Añadir rutas a los controladores
app.include_router(controller.router)
app.include_router(festival_controller.router)
app.include_router(tienda_controller.router)
# app.include_router(entrada_controller.router)

if __name__ == "__main__":
    import uvicorn
    # reload=True es clave para que el servidor se reinicie solo al guardar cambios
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)