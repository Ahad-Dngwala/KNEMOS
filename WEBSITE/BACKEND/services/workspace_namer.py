# backend/services/workspace_namer.py
"""
Workspace naming via Ollama (Qwen2.5) with:
  1. Try Qwen2.5:7b  3s timeout
  2. Try Qwen2.5:3b  3s timeout (lighter fallback)
  3. Keyword heuristic fallback  never blocks

This ensures the demo never freezes even without Ollama.
"""
import requests
import os
import re

OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
GENERATE_URL = f"{OLLAMA_URL}/api/generate"

# Model priority order  heavier first, lighter fallback
MODEL_PRIORITY = [
    os.getenv("OLLAMA_LLM_MODEL", "qwen2.5:7b"),
    "qwen2.5:3b",
]

# Known domain  category keywords for fallback heuristic
DOMAIN_HINTS = {
    "github": "Dev",
    "stackoverflow": "Dev",
    "vscode": "Dev",
    "code": "Dev",
    "terminal": "Dev",
    "postman": "Dev",
    "figma": "Design",
    "canva": "Design",
    "photoshop": "Design",
    "notion": "Notes",
    "obsidian": "Notes",
    "docs.google": "Docs",
    "gmail": "Email",
    "outlook": "Email",
    "slack": "Chat",
    "discord": "Chat",
    "youtube": "Media",
    "spotify": "Media",
    "netflix": "Media",
    "twitter": "Social",
    "reddit": "Research",
    "wikipedia": "Research",
    "arxiv": "Research",
}


def _try_ollama(model: str, prompt: str, timeout: float = 3.0) -> str | None:
    """Attempt to name via Ollama. Returns None on timeout/error."""
    try:
        r = requests.post(
            GENERATE_URL,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.2, "num_predict": 12}
            },
            timeout=timeout
        )
        if r.status_code != 200:
            return None
        name = r.json().get("response", "").strip().strip('"\'').strip()
        # Validate: must be non-empty, 6 words
        words = name.split()
        if 1 <= len(words) <= 6:
            return name
        return None
    except Exception:
        return None


def _heuristic_fallback(titles: list[str]) -> str:
    """
    Pure-Python fallback. Never fails, never blocks.
    Uses DOMAIN_HINTS + title keyword analysis.
    """
    category_votes: dict[str, int] = {}

    for title in titles[:10]:
        lower = title.lower()
        for keyword, category in DOMAIN_HINTS.items():
            if keyword in lower:
                category_votes[category] = category_votes.get(category, 0) + 1

    if category_votes:
        top_category = max(category_votes, key=category_votes.get)
        # Extract a meaningful word from titles
        for title in titles:
            words = [
                w for w in re.split(r'[\s\-_|]+', title)
                if len(w) > 3
                and not w.lower().startswith('http')
                and w[0].isupper()
            ]
            if words:
                return f"{words[0]} {top_category}"
        return f"{top_category} Workspace"

    # Generic fallback: extract first long capitalized word
    for title in titles:
        words = [w for w in title.split() if len(w) > 4]
        if words:
            return f"{words[0]} Workspace"

    return "Mixed Workspace"


def name_cluster(titles: list[str]) -> str:
    """
    Generate workspace name. Priority:
      1. Qwen2.5:7b (3s timeout)
      2. Qwen2.5:3b (3s timeout)
      3. Keyword heuristic (instant)
    """
    if not titles:
        return "Empty Workspace"

    sample = titles[:8]
    prompt = (
        "Given these open windows/tabs:\n" +
        "\n".join(f"- {t}" for t in sample) +
        "\n\nGenerate a concise workspace name (2-4 words). "
        "Examples: 'VendorBridge Dev', 'Research Hub', 'Design Sprint', 'Email & Comms'.\n"
        "Respond with ONLY the workspace name, no quotes, no explanation."
    )

    for model in MODEL_PRIORITY:
        result = _try_ollama(model, prompt, timeout=5.0)
        if result:
            print(f"[Namer] Named via {model}: '{result}'")
            return result

    # Final fallback
    name = _heuristic_fallback(titles)
    print(f"[Namer] Heuristic fallback: '{name}'")
    return name
