import importlib.util
from contextlib import closing
from pathlib import Path
import sqlite3
import sys
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import patch


class FocusScoreEventsTest(unittest.TestCase):
    def setUp(self):
        temporary = TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.db = Path(temporary.name) / "test.db"
        path = Path(__file__).parents[1] / "services" / "wolfram_analytics.py"
        spec = importlib.util.spec_from_file_location("focus_score_under_test", path)
        self.score = importlib.util.module_from_spec(spec)
        with patch.dict(sys.modules, {"config": SimpleNamespace(DB_PATH=str(self.db))}):
            spec.loader.exec_module(self.score)
        engine = patch.object(self.score, "_compute_score_wolfram", return_value=None)
        self.wolfram = engine.start()
        self.addCleanup(engine.stop)

    def test_recent_activations_and_workspace_switches_reach_both_scoring_paths(self):
        now = 100000
        with closing(sqlite3.connect(self.db)) as conn, conn:
            conn.execute("CREATE TABLE activity_log (event_type TEXT, timestamp INTEGER)")
            conn.executemany("INSERT INTO activity_log VALUES (?, ?)", [
                ("focus_activate", now - 1),
                ("focus_activate", now - 86401),
                ("focus_deactivate", now - 1),
            ])
            conn.execute("INSERT INTO workspace_events (event_type, timestamp) VALUES (?, ?)",
                         ("switch", now - 2))
        with patch.object(self.score.time, "time", return_value=now):
            result = self.score.compute_focus_score()
        self.assertCountEqual(
            self.wolfram.call_args.args[0], [("switch", now - 2), ("focus_activate", now - 1)]
        )
        self.assertEqual(result["score"], 60)
        self.assertEqual(result["context_switches"], 1)

    def test_focus_score_remains_available_without_an_activity_log(self):
        result = self.score.compute_focus_score()
        self.assertEqual(result["score"], 50)
        self.assertEqual(result["focus_minutes"], 0)
