"""SQLite storage: posts (deduplicated by post_id) and small key/value settings."""
import sqlite3
import time
from contextlib import contextmanager

from . import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS posts (
    post_id       TEXT PRIMARY KEY,
    group_url     TEXT NOT NULL,
    url           TEXT,
    author        TEXT,
    text          TEXT,
    posted_at     REAL,      -- unix time, best effort (NULL if unknown)
    comments      INTEGER,
    first_seen    REAL NOT NULL,
    summarized_at REAL
);
CREATE INDEX IF NOT EXISTS idx_posts_group_time ON posts(group_url, first_seen);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
"""


@contextmanager
def connect():
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init():
    with connect() as c:
        c.executescript(SCHEMA)


def get_setting(key, default=None):
    with connect() as c:
        row = c.execute("SELECT value FROM settings WHERE key=?", (key,)).fetchone()
        return row["value"] if row else default


def set_setting(key, value):
    with connect() as c:
        c.execute(
            "INSERT INTO settings(key,value) VALUES(?,?) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            (key, None if value is None else str(value)),
        )


def upsert_posts(group_url, posts):
    """Insert new posts; refresh comment counts of known ones. Returns #new."""
    now = time.time()
    new = 0
    with connect() as c:
        for p in posts:
            cur = c.execute(
                "INSERT OR IGNORE INTO posts(post_id,group_url,url,author,text,posted_at,comments,first_seen) "
                "VALUES(?,?,?,?,?,?,?,?)",
                (p["post_id"], group_url, p.get("url"), p.get("author"), p.get("text"),
                 p.get("posted_at"), p.get("comments"), now),
            )
            if cur.rowcount:
                new += 1
            else:
                c.execute(
                    "UPDATE posts SET comments=COALESCE(?,comments), "
                    "text=CASE WHEN length(COALESCE(?,''))>length(COALESCE(text,'')) THEN ? ELSE text END "
                    "WHERE post_id=?",
                    (p.get("comments"), p.get("text"), p.get("text"), p["post_id"]),
                )
    return new


def posts_for_summary(group_url, since_ts, include_summarized=False):
    q = ("SELECT * FROM posts WHERE group_url=? AND COALESCE(posted_at, first_seen) >= ?")
    if not include_summarized:
        q += " AND summarized_at IS NULL"
    q += " ORDER BY COALESCE(posted_at, first_seen) ASC"
    with connect() as c:
        return [dict(r) for r in c.execute(q, (group_url, since_ts)).fetchall()]


def mark_summarized(post_ids):
    now = time.time()
    with connect() as c:
        c.executemany("UPDATE posts SET summarized_at=? WHERE post_id=?",
                      [(now, pid) for pid in post_ids])


def counts(group_url):
    with connect() as c:
        total = c.execute("SELECT COUNT(*) FROM posts WHERE group_url=?", (group_url,)).fetchone()[0]
        pending = c.execute("SELECT COUNT(*) FROM posts WHERE group_url=? AND summarized_at IS NULL",
                            (group_url,)).fetchone()[0]
    return total, pending
