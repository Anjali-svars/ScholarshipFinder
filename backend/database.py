"""
Database configuration and SQLite helper for Scholarship Recommendation System.
Provides both standard SQLite native access and SQLAlchemy ORM configuration
for compatibility with local SQLite and production PostgreSQL.
"""
import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "scholarships.db"))

def get_connection():
    """Returns a connection to the SQLite database with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables for students, scholarships, applications, saved, audit logs, and settings."""
    conn = get_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student', -- 'student' or 'admin'
        created_at TEXT NOT NULL
    )
    """)

    # Student profiles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        state TEXT,
        country TEXT DEFAULT 'India',
        education_level TEXT, -- 'High School', 'Undergraduate', 'Postgraduate', 'Doctoral', 'Diploma'
        course TEXT,          -- e.g. 'Computer Science & Engineering', 'Data Science', 'Medicine', 'Commerce'
        institution_name TEXT,
        current_year INTEGER DEFAULT 1,
        academic_score REAL,  -- CGPA (scaled 0-10 or 0-100) or percentage
        academic_score_type TEXT DEFAULT 'percentage', -- 'percentage' or 'cgpa'
        family_income REAL,   -- Annual income in INR / currency units
        category TEXT DEFAULT 'General', -- 'General', 'OBC', 'SC', 'ST', 'EWS', 'Minority', 'Women in STEM'
        disability_status TEXT DEFAULT 'No', -- 'No', 'Yes', 'Prefer not to say'
        skills TEXT,          -- Comma separated keywords: 'Python, Machine Learning, Leadership, Debate'
        achievements TEXT,    -- Summary of awards / extracurriculars
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # Scholarships table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scholarships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        description TEXT NOT NULL,
        education_levels TEXT NOT NULL, -- JSON array e.g. ["Undergraduate", "Postgraduate"]
        courses TEXT NOT NULL,          -- JSON array e.g. ["Computer Science", "Engineering", "All Fields"]
        min_academic_score REAL DEFAULT 0.0, -- Percentage required (0-100)
        max_family_income REAL,        -- Max annual income in local currency (NULL if no limit)
        eligible_locations TEXT NOT NULL, -- JSON array e.g. ["All", "India", "Karnataka"]
        categories TEXT NOT NULL,      -- JSON array e.g. ["All", "General", "OBC", "SC", "ST", "Women in STEM"]
        disability_eligible_only INTEGER DEFAULT 0, -- 1 if specifically for PwD
        amount REAL NOT NULL,
        currency TEXT DEFAULT '₹',
        funding_type TEXT NOT NULL,    -- 'Merit-Based', 'Need-Based', 'Merit-cum-Need', 'Special Category'
        required_documents TEXT NOT NULL, -- JSON array of strings
        application_open_date TEXT,
        application_deadline TEXT NOT NULL,
        official_url TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        is_verified INTEGER DEFAULT 1,
        last_verified_date TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    # Saved scholarships table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_scholarships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        scholarship_id INTEGER NOT NULL,
        saved_at TEXT NOT NULL,
        UNIQUE(user_id, scholarship_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
    )
    """)

    # Applications tracking table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        scholarship_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Interested', 
        -- 'Interested', 'Preparing Documents', 'Ready to Apply', 'Applied', 'Awarded', 'Rejected'
        applied_date TEXT,
        personal_notes TEXT,
        documents_checklist TEXT, -- JSON map of doc_name -> boolean
        updated_at TEXT NOT NULL,
        UNIQUE(user_id, scholarship_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
    )
    """)

    # Audit logs table for administrative accountability
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_email TEXT NOT NULL,
        action TEXT NOT NULL,
        target_entity TEXT NOT NULL,
        target_id INTEGER,
        details TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # System settings (e.g. recommendation weight configurations)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database tables initialized successfully at", DB_PATH)
