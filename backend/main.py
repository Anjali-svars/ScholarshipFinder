"""
FastAPI Main Application
Scholarship Recommendation System for Students
Provides complete RESTful endpoints with OpenAPI schema documentation.
"""
import os
import sys
from typing import Optional, List, Dict, Any
from datetime import datetime

# Local imports
sys.path.insert(0, os.path.dirname(__file__))

from database import init_db, get_connection
from seed_data import seed_database
import cli_bridge

# FastAPI app setup (compatible when fastapi is imported)
try:
    from fastapi import FastAPI, Depends, HTTPException, Query, status, Header
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse, Response
except ImportError:
    FastAPI = None

if FastAPI:
    app = FastAPI(
        title="Scholarship Recommendation System API",
        description="Comprehensive rule-based eligibility filtering and weighted ranking engine for students.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def on_startup():
        init_db()
        seed_database()

    @app.get("/")
    def root():
        return {
            "message": "Scholarship Recommendation System API is operational.",
            "docs": "/docs",
            "version": "1.0.0"
        }

    # 1. Authentication
    @app.post("/api/auth/register")
    def register(payload: dict):
        res = cli_bridge.handle_auth_register(payload)
        if not res.get("success"):
            raise HTTPException(status_code=400, detail=res.get("error"))
        return res

    @app.post("/api/auth/login")
    def login(payload: dict):
        res = cli_bridge.handle_auth_login(payload)
        if not res.get("success"):
            raise HTTPException(status_code=401, detail=res.get("error"))
        return res

    @app.post("/api/auth/logout")
    def logout():
        return {"success": True, "message": "Successfully logged out."}

    # Helper to extract user_id from mock authorization token
    def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
        if not authorization:
            # Default to demo student ID (2) if no token provided in development
            return 2
        try:
            parts = authorization.replace("Bearer ", "").split("-")
            return int(parts[1]) if len(parts) > 1 else 2
        except Exception:
            return 2

    # 2. Student Profile
    @app.get("/api/students/me")
    def get_my_profile(user_id: int = Depends(get_current_user_id)):
        res = cli_bridge.handle_get_profile({"user_id": user_id})
        if not res.get("success"):
            raise HTTPException(status_code=404, detail=res.get("error"))
        return res

    @app.put("/api/students/me")
    def update_my_profile(profile_data: dict, user_id: int = Depends(get_current_user_id)):
        res = cli_bridge.handle_update_profile({"user_id": user_id, "profile": profile_data})
        if not res.get("success"):
            raise HTTPException(status_code=400, detail=res.get("error"))
        return res

    # 3. Scholarships Discovery
    @app.get("/api/scholarships")
    def get_scholarships(
        search: Optional[str] = None,
        education_level: Optional[str] = None,
        funding_type: Optional[str] = None,
        max_income: Optional[float] = None,
        min_score: Optional[float] = None,
        course: Optional[str] = None
    ):
        return cli_bridge.handle_get_scholarships({
            "search": search or "",
            "education_level": education_level or "",
            "funding_type": funding_type or "",
            "max_income": max_income,
            "min_score": min_score,
            "course": course or ""
        })

    @app.get("/api/scholarships/{scholarship_id}")
    def get_scholarship_by_id(scholarship_id: int):
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM scholarships WHERE id = ?", (scholarship_id,))
        sch = cli_bridge.row_to_dict(c.fetchone())
        conn.close()
        if not sch:
            raise HTTPException(status_code=404, detail="Scholarship not found.")
        sch["required_documents"] = cli_bridge.parse_json_list(sch.get("required_documents", []))
        sch["education_levels"] = cli_bridge.parse_json_list(sch.get("education_levels", []))
        sch["courses"] = cli_bridge.parse_json_list(sch.get("courses", []))
        sch["eligible_locations"] = cli_bridge.parse_json_list(sch.get("eligible_locations", []))
        sch["categories"] = cli_bridge.parse_json_list(sch.get("categories", []))
        return {"success": True, "scholarship": sch}

    # 4. Recommendation Engine
    @app.get("/api/recommendations")
    def get_recommendations(
        academic_weight: Optional[float] = 0.30,
        need_weight: Optional[float] = 0.25,
        course_weight: Optional[float] = 0.20,
        geo_weight: Optional[float] = 0.10,
        skills_weight: Optional[float] = 0.10,
        deadline_weight: Optional[float] = 0.05,
        user_id: int = Depends(get_current_user_id)
    ):
        weights = {
            "academic": academic_weight,
            "financial_need": need_weight,
            "course_level": course_weight,
            "geographic": geo_weight,
            "skills_achievements": skills_weight,
            "deadline_suitability": deadline_weight
        }
        res = cli_bridge.handle_get_recommendations({"user_id": user_id, "weights": weights})
        if not res.get("success"):
            raise HTTPException(status_code=400, detail=res.get("error"))
        return res

    # 5. Saved Scholarships
    @app.get("/api/saved-scholarships")
    def get_saved(user_id: int = Depends(get_current_user_id)):
        return cli_bridge.handle_get_saved_scholarships({"user_id": user_id})

    @app.post("/api/saved-scholarships/{scholarship_id}")
    def toggle_save(scholarship_id: int, user_id: int = Depends(get_current_user_id)):
        return cli_bridge.handle_toggle_save({"user_id": user_id, "scholarship_id": scholarship_id})

    @app.delete("/api/saved-scholarships/{scholarship_id}")
    def delete_saved(scholarship_id: int, user_id: int = Depends(get_current_user_id)):
        return cli_bridge.handle_toggle_save({"user_id": user_id, "scholarship_id": scholarship_id})

    # 6. Applications Tracker
    @app.get("/api/applications")
    def get_applications(user_id: int = Depends(get_current_user_id)):
        return cli_bridge.handle_get_applications({"user_id": user_id})

    @app.post("/api/applications")
    def create_or_update_application(payload: dict, user_id: int = Depends(get_current_user_id)):
        payload["user_id"] = user_id
        return cli_bridge.handle_save_application(payload)

    @app.put("/api/applications/{application_id}")
    def update_application(application_id: int, payload: dict, user_id: int = Depends(get_current_user_id)):
        payload["user_id"] = user_id
        payload["scholarship_id"] = application_id
        return cli_bridge.handle_save_application(payload)

    # 7. Dashboard
    @app.get("/api/dashboard")
    def get_dashboard(user_id: int = Depends(get_current_user_id)):
        return cli_bridge.handle_get_dashboard({"user_id": user_id})

    # 8. Admin Endpoints
    @app.post("/api/admin/scholarships")
    def admin_create_scholarship(payload: dict):
        return cli_bridge.handle_admin_create_scholarship(payload)

    @app.put("/api/admin/scholarships/{scholarship_id}")
    def admin_update_scholarship(scholarship_id: int, payload: dict):
        payload["scholarship_id"] = scholarship_id
        return cli_bridge.handle_admin_update_scholarship(payload)

    @app.delete("/api/admin/scholarships/{scholarship_id}")
    def admin_delete_scholarship(scholarship_id: int):
        return cli_bridge.handle_admin_delete_scholarship({"scholarship_id": scholarship_id})

    @app.post("/api/admin/scholarships/{scholarship_id}/verify")
    def admin_toggle_verify(scholarship_id: int):
        return cli_bridge.handle_admin_toggle_verify({"scholarship_id": scholarship_id})

    @app.get("/api/admin/audit-logs")
    def admin_audit_logs():
        return cli_bridge.handle_admin_get_audit_logs({})

    @app.get("/api/admin/export-csv")
    def admin_export_csv():
        res = cli_bridge.handle_admin_export_csv({})
        return Response(content=res["csv_content"], media_type="text/csv", headers={"Content-Disposition": "attachment; filename=scholarships_export.csv"})

    @app.post("/api/admin/run-tests")
    def run_automated_tests():
        return cli_bridge.handle_run_tests({})
else:
    # Standalone execution message when imported in minimal environment
    app = None
