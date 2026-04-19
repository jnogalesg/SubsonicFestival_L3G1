from fastapi import APIRouter

# Creamos un router general
router = APIRouter(tags=["General"])

# Nuestro primer endpoint de prueba
@router.get("/")
def prueba_conexion():
    return {"mensaje": "¡El backend de Subsonic funciona correctamente!"}