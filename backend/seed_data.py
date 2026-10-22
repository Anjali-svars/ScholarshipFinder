"""
Pre-seeded realistic sample scholarships and demo student accounts
for academic evaluation and local testing.
All sample scholarships are based on standard realistic grant structures.
"""
import json
import os
import hashlib
import secrets
from datetime import datetime, date, timedelta
from database import get_connection, init_db

def hash_password(password, salt=None):
    if salt is None:
        salt = secrets.token_hex(16)
    # Using standard PBKDF2 HMAC SHA-256 for secure password storage
    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000
    ).hex()
    return pwd_hash, salt

SAMPLE_SCHOLARSHIPS = [
    {
        "name": "National Merit Academic Excellence Fellowship",
        "provider": "Ministry of Education & Academic Board",
        "description": "Prestigious merit fellowship awarded to top-ranking undergraduate students demonstrating exceptional academic consistency and scholastic leadership across higher education institutions.",
        "education_levels": json.dumps(["Undergraduate", "Postgraduate"]),
        "courses": json.dumps(["All Fields", "Engineering", "Sciences", "Commerce", "Arts"]),
        "min_academic_score": 85.0,
        "max_family_income": 800000.0,
        "eligible_locations": json.dumps(["All", "India"]),
        "categories": json.dumps(["All", "General", "OBC", "SC", "ST", "EWS"]),
        "disability_eligible_only": 0,
        "amount": 75000.0,
        "currency": "₹",
        "funding_type": "Merit-Based",
        "required_documents": json.dumps(["10th & 12th Marksheets", "Current Semester Grade Card", "Bonafide College Certificate", "ID Proof"]),
        "application_open_date": (date.today() - timedelta(days=20)).isoformat(),
        "application_deadline": (date.today() + timedelta(days=35)).isoformat(),
        "official_url": "https://scholarships.gov.in",
        "is_active": 1,
        "is_verified": 1,
        "last_verified_date": date.today().isoformat()
    },
    {
        "name": "Women in Technology & AI Leadership Award",
        "provider": "Anita Borg Institute & Tech Consortium",
        "description": "Dedicated financial grant and mentoring program supporting female students pursuing degrees in Computer Science, Artificial Intelligence, Data Science, and Information Technology.",
        "education_levels": json.dumps(["Undergraduate", "Postgraduate"]),
        "courses": json.dumps(["Computer Science", "Data Science", "Artificial Intelligence", "Information Technology", "Software Engineering"]),
        "min_academic_score": 75.0,
        "max_family_income": 1200000.0,
        "eligible_locations": json.dumps(["All", "India"]),
        "categories": json.dumps(["Women in STEM", "All"]),
        "disability_eligible_only": 0,
        "amount": 120000.0,
        "currency": "₹",
        "funding_type": "Merit-cum-Need",
        "required_documents": json.dumps(["Academic Transcripts", "Technical Portfolio / GitHub Link", "Statement of Purpose", "Recommendation Letter"]),
        "application_open_date": (date.today() - timedelta(days=15)).isoformat(),
        "application_deadline": (date.today() + timedelta(days=25)).isoformat(),
        "official_url": "https://anitab.org/awards-grants",
        "is_active": 1,
        "is_verified": 1,
        "last_verified_date": date.today().isoformat()
    },
    {
        "name": "First-Generation Scholar Opportunity Fund",
        "provider": "Vidya Poshan Foundation",
        "description": "Comprehensive tuition and living allowance support for first-generation university students from economically weaker backgrounds embarking on undergraduate degrees.",
        "education_levels": json.dumps(["Undergraduate", "Diploma"]),
        "courses": json.dumps(["All Fields", "Engineering", "Computer Science", "Commerce", "Arts", "Science"]),
        "min_academic_score": 60.0,
        "max_family_income": 350000.0,
        "eligible_locations": json.dumps(["All", "India"]),
        "categories": json.dumps(["All", "General", "OBC", "SC", "ST", "EWS"]),
        "disability_eligible_only": 0,
        "amount": 50000.0,
        "currency": "₹",
        "funding_type": "Need-Based",
        "required_documents": json.dumps(["Income Certificate (Revenue Authority)", "First Generation Declaration", "Admission Letter", "Ration Card / Proof of Residence"]),
        "application_open_date": (date.today() - timedelta(days=30)).isoformat(),
        "application_deadline": (date.today() + timedelta(days=18)).isoformat(),
        "official_url": "https://vidyaposhan.org/apply",
        "is_active": 1,
        "is_verified": 1,
        "last_verified_date": date.today().isoformat()
    },
    {
        "name": "NextGen Data Science & Machine Learning Research Grant",
        "provider": "Indian Data & Analytics Society",
        "description": "Encouraging original student research projects in big data engineering, applied statistics, statistical machine learning, and predictive computational modeling.",
        "education_levels": json.dumps(["Undergraduate", "Postgraduate", "Doctoral"]),
        "courses": json.dumps(["Data Science", "Computer Science", "Statistics", "Mathematics", "Artificial Intelligence"]),
        "min_academic_score": 80.0,
        "max_family_income": None,
        "eligible_locations": json.dumps(["All", "India"]),
        "categories": json.dumps(["All"]),
        "disability_eligible_only": 0,
        "amount": 100000.0,
        "currency": "₹",
        "funding_type": "Merit-Based",
        "required_documents": json.dumps(["Research Synopsis", "Academic Transcripts", "Faculty Endorsement Letter", "CV with Project Links"]),
        "application_open_date": (date.today() - timedelta(days=10)).isoformat(),
        "application_deadline": (date.today() + timedelta(days=48)).isoformat(),
        "official_url": "https://datascience-society.in/grants",
        "is_active": 1,
        "is_verified": 1,
        "last_verified_date": date.today().isoformat()
    },
    {
        "name": "Dr. APJ Abdul Kalam STEM Talent Scholarship",
        "provider": "Science & Technology Innovation Council",
        "description": "Prestigious state and national initiative promoting bright innovators in Aerospace, Mechanical, Electrical, Computing, and Pure Sciences with annual stipend support.",
        "education_levels": json.dumps(["Undergraduate"]),
        "courses": json.dumps(["Engineering", "Computer Science", "Physics", "Chemistry", "Mathematics", "Robotics"]),
        "min_academic_score": 78.0,
        "max_family_income": 600000.0,
        "eligible_locations": json.dumps(["All", "India"]),
        "categories": json.dumps(["All", "OBC", "SC", "ST", "General"]),
        "disability_eligible_only": 0,
        "amount": 60000.0,
        "currency": "₹",
        "funding_type": "Merit-cum-Need",
        "required_documents": json.dumps(["Marksheets", "Income Certificate", "Innovation/Project Summary", "Institution Identity Card"]),
        "application_open_date": (date.today() - timedelta(days=25)).isoformat(),
        "application_deadline": (date.today() + timedelta(days=12)).isoformat(),
        "official_url": "https://dst.gov.in/stem-fellowships",
        "is_active": 1,
        "is_verified": 1,
        "last_verified_date": date.today().isoformat()
    },
    {
        "name": "Differently-Abled Student Empowerment Assistance",
        "provider": "Department of Empowerment of Persons with Disabilities",
        "description": "Comprehensive scholarship scheme providing tuition waiver, assistive device allowance, and monthly maintenance allowance for students with benchmark disabilities.",
        "education_levels": json.dumps(["High School", "Undergraduate", "Postgraduate", "Diploma"]),
        "courses": json.dumps(["All Fields", "Computer Science", "Arts", "Commerce", "Engineering"]),
        "min_academic_score": 50.0,
        "max_family_income": 800000.0,
        "eligible_locations": json.dumps(["All", "India"]),
        "categories": json.dumps(["All"]),
        "disability_eligible_only": 1,
        "amount": 80000.0,
        "currency": "₹",
        "funding_type": "Special Category",
        "required_documents": json.dumps(["UDID Card / Disability Certificate (40%+)", "Academic Record", "College Fee Receipt", "Bank Passbook"]),
        "application_open_date": (date.today() - timedelta(days=40)).isoformat(),
        "application_deadline": (date.today() + timedelta(days=60)).isoformat(),
        "official_url": "https://disabilityaffairs.gov.in/scholarships",
        "is_active": 1,
        "is_verified": 1,
        "last_verified_date": date.today().isoformat()
    },
    {
        "name": "Karnataka & South Zone Post-Matric State Assistance",
        "provider": "State Department of Social Welfare",
        "description": "Financial assistance program for meritorious students residing in Karnataka and southern states pursuing professional and technical undergraduate programs.",
        "education_levels": json.dumps(["Undergraduate", "Postgraduate", "Diploma"]),
        "courses": json.dumps(["All Fields", "Engineering", "Medicine", "Management", "Science"]),
        "min_academic_score": 60.0,
        "max_family_income": 250000.0,
        "eligible_locations": json.dumps(["Karnataka", "Tamil Nadu", "Kerala", "Andhra Pradesh", "Telangana"]),
        "categories": json.dumps(["OBC", "SC", "ST", "Minority", "EWS"]),
        "disability_eligible_only": 0,
        "amount": 45000.0,
        "currency": "₹",
        "funding_type": "Need-Based",
        "required_documents": json.dumps(["Domicile Certificate", "Caste & Income Certificate (RD Number)", "Fee Receipt", "Aadhaar Card"]),
        "application_open_date": (date.today() - timedelta(days=5)).isoformat(),
        "application_deadline": (date.today() + timedelta(days=50)).isoformat(),
        "official_url": "https://ssp.postmatric.karnataka.gov.in",
        "is_active": 1,
        "is_verified": 1,
        "last_verified_date": date.today().isoformat()
    },
    {
        "name": "Future Medical & Healthcare Leaders Scholarship",
        "provider": "Apex Global Health Foundation",
        "description": "Supporting dedicated students in Medicine (MBBS), Nursing, Pharmacy, Biomedical Engineering, and Allied Health Sciences with tuition grants.",
        "education_levels": json.dumps(["Undergraduate", "Postgraduate"]),
        "courses": json.dumps(["Medicine", "Biotechnology", "Pharmacy", "Biomedical Engineering", "Nursing"]),
        "min_academic_score": 82.0,
        "max_family_income": 700000.0,
        "eligible_locations": json.dumps(["All", "India"]),
        "categories": json.dumps(["All"]),
        "disability_eligible_only": 0,
        "amount": 90000.0,
        "currency": "₹",
        "funding_type": "Merit-cum-Need",
        "required_documents": json.dumps(["NEET/Entrance Rank Card", "Semester Marksheets", "Income Verification", "Dean Recommendation"]),
        "application_open_date": (date.today() - timedelta(days=12)).isoformat(),
        "application_deadline": (date.today() + timedelta(days=22)).isoformat(),
        "official_url": "https://healthfoundation.org.in/fellowships",
        "is_active": 1,
        "is_verified": 1,
        "last_verified_date": date.today().isoformat()
    },
    {
        "name": "Renewable Energy & Climate Tech Innovation Grant",
        "provider": "Clean Energy Sustainable Council",
        "description": "Targeted at undergraduate and postgraduate engineering students developing breakthrough capstone projects or research in solar, battery tech, wind, and green hydrogen.",
        "education_levels": json.dumps(["Undergraduate", "Postgraduate", "Doctoral"]),
        "courses": json.dumps(["Engineering", "Electrical Engineering", "Mechanical Engineering", "Environmental Science", "Energy Studies"]),
        "min_academic_score": 70.0,
        "max_family_income": None,
        "eligible_locations": json.dumps(["All", "India"]),
        "categories": json.dumps(["All"]),
        "disability_eligible_only": 0,
        "amount": 85000.0,
        "currency": "₹",
        "funding_type": "Merit-Based",
        "required_documents": json.dumps(["Project Abstract", "Faculty Guide Endorsement", "College Marksheets", "Statement of Impact"]),
        "application_open_date": (date.today() - timedelta(days=8)).isoformat(),
        "application_deadline": (date.today() + timedelta(days=40)).isoformat(),
        "official_url": "https://cleantechcouncil.org/grants",
        "is_active": 1,
        "is_verified": 1,
        "last_verified_date": date.today().isoformat()
    },
    {
        "name": "Humanities, Policy & Creative Writing Fellowship",
        "provider": "National Institute of Arts & Letters",
        "description": "Fellowship supporting students pursuing Bachelor's or Master's degrees in Literature, History, Sociology, Public Policy, Journalism, and Fine Arts.",
        "education_levels": json.dumps(["Undergraduate", "Postgraduate"]),
        "courses": json.dumps(["Arts", "Humanities", "Literature", "Journalism", "Public Policy", "Social Sciences"]),
        "min_academic_score": 70.0,
        "max_family_income": 600000.0,
        "eligible_locations": json.dumps(["All", "India"]),
        "categories": json.dumps(["All"]),
        "disability_eligible_only": 0,
        "amount": 55000.0,
        "currency": "₹",
        "funding_type": "Merit-cum-Need",
        "required_documents": json.dumps(["Writing Samples / Essay", "Academic Records", "Letter of Reference", "ID Certificate"]),
        "application_open_date": (date.today() - timedelta(days=14)).isoformat(),
        "application_deadline": (date.today() + timedelta(days=30)).isoformat(),
        "official_url": "https://arts-letters.org/fellowships",
        "is_active": 1,
        "is_verified": 1,
        "last_verified_date": date.today().isoformat()
    }
]

