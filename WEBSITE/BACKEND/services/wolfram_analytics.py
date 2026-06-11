# backend/services/wolfram_analytics.py
"""
Analytics engine with clear data separation:
  SQLite: workspace events (metadata  ids, names, timestamps, durations)
  ChromaDB: NOT used here (analytics is purely temporal/statistical)

Focus Score computation:
  1. Try Wolfram Engine (wolframclient)
  2. Python fallback  always works

Wolfram Engine notes:
  - Download: https://www.wolfram.com/engine/
  - Activate with a free developer license
  - pip install wolframclient
"""
import sqlite3
import time
import datetime

DB_PATH = "./data/knemos.db"


def _init_db():
    """Create analytics tables in SQLite (metadata only)."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS workspace_events (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT,
            workspace_name TEXT,
            timestamp  INTEGER,
            duration_seconds INTEGER DEFAULT 0
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS ram_snapshots (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp   INTEGER,
            used_gb     REAL,
            percent     REAL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS focus_scores (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER,
            score     INTEGER,
            grade     TEXT,
            switches  INTEGER
        )
    """)
    conn.commit()
    conn.close()

_init_db()


def log_workspace_switch(workspace_name: str):
    """Record a workspace switch event in SQLite."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO workspace_events (event_type, workspace_name, timestamp) VALUES (?, ?, ?)",
        ('switch', workspace_name, int(time.time()))
    )
    conn.commit()
    conn.close()


def log_ram_snapshot(used_gb: float, percent: float):
    """Record a RAM snapshot for trend analysis."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO ram_snapshots (timestamp, used_gb, percent) VALUES (?, ?, ?)",
        (int(time.time()), used_gb, percent)
    )
    conn.commit()
    conn.close()


def _compute_score_python(switch_count: int, hours_active: float) -> dict:
    """Pure Python focus score computation  always available."""
    penalty = min(40, switch_count * 2)
    base = 80 if hours_active > 3 else 60
    score = max(0, base - penalty)
    grade = "A" if score >= 80 else "B" if score >= 60 else "C"
    trend = "improving" if score > 70 else "stable" if score > 50 else "declining"
    return {
        "score": score,
        "grade": grade,
        "focus_minutes": int(hours_active * 60),
        "context_switches": switch_count,
        "trend": trend
    }


def _compute_score_wolfram(switch_count: int, hours_active: float) -> dict | None:
    """
    Wolfram Engine focus score  richer analytics.
    Returns None if Wolfram Engine is not available/activated.
    """
    try:
        from wolframclient.evaluation import WolframLanguageSession
        from wolframclient.language import wl
        import wolframclient.language.expression as wlexpr

        session = WolframLanguageSession()
        session.start()

        # Wolfram formula: weighted penalty with diminishing returns
        penalty_wl = session.evaluate(
            wl.N(
                wl.Min(40,
                    wl.Times(switch_count, 2) *
                    wl.Exp(wl.Times(-0.05, switch_count))  # diminishing returns
                )
            )
        )
        session.terminate()

        penalty = float(str(penalty_wl))
        base = 85 if hours_active > 4 else 75 if hours_active > 2 else 60
        score = max(0, min(100, int(base - penalty)))
        grade = "A" if score >= 80 else "B" if score >= 60 else "C"
        trend = "improving" if score > 70 else "stable" if score > 50 else "declining"

        return {
            "score": score,
            "grade": grade,
            "focus_minutes": int(hours_active * 60),
            "context_switches": switch_count,
            "trend": trend,
            "_wolfram": True  # debug marker
        }
    except Exception as e:
        print(f"[Wolfram] Not available: {e}")
        return None


def compute_focus_score() -> dict:
    """
    Compute Cognitive Focus Score from last 24 hours of events.
    Tries Wolfram first, falls back to Python.
    """
    conn = sqlite3.connect(DB_PATH)
    events = conn.execute(
        "SELECT event_type, timestamp FROM workspace_events WHERE timestamp > ?",
        (int(time.time()) - 86400,)
    ).fetchall()
    conn.close()

    switches = [e for e in events if e[0] == 'switch']
    switch_count = len(switches)
    hours_active = min(8.0, len(events) * 0.15)

    # Try Wolfram Engine first
    wolfram_result = _compute_score_wolfram(switch_count, hours_active)
    if wolfram_result:
        return wolfram_result

    # Python fallback
    return _compute_score_python(switch_count, hours_active)


def get_heatmap() -> list[dict]:
    """
    Build a 24-hour productivity heatmap from the last 7 days.
    Stored in SQLite, computed in Python.
    """
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        "SELECT timestamp FROM workspace_events WHERE timestamp > ?",
        (int(time.time()) - 7 * 86400,)
    ).fetchall()
    conn.close()

    hourly: dict[int, int] = {h: 0 for h in range(24)}
    for (ts,) in rows:
        try:
            hour = datetime.datetime.fromtimestamp(ts).hour
            hourly[hour] = min(100, hourly[hour] + 8)
        except Exception:
            pass

    return [{"hour": h, "intensity": v} for h, v in hourly.items()]


def get_predictions() -> dict:
    """
    Simple next-workspace prediction based on recent event frequency.
    Full ML prediction can be added in v2.
    """
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute(
        """SELECT workspace_name, COUNT(*) as freq
           FROM workspace_events
           WHERE timestamp > ? AND event_type = 'switch'
           GROUP BY workspace_name
           ORDER BY freq DESC
           LIMIT 1""",
        (int(time.time()) - 86400,)
    ).fetchall()
    conn.close()

    if rows:
        name, count = rows[0]
        confidence = min(0.95, 0.5 + (count / 20))
        return {"next_workspace": name, "confidence": round(confidence, 2)}

    return {"next_workspace": "Development Hub", "confidence": 0.65}
