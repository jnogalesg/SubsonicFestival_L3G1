# backend/config/cors_config.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def configurar_cors(app: FastAPI):
    """
    Configura las políticas de seguridad CORS para permitir
    que el frontend (React) se comunique con este backend.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    