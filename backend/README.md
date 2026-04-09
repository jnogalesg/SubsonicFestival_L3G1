**Backend para Subsonic Festival**

Para instalar el entorno virtual:

```bash
cd backend
python -m venv .venv (en algunos caso que no funcione con python, usar python3 o py)
.\.venv\Scripts\Activate.ps1 (en PowerShell) o .\.venv\Scripts\activate.bat (en cmd)
```

Para salir del entorno virtual, simplemente ejecuta el comando `deactivate` en la terminal.

**Actualizar pip (no es obligatorio, solo si lo pide)**
```bash
python -m pip install --upgrade pip
```

**Instalar dependencias**
```bash
pip install -r requirements.txt
```

**Ejecutar el servidor**
```bash
python main.py
```

**Inicializar datos locales (seed)**
```bash
python scripts/init_db.py
```

Si quieres empezar desde cero en local (usuarios de prueba comunes para todo el equipo):
```bash
python scripts/init_db.py --reset
```