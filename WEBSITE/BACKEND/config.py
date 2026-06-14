import sys
import os
from pathlib import Path

if getattr(sys, 'frozen', False):
    # If packaged by PyInstaller, use APPDATA for writable storage
    app_data = os.getenv('APPDATA')
    if app_data:
        BACKEND_DIR = Path(app_data) / "KNEMOS"
    else:
        BACKEND_DIR = Path.home() / ".knemos"
else:
    # If running locally, use the repository BACKEND folder
    BACKEND_DIR = Path(__file__).resolve().parent

DATA_DIR = BACKEND_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = str(DATA_DIR / "knemos.db")
CHROMA_PATH = str(DATA_DIR / "chromadb")
