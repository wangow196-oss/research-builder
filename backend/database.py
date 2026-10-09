"""SQLite 数据库 — 持久化存储文件信息和分析缓存"""

import sqlite3
import json
import os
from datetime import datetime
from config import DB_PATH


def get_db() -> sqlite3.Connection:
    """获取数据库连接"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """初始化数据库表"""
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS files (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            size INTEGER DEFAULT 0,
            path TEXT,
            uploaded_at TEXT,
            publish_date TEXT,
            parsed INTEGER DEFAULT 0,
            folder_id TEXT
        );

        CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            icon TEXT DEFAULT '📁',
            expanded INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS folder_files (
            folder_id TEXT NOT NULL,
            file_id TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            PRIMARY KEY (folder_id, file_id)
        );

        CREATE TABLE IF NOT EXISTS analysis_cache (
            file_id TEXT PRIMARY KEY,
            result_json TEXT,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS parse_cache (
            file_id TEXT PRIMARY KEY,
            markdown TEXT,
            created_at TEXT
        );
    """)

    # 插入默认文件夹（如果不存在）
    defaults = [
        ("gold", "黄金研究", "🥇"),
        ("baijiu", "白酒行业", "🍷"),
        ("cpo", "CPO 光模块", "💡"),
    ]
    for fid, name, icon in defaults:
        conn.execute(
            "INSERT OR IGNORE INTO folders (id, name, icon) VALUES (?, ?, ?)",
            (fid, name, icon),
        )

    conn.commit()
    conn.close()


# ==================== 文件操作 ====================


def db_insert_file(file_id: str, name: str, size: int, path: str,
                   publish_date: str | None = None, folder_id: str | None = None):
    """插入文件记录"""
    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO files (id, name, size, path, uploaded_at, publish_date, folder_id) VALUES (?,?,?,?,?,?,?)",
        (file_id, name, size, path, datetime.now().isoformat(), publish_date, folder_id),
    )
    conn.commit()
    conn.close()


def db_get_file(file_id: str) -> dict | None:
    """获取文件信息"""
    conn = get_db()
    row = conn.execute("SELECT * FROM files WHERE id = ?", (file_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def db_list_files(folder_id: str | None = None) -> list[dict]:
    """列出文件"""
    conn = get_db()
    if folder_id:
        rows = conn.execute(
            "SELECT f.* FROM files f JOIN folder_files ff ON f.id = ff.file_id WHERE ff.folder_id = ? ORDER BY ff.sort_order",
            (folder_id,),
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM files ORDER BY uploaded_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def db_delete_file(file_id: str):
    """删除文件记录"""
    conn = get_db()
    conn.execute("DELETE FROM files WHERE id = ?", (file_id,))
    conn.execute("DELETE FROM folder_files WHERE file_id = ?", (file_id,))
    conn.execute("DELETE FROM analysis_cache WHERE file_id = ?", (file_id,))
    conn.execute("DELETE FROM parse_cache WHERE file_id = ?", (file_id,))
    conn.commit()
    conn.close()


# ==================== 文件夹操作 ====================


def db_list_folders() -> list[dict]:
    """列出所有文件夹"""
    conn = get_db()
    rows = conn.execute("SELECT * FROM folders").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def db_create_folder(folder_id: str, name: str, icon: str = "📁"):
    """创建文件夹"""
    conn = get_db()
    conn.execute(
        "INSERT OR IGNORE INTO folders (id, name, icon) VALUES (?,?,?)",
        (folder_id, name, icon),
    )
    conn.commit()
    conn.close()


def db_delete_folder(folder_id: str):
    """删除文件夹"""
    conn = get_db()
    conn.execute("DELETE FROM folders WHERE id = ?", (folder_id,))
    conn.execute("DELETE FROM folder_files WHERE folder_id = ?", (folder_id,))
    conn.commit()
    conn.close()


def db_add_file_to_folder(folder_id: str, file_id: str, sort_order: int = 0):
    """将文件添加到文件夹"""
    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO folder_files (folder_id, file_id, sort_order) VALUES (?,?,?)",
        (folder_id, file_id, sort_order),
    )
    conn.commit()
    conn.close()


# ==================== 缓存操作 ====================


def db_get_analysis(file_id: str) -> dict | None:
    """获取分析缓存"""
    conn = get_db()
    row = conn.execute("SELECT result_json FROM analysis_cache WHERE file_id = ?", (file_id,)).fetchone()
    conn.close()
    return json.loads(row["result_json"]) if row else None


def db_save_analysis(file_id: str, result: dict):
    """保存分析缓存"""
    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO analysis_cache (file_id, result_json, created_at) VALUES (?,?,?)",
        (file_id, json.dumps(result, ensure_ascii=False), datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()


def db_get_parse(file_id: str) -> str | None:
    """获取解析缓存"""
    conn = get_db()
    row = conn.execute("SELECT markdown FROM parse_cache WHERE file_id = ?", (file_id,)).fetchone()
    conn.close()
    return row["markdown"] if row else None


def db_save_parse(file_id: str, markdown: str):
    """保存解析缓存"""
    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO parse_cache (file_id, markdown, created_at) VALUES (?,?,?)",
        (file_id, markdown, datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()