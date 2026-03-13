from fastapi import FastAPI
from controller import controller

# 1. Creamos la API aquí
app = FastAPI(title="SubsonicAPI")

# 2. Le pegamos el controlador de rutas
app.include_router(controller.router)

if __name__ == "__main__":
    import uvicorn
    # reload=True es clave para que el servidor se reinicie solo al guardar cambios
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)