def seed_database():
    """Initializes tables and seeds initial users and scholarships if empty."""
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    # Check if admin user exists
    cursor.execute("SELECT id FROM users WHERE email = ?", ("admin@scholarshipfinder.edu",))
    if not cursor.fetchone():
        admin_hash, admin_salt = hash_password("Admin@1234")
        cursor.execute("""
            INSERT INTO users (email, password_hash, salt, role, created_at)
            VALUES (?, ?, ?, 'admin', ?)
        """, ("admin@scholarshipfinder.edu", admin_hash, admin_salt, datetime.now().isoformat()))
        print("Created default administrator: admin@scholarshipfinder.edu")

    # Check if demo student exists
    cursor.execute("SELECT id FROM users WHERE email = ?", ("student@scholarshipfinder.edu",))
    demo_user = cursor.fetchone()
    if not demo_user:
        stu_hash, stu_salt = hash_password("Student@1234")
        cursor.execute("""
            INSERT INTO users (email, password_hash, salt, role, created_at)
            VALUES (?, ?, ?, 'student', ?)
        """, ("student@scholarshipfinder.edu", stu_hash, stu_salt, datetime.now().isoformat()))
        user_id = cursor.lastrowid

        # Insert rich demo profile for student
        cursor.execute("""
            INSERT INTO student_profiles (
                user_id, full_name, state, country, education_level,
                course, institution_name, current_year, academic_score,
                academic_score_type, family_income, category, disability_status,
                skills, achievements, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            "Ananya Sharma",
            "Karnataka",
            "India",
            "Undergraduate",
            "Computer Science & Engineering",
            "National Institute of Technology",
            3,
            86.5,
            "percentage",
            420000.0,
            "General",
            "No",
            "Python, Machine Learning, Data Structures, Web Development, Leadership",
            "First place in University Hackathon 2025; President of Women in Tech Campus Chapter; Published paper on predictive models.",
            datetime.now().isoformat()
        ))
        print("Created default student profile: student@scholarshipfinder.edu")

    # Seed scholarships if count < 5
    cursor.execute("SELECT COUNT(*) as count FROM scholarships")
    count = cursor.fetchone()["count"]
    if count == 0:
        for s in SAMPLE_SCHOLARSHIPS:
            cursor.execute("""
                INSERT INTO scholarships (
                    name, provider, description, education_levels, courses,
                    min_academic_score, max_family_income, eligible_locations,
                    categories, disability_eligible_only, amount, currency,
                    funding_type, required_documents, application_open_date,
                    application_deadline, official_url, is_active, is_verified,
                    last_verified_date, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                s["name"], s["provider"], s["description"], s["education_levels"], s["courses"],
                s["min_academic_score"], s["max_family_income"], s["eligible_locations"],
                s["categories"], s["disability_eligible_only"], s["amount"], s["currency"],
                s["funding_type"], s["required_documents"], s["application_open_date"],
                s["application_deadline"], s["official_url"], s["is_active"], s["is_verified"],
                s["last_verified_date"], datetime.now().isoformat()
            ))
        print(f"Seeded {len(SAMPLE_SCHOLARSHIPS)} realistic scholarships into database.")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    seed_database()
