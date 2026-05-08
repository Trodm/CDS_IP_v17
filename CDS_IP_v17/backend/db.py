from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

APP_DB = 'cds_ip_cases.db'


def utcnow() -> str:
    return datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')


class DatabaseManager:
    def __init__(self, base_dir: str | Path):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.db_path = self.base_dir / APP_DB
        self.conn = sqlite3.connect(str(self.db_path), check_same_thread=False, timeout=30)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute('PRAGMA journal_mode=WAL')
        self.conn.execute('PRAGMA foreign_keys=ON')
        self._init_db()

    def _init_db(self):
        cur = self.conn.cursor()
        cur.execute(
            '''CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name TEXT NOT NULL,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL
            )'''
        )
        cur.execute(
            '''CREATE TABLE IF NOT EXISTS cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                claimant_name TEXT NOT NULL,
                reference TEXT,
                attorney_name TEXT,
                assessor TEXT,
                assigned_user_id INTEGER,
                status TEXT NOT NULL DEFAULT 'Draft',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                last_exported_at TEXT,
                data_json TEXT NOT NULL,
                FOREIGN KEY(assigned_user_id) REFERENCES users(id)
            )'''
        )
        cur.execute(
            '''CREATE TABLE IF NOT EXISTS case_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id INTEGER NOT NULL,
                file_type TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_name TEXT NOT NULL,
                created_at TEXT NOT NULL,
                created_by_user_id INTEGER,
                FOREIGN KEY(case_id) REFERENCES cases(id),
                FOREIGN KEY(created_by_user_id) REFERENCES users(id)
            )'''
        )
        cur.execute(
            '''CREATE TABLE IF NOT EXISTS autosave_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id INTEGER NOT NULL,
                snapshot_at TEXT NOT NULL,
                data_json TEXT NOT NULL,
                saved_by_user_id INTEGER,
                FOREIGN KEY(case_id) REFERENCES cases(id),
                FOREIGN KEY(saved_by_user_id) REFERENCES users(id)
            )'''
        )
        self.conn.commit()
        self.ensure_default_users()

    def ensure_default_users(self):
        if self.fetch_value('SELECT COUNT(*) FROM users') == 0:
            now = utcnow()
            defaults = [
                ('Administrator', 'admin', 'admin123', 'Admin'),
                ('Industrial Psychologist 1', 'ip1', 'ip123', 'Psychologist'),
                ('Industrial Psychologist 2', 'ip2', 'ip123', 'Psychologist'),
                ('Industrial Psychologist 3', 'ip3', 'ip123', 'Psychologist'),
                ('Industrial Psychologist 4', 'ip4', 'ip123', 'Psychologist'),
                ('Industrial Psychologist 5', 'ip5', 'ip123', 'Psychologist'),
                ('Industrial Psychologist 6', 'ip6', 'ip123', 'Psychologist'),
                ('Reviewer', 'reviewer', 'review123', 'Reviewer'),
            ]
            self.conn.executemany(
                'INSERT INTO users(full_name, username, password, role, created_at) VALUES(?,?,?,?,?)',
                [(a, b, c, d, now) for a, b, c, d in defaults],
            )
            self.conn.commit()

    def fetch_value(self, query: str, params: tuple = ()):
        row = self.conn.execute(query, params).fetchone()
        return row[0] if row else None

    def authenticate(self, username: str, password: str) -> Optional[dict]:
        row = self.conn.execute(
            'SELECT * FROM users WHERE username=? AND password=? AND is_active=1',
            (username.strip(), password),
        ).fetchone()
        return dict(row) if row else None

    def list_users(self) -> List[dict]:
        rows = self.conn.execute('SELECT * FROM users WHERE is_active=1 ORDER BY full_name').fetchall()
        return [dict(r) for r in rows]

    def add_user(self, full_name: str, username: str, password: str, role: str):
        self.conn.execute(
            'INSERT INTO users(full_name, username, password, role, created_at) VALUES(?,?,?,?,?)',
            (full_name.strip(), username.strip(), password, role, utcnow()),
        )
        self.conn.commit()

    def create_case(self, meta: Dict[str, Any], data: Dict[str, Any]) -> int:
        now = utcnow()
        cur = self.conn.cursor()
        cur.execute(
            '''INSERT INTO cases(
                claimant_name, reference, attorney_name, assessor, assigned_user_id,
                status, created_at, updated_at, data_json
            ) VALUES(?,?,?,?,?,?,?,?,?)''',
            (
                meta.get('claimant_name', ''),
                meta.get('reference', ''),
                meta.get('attorney_name', ''),
                meta.get('assessor', ''),
                meta.get('assigned_user_id'),
                meta.get('status', 'Draft'),
                now,
                now,
                json.dumps(data, ensure_ascii=False),
            ),
        )
        self.conn.commit()
        return int(cur.lastrowid)

    def update_case(self, case_id: int, meta: Dict[str, Any], data: Dict[str, Any]):
        self.conn.execute(
            '''UPDATE cases SET claimant_name=?, reference=?, attorney_name=?, assessor=?,
               assigned_user_id=?, status=?, updated_at=?, data_json=? WHERE id=?''',
            (
                meta.get('claimant_name', ''),
                meta.get('reference', ''),
                meta.get('attorney_name', ''),
                meta.get('assessor', ''),
                meta.get('assigned_user_id'),
                meta.get('status', 'Draft'),
                utcnow(),
                json.dumps(data, ensure_ascii=False),
                case_id,
            ),
        )
        self.conn.commit()

    def delete_case(self, case_id: int):
        self.conn.execute('DELETE FROM case_files WHERE case_id=?', (case_id,))
        self.conn.execute('DELETE FROM autosave_snapshots WHERE case_id=?', (case_id,))
        self.conn.execute('DELETE FROM cases WHERE id=?', (case_id,))
        self.conn.commit()

    def list_cases(self, assigned_user_id: int | None = None, include_all: bool = True) -> List[dict]:
        if include_all:
            rows = self.conn.execute(
                '''SELECT c.*, u.full_name AS assigned_user_name
                   FROM cases c LEFT JOIN users u ON c.assigned_user_id = u.id
                   ORDER BY datetime(c.updated_at) DESC, c.id DESC'''
            ).fetchall()
        else:
            rows = self.conn.execute(
                '''SELECT c.*, u.full_name AS assigned_user_name
                   FROM cases c LEFT JOIN users u ON c.assigned_user_id = u.id
                   WHERE c.assigned_user_id=?
                   ORDER BY datetime(c.updated_at) DESC, c.id DESC''',
                (assigned_user_id,),
            ).fetchall()
        return [dict(r) for r in rows]

    def get_case(self, case_id: int) -> Optional[dict]:
        row = self.conn.execute(
            '''SELECT c.*, u.full_name AS assigned_user_name
               FROM cases c LEFT JOIN users u ON c.assigned_user_id=u.id
               WHERE c.id=?''',
            (case_id,),
        ).fetchone()
        if not row:
            return None
        result = dict(row)
        result['data'] = json.loads(result.get('data_json') or '{}')
        return result

    def add_file_record(self, case_id: int, file_type: str, file_path: str, created_by_user_id: int | None = None):
        p = Path(file_path)
        self.conn.execute(
            'INSERT INTO case_files(case_id, file_type, file_path, file_name, created_at, created_by_user_id) VALUES(?,?,?,?,?,?)',
            (case_id, file_type, str(p), p.name, utcnow(), created_by_user_id),
        )
        self.conn.commit()

    def list_case_files(self, case_id: int) -> List[dict]:
        rows = self.conn.execute(
            '''SELECT f.*, u.full_name AS created_by_name
               FROM case_files f LEFT JOIN users u ON f.created_by_user_id=u.id
               WHERE f.case_id=?
               ORDER BY datetime(f.created_at) DESC, f.id DESC''',
            (case_id,),
        ).fetchall()
        return [dict(r) for r in rows]

    def add_autosave_snapshot(self, case_id: int, data: Dict[str, Any], saved_by_user_id: int | None = None):
        self.conn.execute(
            'INSERT INTO autosave_snapshots(case_id, snapshot_at, data_json, saved_by_user_id) VALUES(?,?,?,?)',
            (case_id, utcnow(), json.dumps(data, ensure_ascii=False), saved_by_user_id),
        )
        self.conn.execute(
            '''DELETE FROM autosave_snapshots
               WHERE case_id=? AND id NOT IN (
                   SELECT id FROM autosave_snapshots WHERE case_id=? ORDER BY datetime(snapshot_at) DESC, id DESC LIMIT 10
               )''',
            (case_id, case_id),
        )
        self.conn.commit()

    def list_autosave_snapshots(self, case_id: int) -> List[dict]:
        rows = self.conn.execute(
            'SELECT * FROM autosave_snapshots WHERE case_id=? ORDER BY datetime(snapshot_at) DESC, id DESC LIMIT 10',
            (case_id,),
        ).fetchall()
        return [dict(r) for r in rows]
