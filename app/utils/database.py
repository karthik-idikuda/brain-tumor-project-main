# app/utils/database.py
"""SQLite database for storing predictions and analytics data."""

import sqlite3
import os
from datetime import datetime
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if os.environ.get("VERCEL"):
    DB_PATH = "/tmp/brain_tumor.db"
else:
    DB_PATH = os.path.join(BASE_DIR, "brain_tumor.db")


def get_connection():
    """Get a SQLite connection with row_factory set."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables if they don't exist."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            result TEXT NOT NULL,
            confidence REAL NOT NULL,
            timestamp TEXT NOT NULL,
            user_ip TEXT,
            city TEXT DEFAULT 'Unknown',
            country TEXT DEFAULT 'Unknown',
            region TEXT DEFAULT 'Unknown',
            lat REAL,
            lon REAL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            page TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            user_ip TEXT,
            city TEXT DEFAULT 'Unknown',
            country TEXT DEFAULT 'Unknown',
            region TEXT DEFAULT 'Unknown',
            lat REAL,
            lon REAL,
            meta_json TEXT
        )
    """)
    conn.commit()
    conn.close()
    print(f"Database initialized at: {DB_PATH}")


def save_prediction(filename, result, confidence, user_ip, city, country, region, lat, lon):
    """Save a prediction record to the database."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO predictions (filename, result, confidence, timestamp, user_ip, city, country, region, lat, lon)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (filename, result, confidence, datetime.now().isoformat(), user_ip, city, country, region, lat, lon),
    )
    conn.commit()
    conn.close()


def get_all_predictions():
    """Get all prediction records."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM predictions ORDER BY timestamp DESC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows


def get_prediction_stats():
    """Get aggregate statistics."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM predictions")
    total = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as tumors FROM predictions WHERE result = 'Tumor Detected'")
    tumors = cursor.fetchone()["tumors"]

    cursor.execute(
        "SELECT country, COUNT(*) as count FROM predictions GROUP BY country ORDER BY count DESC LIMIT 10"
    )
    top_countries = [dict(row) for row in cursor.fetchall()]

    cursor.execute(
        "SELECT DATE(timestamp) as date, COUNT(*) as count FROM predictions GROUP BY DATE(timestamp) ORDER BY date DESC LIMIT 30"
    )
    daily_counts = [dict(row) for row in cursor.fetchall()]

    cursor.execute(
        "SELECT result, COUNT(*) as count FROM predictions GROUP BY result"
    )
    result_distribution = [dict(row) for row in cursor.fetchall()]

    conn.close()

    no_tumors = total - tumors
    tumor_rate = round((tumors / total) * 100, 1) if total > 0 else 0

    return {
        "total_scans": total,
        "tumors_detected": tumors,
        "no_tumors": no_tumors,
        "tumor_rate": tumor_rate,
        "top_countries": top_countries,
        "daily_counts": daily_counts,
        "result_distribution": result_distribution,
        "interaction_summary": get_interaction_summary(),
    }


def get_heatmap_data():
    """Get lat/lon data for heatmap visualization."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT lat, lon, result, city, country FROM predictions WHERE lat IS NOT NULL AND lon IS NOT NULL"
    )
    points = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return points


def save_interaction(event_type, page, user_ip=None, city="Unknown", country="Unknown", region="Unknown", lat=None, lon=None, meta=None):
    """Save an interaction event (page_view, upload_attempt, etc.)."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO interactions (event_type, page, timestamp, user_ip, city, country, region, lat, lon, meta_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            event_type,
            page,
            datetime.now().isoformat(),
            user_ip,
            city,
            country,
            region,
            lat,
            lon,
            json.dumps(meta) if meta is not None else None,
        ),
    )
    conn.commit()
    conn.close()


def get_interaction_summary():
    """Get aggregate interaction counts by event type and page."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) AS total FROM interactions")
    total = cursor.fetchone()["total"]

    cursor.execute(
        "SELECT event_type, COUNT(*) AS count FROM interactions GROUP BY event_type ORDER BY count DESC"
    )
    by_event = [dict(row) for row in cursor.fetchall()]

    cursor.execute(
        "SELECT page, COUNT(*) AS count FROM interactions GROUP BY page ORDER BY count DESC"
    )
    by_page = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return {"total": total, "by_event": by_event, "by_page": by_page}
