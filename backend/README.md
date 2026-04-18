**Backend para Subsonic Festival**

Para instalar el entorno virtual:

```bash
cd backend
python -m venv .venv (en algunos caso que no funcione con python, usar python3 o py)
.\.venv\Scripts\Activate.ps1 (en PowerShell) o .\.venv\Scripts\activate.bat (en cmd)
```
Para salir del entorno virtual, simplemente ejecuta el comando `deactivate` en la terminal.


**Instalar dependencias**
```bash
pip install -r requirements.txt
```

**Ejecutar el servidor**
```bash
python main.py
```

**Poblar la base de datos con datos de inicio**
```bash
python scripts/poblar_bd.py
```