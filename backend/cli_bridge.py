"""
Python CLI Bridge
Serves as the high-performance execution bridge between the web server and the
Python Recommendation Engine, SQLite Database, and Data Science algorithms.
"""
import sys
import json
import os
import csv
import io
from datetime import datetime, date, timedelta

# Ensure local imports work
sys.path.insert(0, os.path.dirname(__file__))

from database import get_connection, init_db
from seed_data import hash_password, seed_database
from recommendation_engine import (
    recommend_scholarships_for_student,
    evaluate_eligibility,
    compute_weighted_ranking_score,
    DEFAULT_WEIGHTS,
    parse_json_list
)

def row_to_dict(row):
    return dict(row) if row else None

def rows_to_list(rows):
    return [dict(r) for r in rows]

def handle_auth_register(payload):
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")
    full_name = payload.get("full_name", "").strip()
    role = payload.get("role", "student")

    if not email or "@" not in email:
        return {"success": False, "error": "A valid email address is required."}
    if len(password) < 6:
        return {"success": False, "error": "Password must be at least 6 characters."}
    if not full_name:
        return {"success": False, "error": "Full name is required."}

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE email = ?", (email,))
    if c.fetchone():
        conn.close()
        return {"success": False, "error": "An account with this email already exists."}

    pwd_hash, salt = hash_password(password)
    now = datetime.now().isoformat()
    c.execute("INSERT INTO users (email, password_hash, salt, role, created_at) VALUES (?, ?, ?, ?, ?)",
              (email, pwd_hash, salt, role, now))
    user_id = c.lastrowid

    # Create empty student profile
    c.execute("""
        INSERT INTO student_profiles (
            user_id, full_name, state, country, education_level, course,
            institution_name, current_year, academic_score, academic_score_type,
            family_income, category, disability_status, skills, achievements, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, full_name, "", "India", "Undergraduate", "", "", 1, None, "percentage", None, "General", "No", "", "", now))

    # Log action
    c.execute("INSERT INTO audit_logs (admin_email, action, target_entity, target_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)",
              (email, "REGISTER", "user", user_id, f"User registered with role {role}", now))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "user": {
            "id": user_id,
            "email": email,
            "role": role,
            "full_name": full_name
        },
        "token": f"mock-token-{user_id}-{email}"
    }

def handle_auth_login(payload):
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, email, password_hash, salt, role FROM users WHERE email = ?", (email,))
    user = c.fetchone()

    if not user:
        conn.close()
        return {"success": False, "error": "Invalid email or password."}

    user_dict = dict(user)
    check_hash, _ = hash_password(password, user_dict["salt"])
    if check_hash != user_dict["password_hash"]:
        conn.close()
        return {"success": False, "error": "Invalid email or password."}

    # Fetch profile
    c.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_dict["id"],))
    profile = row_to_dict(c.fetchone())
    conn.close()

    return {
        "success": True,
        "user": {
            "id": user_dict["id"],
            "email": user_dict["email"],
            "role": user_dict["role"],
            "full_name": profile.get("full_name") if profile else user_dict["email"]
        },
        "token": f"token-{user_dict['id']}-{user_dict['role']}"
    }

def handle_get_profile(payload):
    user_id = payload.get("user_id")
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT p.*, u.email, u.role FROM student_profiles p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?", (user_id,))
    profile = row_to_dict(c.fetchone())
    conn.close()

    if not profile:
        return {"success": False, "error": "Profile not found."}

    # Calculate completion percentage
    key_fields = ["full_name", "education_level", "course", "institution_name", "academic_score", "family_income", "state", "skills"]
    filled_count = sum(1 for f in key_fields if profile.get(f) is not None and str(profile.get(f)).strip() != "")
    completion_pct = int((filled_count / len(key_fields)) * 100)

    profile["completion_percentage"] = completion_pct
    return {"success": True, "profile": profile}

def handle_update_profile(payload):
    user_id = payload.get("user_id")
    data = payload.get("profile", {})

    conn = get_connection()
    c = conn.cursor()
    now = datetime.now().isoformat()

    c.execute("""
        UPDATE student_profiles SET
            full_name = COALESCE(?, full_name),
            state = COALESCE(?, state),
            country = COALESCE(?, country),
            education_level = COALESCE(?, education_level),
            course = COALESCE(?, course),
            institution_name = COALESCE(?, institution_name),
            current_year = COALESCE(?, current_year),
            academic_score = ?,
            academic_score_type = COALESCE(?, academic_score_type),
            family_income = ?,
            category = COALESCE(?, category),
            disability_status = COALESCE(?, disability_status),
            skills = COALESCE(?, skills),
            achievements = COALESCE(?, achievements),
            updated_at = ?
        WHERE user_id = ?
    """, (
        data.get("full_name"),
        data.get("state"),
        data.get("country", "India"),
        data.get("education_level"),
        data.get("course"),
        data.get("institution_name"),
        data.get("current_year"),
        data.get("academic_score"),
        data.get("academic_score_type", "percentage"),
        data.get("family_income"),
        data.get("category"),
        data.get("disability_status", "No"),
        data.get("skills"),
        data.get("achievements"),
        now,
        user_id
    ))

    conn.commit()
    conn.close()
    return handle_get_profile({"user_id": user_id})

def handle_get_scholarships(payload):
    search = payload.get("search", "").strip().lower()
    education_level = payload.get("education_level", "").strip().lower()
    funding_type = payload.get("funding_type", "").strip().lower()
    max_income_filter = payload.get("max_income")
    min_score_filter = payload.get("min_score")
    course_filter = payload.get("course", "").strip().lower()

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM scholarships WHERE is_active = 1 ORDER BY id DESC")
    scholarships = rows_to_list(c.fetchall())
    conn.close()

    filtered = []
    for s in scholarships:
        # Search keyword
        if search:
            combined_text = f"{s['name']} {s['provider']} {s['description']}".lower()
            if search not in combined_text:
                continue

        # Education level
        if education_level and education_level != "all":
            levels = parse_json_list(s.get("education_levels", []))
            if "all" not in levels and education_level not in levels:
                continue

        # Funding type
        if funding_type and funding_type != "all":
            if s.get("funding_type", "").lower() != funding_type:
                continue

        # Income limit filter
        if max_income_filter is not None and str(max_income_filter) != "":
            try:
                income_val = float(max_income_filter)
                sch_income = s.get("max_family_income")
                if sch_income is not None and sch_income < income_val:
                    continue
            except Exception:
                pass

        # Minimum score filter
        if min_score_filter is not None and str(min_score_filter) != "":
            try:
                score_val = float(min_score_filter)
                if s.get("min_academic_score", 0) > score_val:
                    continue
            except Exception:
                pass

        # Course filter
        if course_filter and course_filter != "all":
            sch_courses = parse_json_list(s.get("courses", []))
            if "all" not in sch_courses and "all fields" not in sch_courses:
                if not any(course_filter in c or c in course_filter for c in sch_courses):
                    continue

        # Format parsed lists for client
        s["required_documents"] = parse_json_list(s.get("required_documents", []))
        s["education_levels"] = parse_json_list(s.get("education_levels", []))
        s["courses"] = parse_json_list(s.get("courses", []))
        s["eligible_locations"] = parse_json_list(s.get("eligible_locations", []))
        s["categories"] = parse_json_list(s.get("categories", []))

        filtered.append(s)

    return {"success": True, "count": len(filtered), "scholarships": filtered}

def handle_get_recommendations(payload):
    user_id = payload.get("user_id")
    custom_weights = payload.get("weights")

    conn = get_connection()
    c = conn.cursor()

    # Get student profile
    c.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,))
    student = row_to_dict(c.fetchone())

    if not student:
        conn.close()
        return {"success": False, "error": "Student profile not found. Please log in first."}

    # Get all active scholarships
    c.execute("SELECT * FROM scholarships WHERE is_active = 1")
    scholarships = rows_to_list(c.fetchall())

    # Get saved status for this user
    c.execute("SELECT scholarship_id FROM saved_scholarships WHERE user_id = ?", (user_id,))
    saved_ids = set(r["scholarship_id"] for r in c.fetchall())

    # Get applications status for this user
    c.execute("SELECT scholarship_id, status FROM applications WHERE user_id = ?", (user_id,))
    app_map = {r["scholarship_id"]: r["status"] for r in c.fetchall()}

    conn.close()

    # Run Python recommendation engine
    recommendations = recommend_scholarships_for_student(student, scholarships, custom_weights)

    # Attach saved and application state
    for rec in recommendations:
        s_id = rec["scholarship_id"]
        rec["is_saved"] = s_id in saved_ids
        rec["application_status"] = app_map.get(s_id, None)

    # Calculate summary counts
    eligible_count = sum(1 for r in recommendations if r["eligibility_status"] == "ELIGIBLE")
    potentially_eligible_count = sum(1 for r in recommendations if r["eligibility_status"] == "POTENTIALLY_ELIGIBLE")
    ineligible_count = sum(1 for r in recommendations if r["eligibility_status"] == "INELIGIBLE")

    return {
        "success": True,
        "student_name": student.get("full_name"),
        "total_evaluated": len(recommendations),
        "eligible_count": eligible_count,
        "potentially_eligible_count": potentially_eligible_count,
        "ineligible_count": ineligible_count,
        "weights_used": custom_weights or DEFAULT_WEIGHTS,
        "recommendations": recommendations
    }

def handle_get_saved_scholarships(payload):
    user_id = payload.get("user_id")
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT s.*, sav.saved_at
        FROM saved_scholarships sav
        JOIN scholarships s ON sav.scholarship_id = s.id
        WHERE sav.user_id = ?
        ORDER BY sav.saved_at DESC
    """, (user_id,))
    saved = rows_to_list(c.fetchall())
    conn.close()

    for s in saved:
        s["required_documents"] = parse_json_list(s.get("required_documents", []))
        s["education_levels"] = parse_json_list(s.get("education_levels", []))
        s["courses"] = parse_json_list(s.get("courses", []))

    return {"success": True, "saved_scholarships": saved}

