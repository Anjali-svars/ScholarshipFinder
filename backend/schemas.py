"""
Pydantic Schemas for Request Validation and Response Serialization
Ensures strict type-checking and automated OpenAPI documentation generation.
"""
from typing import List, Optional, Dict, Any
try:
    from pydantic import BaseModel, EmailStr, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
    EmailStr = str
    def Field(*args, **kwargs):
        return None

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    full_name: Optional[str] = None

class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    education_level: Optional[str] = None
    course: Optional[str] = None
    institution_name: Optional[str] = None
    current_year: Optional[int] = 1
    academic_score: Optional[float] = None
    academic_score_type: Optional[str] = "percentage"
    family_income: Optional[float] = None
    category: Optional[str] = "General"
    disability_status: Optional[str] = "No"
    skills: Optional[str] = None
    achievements: Optional[str] = None

class ScholarshipCreate(BaseModel):
    name: str
    provider: str
    description: str
    education_levels: List[str]
    courses: List[str]
    min_academic_score: Optional[float] = 0.0
    max_family_income: Optional[float] = None
    eligible_locations: List[str] = ["All"]
    categories: List[str] = ["All"]
    disability_eligible_only: Optional[bool] = False
    amount: float
    currency: Optional[str] = "₹"
    funding_type: str
    required_documents: List[str]
    application_open_date: Optional[str] = None
    application_deadline: str
    official_url: str

class ApplicationUpdate(BaseModel):
    status: str
    applied_date: Optional[str] = None
    personal_notes: Optional[str] = None
    documents_checklist: Optional[Dict[str, bool]] = None

class RecommendationWeights(BaseModel):
    academic: Optional[float] = 0.30
    financial_need: Optional[float] = 0.25
    course_level: Optional[float] = 0.20
    geographic: Optional[float] = 0.10
    skills_achievements: Optional[float] = 0.10
    deadline_suitability: Optional[float] = 0.05
