from fastapi import FastAPI
from controller import controller
from controller import tienda_controller

# 1. Creamos la API aquí
app = FastAPI(title="SubsonicAPI")

# 2. Le pegamos el controlador de rutas
app.include_router(controller.router)

# 3. Le pegamos TU controlador de la tienda <-- 2. Añade esta línea
app.include_router(tienda_controller.router)


if __name__ == "__main__":
    import uvicorn
    # reload=True es clave para que el servidor se reinicie solo al guardar cambios
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)