def handle_toggle_save(payload):
    user_id = payload.get("user_id")
    scholarship_id = payload.get("scholarship_id")

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id FROM saved_scholarships WHERE user_id = ? AND scholarship_id = ?", (user_id, scholarship_id))
    existing = c.fetchone()

    if existing:
        c.execute("DELETE FROM saved_scholarships WHERE user_id = ? AND scholarship_id = ?", (user_id, scholarship_id))
        is_saved = False
    else:
        now = datetime.now().isoformat()
        c.execute("INSERT INTO saved_scholarships (user_id, scholarship_id, saved_at) VALUES (?, ?, ?)",
                  (user_id, scholarship_id, now))
        is_saved = True

    conn.commit()
    conn.close()
    return {"success": True, "is_saved": is_saved, "scholarship_id": scholarship_id}

def handle_get_applications(payload):
    user_id = payload.get("user_id")
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        SELECT a.*, s.name as scholarship_name, s.provider, s.amount, s.currency,
               s.application_deadline, s.official_url, s.required_documents
        FROM applications a
        JOIN scholarships s ON a.scholarship_id = s.id
        WHERE a.user_id = ?
        ORDER BY a.updated_at DESC
    """, (user_id,))
    apps = rows_to_list(c.fetchall())
    conn.close()

    for a in apps:
        if a.get("documents_checklist"):
            try:
                a["documents_checklist"] = json.loads(a["documents_checklist"])
            except Exception:
                a["documents_checklist"] = {}
        else:
            a["documents_checklist"] = {}
        a["required_documents"] = parse_json_list(a.get("required_documents", []))

    return {"success": True, "applications": apps}

def handle_save_application(payload):
    user_id = payload.get("user_id")
    scholarship_id = payload.get("scholarship_id")
    status = payload.get("status", "Interested")
    applied_date = payload.get("applied_date")
    personal_notes = payload.get("personal_notes", "")
    checklist = payload.get("documents_checklist", {})

    conn = get_connection()
    c = conn.cursor()
    now = datetime.now().isoformat()

    c.execute("""
        INSERT INTO applications (user_id, scholarship_id, status, applied_date, personal_notes, documents_checklist, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, scholarship_id) DO UPDATE SET
            status = excluded.status,
            applied_date = excluded.applied_date,
            personal_notes = excluded.personal_notes,
            documents_checklist = excluded.documents_checklist,
            updated_at = excluded.updated_at
    """, (user_id, scholarship_id, status, applied_date, personal_notes, json.dumps(checklist), now))

    conn.commit()
    conn.close()
    return {"success": True, "message": "Application tracker updated successfully."}

def handle_delete_application(payload):
    user_id = payload.get("user_id")
    scholarship_id = payload.get("scholarship_id")

    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM applications WHERE user_id = ? AND scholarship_id = ?", (user_id, scholarship_id))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Application removed from tracker."}

def handle_get_dashboard(payload):
    user_id = payload.get("user_id")
    conn = get_connection()
    c = conn.cursor()

    # Get student profile
    c.execute("SELECT * FROM student_profiles WHERE user_id = ?", (user_id,))
    student = row_to_dict(c.fetchone())

    if not student:
        conn.close()
        return {"success": False, "error": "Profile not found."}

    # Get all active scholarships
    c.execute("SELECT * FROM scholarships WHERE is_active = 1")
    scholarships = rows_to_list(c.fetchall())

    # Saved count
    c.execute("SELECT COUNT(*) as cnt FROM saved_scholarships WHERE user_id = ?", (user_id,))
    saved_count = c.fetchone()["cnt"]

    # Applications tracking summary
    c.execute("SELECT status, COUNT(*) as cnt FROM applications WHERE user_id = ? GROUP BY status", (user_id,))
    status_counts = {r["status"]: r["cnt"] for r in c.fetchall()}

    conn.close()

    # Run recommendation engine for real live statistics
    recommendations = recommend_scholarships_for_student(student, scholarships)
    eligible_count = sum(1 for r in recommendations if r["eligibility_status"] == "ELIGIBLE")
    potentially_eligible_count = sum(1 for r in recommendations if r["eligibility_status"] == "POTENTIALLY_ELIGIBLE")

    # Calculate profile completion %
    key_fields = ["full_name", "education_level", "course", "institution_name", "academic_score", "family_income", "state", "skills"]
    filled = sum(1 for f in key_fields if student.get(f) is not None and str(student.get(f)).strip() != "")
    completion_pct = int((filled / len(key_fields)) * 100)

    # Upcoming deadlines (within 30 days) from eligible & potentially eligible
    upcoming_deadlines = []
    today = date.today()
    for rec in recommendations:
        if rec["eligibility_status"] in ["ELIGIBLE", "POTENTIALLY_ELIGIBLE"]:
            dl_str = rec.get("application_deadline")
            if dl_str:
                try:
                    dl_date = datetime.strptime(dl_str[:10], "%Y-%m-%d").date()
                    delta = (dl_date - today).days
                    if 0 <= delta <= 40:
                        upcoming_deadlines.append({
                            "scholarship_id": rec["scholarship_id"],
                            "name": rec["scholarship_name"],
                            "provider": rec["provider"],
                            "deadline": dl_str,
                            "days_left": delta,
                            "amount": rec["amount"],
                            "currency": rec["currency"],
                            "match_score": rec["match_score"]
                        })
                except Exception:
                    pass

    upcoming_deadlines.sort(key=lambda x: x["days_left"])

    # Distribution by funding type
    funding_distribution = {}
    for s in scholarships:
        ft = s.get("funding_type", "Other")
        funding_distribution[ft] = funding_distribution.get(ft, 0) + 1

    return {
        "success": True,
        "student": {
            "name": student.get("full_name"),
            "course": student.get("course"),
            "education_level": student.get("education_level"),
            "academic_score": student.get("academic_score"),
            "state": student.get("state")
        },
        "stats": {
            "completion_percentage": completion_pct,
            "matching_scholarships": eligible_count,
            "potential_scholarships": potentially_eligible_count,
            "saved_count": saved_count,
            "total_applications": sum(status_counts.values()),
            "status_breakdown": status_counts,
            "total_available_scholarships": len(scholarships)
        },
        "upcoming_deadlines": upcoming_deadlines[:5],
        "top_recommendations": recommendations[:4],
        "funding_distribution": funding_distribution
    }

# Admin functions
def handle_admin_create_scholarship(payload):
    admin_email = payload.get("admin_email", "admin@scholarshipfinder.edu")
    data = payload.get("scholarship", {})

    conn = get_connection()
    c = conn.cursor()
    now = datetime.now().isoformat()

    c.execute("""
        INSERT INTO scholarships (
            name, provider, description, education_levels, courses,
            min_academic_score, max_family_income, eligible_locations,
            categories, disability_eligible_only, amount, currency,
            funding_type, required_documents, application_open_date,
            application_deadline, official_url, is_active, is_verified,
            last_verified_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("name"),
        data.get("provider"),
        data.get("description", ""),
        json.dumps(data.get("education_levels", ["All"])),
        json.dumps(data.get("courses", ["All Fields"])),
        float(data.get("min_academic_score") or 0.0),
        float(data.get("max_family_income")) if data.get("max_family_income") else None,
        json.dumps(data.get("eligible_locations", ["All"])),
        json.dumps(data.get("categories", ["All"])),
        1 if data.get("disability_eligible_only") else 0,
        float(data.get("amount") or 0.0),
        data.get("currency", "₹"),
        data.get("funding_type", "Merit-Based"),
        json.dumps(data.get("required_documents", ["Marksheets"])),
        data.get("application_open_date", now[:10]),
        data.get("application_deadline"),
        data.get("official_url"),
        1,
        1,
        now[:10],
        now
    ))
    sch_id = c.lastrowid

    # Audit log
    c.execute("INSERT INTO audit_logs (admin_email, action, target_entity, target_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)",
              (admin_email, "CREATE_SCHOLARSHIP", "scholarship", sch_id, f"Created {data.get('name')}", now))

    conn.commit()
    conn.close()
    return {"success": True, "scholarship_id": sch_id, "message": "Scholarship created successfully."}

