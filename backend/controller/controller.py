from fastapi import APIRouter

# Creamos un router (es como un mini-FastAPI)
router = APIRouter()

# Nuestro primer endpoint de prueba
@router.get("/")
def prueba_conexion():
    return {"mensaje": "¡El backend de Subsonic funciona correctamente!"}