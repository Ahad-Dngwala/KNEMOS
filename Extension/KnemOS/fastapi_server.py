from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="KnemOS Local Core")

class PagePayload(BaseModel):
    type:str
    url:str|None=None
    title:str|None=None
    text:str|None=None

@app.post("/ingest")
async def ingest(payload: PagePayload):
    return {"status":"received","title":payload.title}

# Future pipeline:
# sentence-transformers/all-MiniLM-L6-v2
# HDBSCAN clustering
# Ollama + Mistral labeling