def handle_admin_update_scholarship(payload):
    admin_email = payload.get("admin_email", "admin@scholarshipfinder.edu")
    sch_id = payload.get("scholarship_id")
    data = payload.get("scholarship", {})

    conn = get_connection()
    c = conn.cursor()
    now = datetime.now().isoformat()

    c.execute("""
        UPDATE scholarships SET
            name = COALESCE(?, name),
            provider = COALESCE(?, provider),
            description = COALESCE(?, description),
            education_levels = COALESCE(?, education_levels),
            courses = COALESCE(?, courses),
            min_academic_score = ?,
            max_family_income = ?,
            eligible_locations = COALESCE(?, eligible_locations),
            categories = COALESCE(?, categories),
            disability_eligible_only = COALESCE(?, disability_eligible_only),
            amount = COALESCE(?, amount),
            currency = COALESCE(?, currency),
            funding_type = COALESCE(?, funding_type),
            required_documents = COALESCE(?, required_documents),
            application_deadline = COALESCE(?, application_deadline),
            official_url = COALESCE(?, official_url),
            is_active = COALESCE(?, is_active),
            is_verified = COALESCE(?, is_verified),
            last_verified_date = ?
        WHERE id = ?
    """, (
        data.get("name"),
        data.get("provider"),
        data.get("description"),
        json.dumps(data.get("education_levels")) if "education_levels" in data else None,
        json.dumps(data.get("courses")) if "courses" in data else None,
        float(data.get("min_academic_score")) if "min_academic_score" in data else None,
        float(data.get("max_family_income")) if data.get("max_family_income") else None,
        json.dumps(data.get("eligible_locations")) if "eligible_locations" in data else None,
        json.dumps(data.get("categories")) if "categories" in data else None,
        1 if data.get("disability_eligible_only") else 0 if "disability_eligible_only" in data else None,
        float(data.get("amount")) if "amount" in data else None,
        data.get("currency"),
        data.get("funding_type"),
        json.dumps(data.get("required_documents")) if "required_documents" in data else None,
        data.get("application_deadline"),
        data.get("official_url"),
        data.get("is_active"),
        data.get("is_verified"),
        now[:10],
        sch_id
    ))

    c.execute("INSERT INTO audit_logs (admin_email, action, target_entity, target_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)",
              (admin_email, "UPDATE_SCHOLARSHIP", "scholarship", sch_id, f"Updated scholarship ID {sch_id}", now))

    conn.commit()
    conn.close()
    return {"success": True, "message": "Scholarship updated successfully."}

