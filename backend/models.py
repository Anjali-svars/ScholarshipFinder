"""
SQLAlchemy ORM Models for Scholarship Recommendation System
Compatible with SQLite for local execution and PostgreSQL for production deployments.
"""
from datetime import datetime
try:
    from sqlalchemy import Column, Integer, String, Float, Text, Boolean, ForeignKey, DateTime
    from sqlalchemy.orm import declarative_base, relationship
    Base = declarative_base()
except ImportError:
    # Fallback placeholder if SQLAlchemy is not installed in local environment
    class Base:
        pass

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(255), nullable=False)
    role = Column(String(50), default="student")  # 'student' or 'admin'
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    saved_scholarships = relationship("SavedScholarship", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India")
    education_level = Column(String(100), nullable=True)
    course = Column(String(255), nullable=True)
    institution_name = Column(String(255), nullable=True)
    current_year = Column(Integer, default=1)
    academic_score = Column(Float, nullable=True)
    academic_score_type = Column(String(20), default="percentage")
    family_income = Column(Float, nullable=True)
    category = Column(String(50), default="General")
    disability_status = Column(String(50), default="No")
    skills = Column(Text, nullable=True)
    achievements = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class Scholarship(Base):
    __tablename__ = "scholarships"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    provider = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    education_levels = Column(Text, nullable=False) # JSON encoded
    courses = Column(Text, nullable=False)          # JSON encoded
    min_academic_score = Column(Float, default=0.0)
    max_family_income = Column(Float, nullable=True)
    eligible_locations = Column(Text, nullable=False)# JSON encoded
    categories = Column(Text, nullable=False)        # JSON encoded
    disability_eligible_only = Column(Integer, default=0)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="₹")
    funding_type = Column(String(50), nullable=False)
    required_documents = Column(Text, nullable=False)# JSON encoded
    application_open_date = Column(String(50), nullable=True)
    application_deadline = Column(String(50), nullable=False)
    official_url = Column(String(500), nullable=False)
    is_active = Column(Integer, default=1)
    is_verified = Column(Integer, default=1)
    last_verified_date = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SavedScholarship(Base):
    __tablename__ = "saved_scholarships"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scholarship_id = Column(Integer, ForeignKey("scholarships.id", ondelete="CASCADE"), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_scholarships")
    scholarship = relationship("Scholarship")

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scholarship_id = Column(Integer, ForeignKey("scholarships.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="Interested")
    applied_date = Column(String(50), nullable=True)
    personal_notes = Column(Text, nullable=True)
    documents_checklist = Column(Text, nullable=True) # JSON encoded
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    scholarship = relationship("Scholarship")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    admin_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)
    target_entity = Column(String(100), nullable=False)
    target_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
