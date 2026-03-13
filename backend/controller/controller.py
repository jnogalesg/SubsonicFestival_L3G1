from fastapi import APIRouter

# Creamos un router (es como un mini-FastAPI)
router = APIRouter()

# Nuestro primer endpoint de prueba
@router.get("/")
def prueba_conexion():
    return {"mensaje": "¡El backend de Subsonic funciona correctamente!"}

@router.get("/api/eventos")
def get_eventos_prueba():
    return {"status": "success", "data": "Aquí irán los eventos de la base de datos"}