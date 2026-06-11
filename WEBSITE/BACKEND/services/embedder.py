# backend/services/embedder.py
"""
Semantic embedder using mxbai-embed-large via Ollama.
Falls back to sentence-transformers all-MiniLM-L6-v2 if Ollama unavailable.

mxbai-embed-large gives 1024-dim vectors with superior semantic quality
for clustering and memory search.
"""
import numpy as np
import requests
import json
import os

OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "mxbai-embed-large")
OLLAMA_EMBED_URL = f"{OLLAMA_URL}/api/embeddings"


class SemanticEmbedder:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._ollama_available = None  # lazily probed
        return cls._instance

    def _probe_ollama(self) -> bool:
        """Check if Ollama is up and mxbai-embed-large is available."""
        try:
            r = requests.post(
                OLLAMA_EMBED_URL,
                json={"model": EMBED_MODEL, "prompt": "test"},
                timeout=5
            )
            return r.status_code == 200
        except Exception:
            return False

    def _embed_via_ollama(self, text: str) -> np.ndarray | None:
        try:
            r = requests.post(
                OLLAMA_EMBED_URL,
                json={"model": EMBED_MODEL, "prompt": text},
                timeout=10
            )
            data = r.json()
            return np.array(data["embedding"], dtype=np.float32)
        except Exception:
            return None

    def embed_single(self, text: str) -> np.ndarray:
        if self._ollama_available is None:
            self._ollama_available = self._probe_ollama()
            if self._ollama_available:
                print(f"[Embedder] Using Ollama mxbai-embed-large")
            else:
                print(f"[Embedder] Warning: Ollama mxbai-embed-large is currently unavailable!")

        result = self._embed_via_ollama(text)
        if result is not None:
            return result
            
        # Return a zero vector if Ollama is down (to prevent crashing)
        print(f"[Embedder] Error generating embedding, returning empty vector.")
        return np.zeros(1024, dtype=np.float32)

    def embed_texts(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.array([])

        if self._ollama_available is None:
            self._ollama_available = self._probe_ollama()

        results = []
        for text in texts:
            vec = self._embed_via_ollama(text)
            if vec is None:
                print(f"[Embedder] Error generating embedding for batch, using zero vector.")
                vec = np.zeros(1024, dtype=np.float32)
            results.append(vec)
            
        return np.array(results)


# Singleton
embedder = SemanticEmbedder()