def handle_admin_delete_scholarship(payload):
    admin_email = payload.get("admin_email", "admin@scholarshipfinder.edu")
    sch_id = payload.get("scholarship_id")

    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM scholarships WHERE id = ?", (sch_id,))
    now = datetime.now().isoformat()
    c.execute("INSERT INTO audit_logs (admin_email, action, target_entity, target_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)",
              (admin_email, "DELETE_SCHOLARSHIP", "scholarship", sch_id, f"Deleted scholarship ID {sch_id}", now))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Scholarship deleted."}

def handle_admin_toggle_verify(payload):
    admin_email = payload.get("admin_email", "admin@scholarshipfinder.edu")
    sch_id = payload.get("scholarship_id")

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT is_verified FROM scholarships WHERE id = ?", (sch_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return {"success": False, "error": "Scholarship not found."}

    new_state = 0 if row["is_verified"] == 1 else 1
    now = datetime.now().isoformat()
    c.execute("UPDATE scholarships SET is_verified = ?, last_verified_date = ? WHERE id = ?", (new_state, now[:10], sch_id))
    c.execute("INSERT INTO audit_logs (admin_email, action, target_entity, target_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)",
              (admin_email, "TOGGLE_VERIFY", "scholarship", sch_id, f"Set verified to {new_state}", now))
    conn.commit()
    conn.close()
    return {"success": True, "is_verified": new_state}

