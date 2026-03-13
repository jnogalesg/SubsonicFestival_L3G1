**Backend para Subsonic Festival**

Para instalar el entorno virtual:

```bash
cd backend
python -m venv .venv (en algunos caso que no funcione con python, usar python3 o py)
.venv\Scripts\activate.bat (cmd) (o .\.venv\Scripts\Activate.ps1 en PowerShell)
```

Para salir del entorno virtual, simplemente ejecuta el comando `deactivate` en la terminal.

**Actualizar pip**
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