def handle_admin_get_audit_logs(payload):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50")
    logs = rows_to_list(c.fetchall())
    conn.close()
    return {"success": True, "audit_logs": logs}

def handle_admin_export_csv(payload):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, name, provider, amount, currency, funding_type, min_academic_score, max_family_income, application_deadline, official_url, is_verified, is_active FROM scholarships")
    rows = c.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Provider", "Amount", "Currency", "Funding Type", "Min Academic Score", "Max Family Income", "Deadline", "Official URL", "Verified", "Active"])
    for r in rows:
        writer.writerow(list(r))

    return {"success": True, "csv_content": output.getvalue()}

def handle_run_tests(payload):
    """Executes the test suite and returns structured results."""
    import subprocess
    test_path = os.path.join(os.path.dirname(__file__), "tests", "test_scholarship_system.py")
    try:
        proc = subprocess.run([sys.executable, test_path], capture_output=True, text=True, timeout=30)
        return {
            "success": proc.returncode == 0,
            "stdout": proc.stdout,
            "stderr": proc.stderr,
            "exit_code": proc.returncode
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

ACTION_HANDLERS = {
    "auth_register": handle_auth_register,
    "auth_login": handle_auth_login,
    "get_profile": handle_get_profile,
    "update_profile": handle_update_profile,
    "get_scholarships": handle_get_scholarships,
    "get_recommendations": handle_get_recommendations,
    "get_saved_scholarships": handle_get_saved_scholarships,
    "toggle_save": handle_toggle_save,
    "get_applications": handle_get_applications,
    "save_application": handle_save_application,
    "delete_application": handle_delete_application,
    "get_dashboard": handle_get_dashboard,
    "admin_create_scholarship": handle_admin_create_scholarship,
    "admin_update_scholarship": handle_admin_update_scholarship,
    "admin_delete_scholarship": handle_admin_delete_scholarship,
    "admin_toggle_verify": handle_admin_toggle_verify,
    "admin_get_audit_logs": handle_admin_get_audit_logs,
    "admin_export_csv": handle_admin_export_csv,
    "run_tests": handle_run_tests
}

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No action specified"}))
        sys.exit(1)

    action = sys.argv[1]
    handler = ACTION_HANDLERS.get(action)
    if not handler:
        print(json.dumps({"success": False, "error": f"Unknown action '{action}'"}))
        sys.exit(1)

    # Read payload from sys.argv[2] or stdin
    payload = {}
    if len(sys.argv) > 2:
        try:
            payload = json.loads(sys.argv[2])
        except Exception as e:
            print(json.dumps({"success": False, "error": f"Invalid JSON payload: {str(e)}"}))
            sys.exit(1)
    elif not sys.stdin.isatty():
        try:
            raw_input = sys.stdin.read().strip()
            if raw_input:
                payload = json.loads(raw_input)
        except Exception as e:
            print(json.dumps({"success": False, "error": f"Invalid stdin JSON: {str(e)}"}))
            sys.exit(1)

    try:
        response = handler(payload)
        print(json.dumps(response))
    except Exception as e:
        import traceback
        print(json.dumps({"success": False, "error": str(e), "traceback": traceback.format_exc()}))
        sys.exit(1)

if __name__ == "__main__":
    main()
