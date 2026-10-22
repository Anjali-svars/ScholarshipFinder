# Scholarship Recommendation System for Students Using Python
**Academic Evaluation & Mini-Project Demonstration (B.Sc. Data Science / Full-Stack Engineering)**

An intelligent, multi-criteria scholarship recommendation and tracking system for students. Built with a two-stage Data Science recommendation engine (Rule-Based Eligibility Filtering + Multi-Criteria Normalized Weighted Ranking), an interactive responsive web interface, and full RESTful API architecture.

---

## 1. System Architecture & Methodology

### Stage 1: Multi-Criteria Rule-Based Eligibility Filtering
Filters candidates across strict structural constraints to partition scholarships into three clear tiers:
- **`ELIGIBLE`**: The student meets all mandatory criteria (education level, minimum academic threshold, family income ceiling, course discipline, geographic residency, category quotas, disability quota).
- **`POTENTIALLY_ELIGIBLE`**: Data fields are unverified or omitted in the student profile (e.g. state domicile not yet confirmed, income certificate pending, or category not declared). The system flags these specific items for student action.
- **`INELIGIBLE`**: Explicit violation of a strict condition (e.g. academic marks below minimum threshold, family income exceeds ceiling, or course incompatible).

### Stage 2: Multi-Criteria Normalized Weighted Ranking
For eligible and potentially eligible scholarships, a normalized score (0–100%) is calculated using configurable weights:

$$\text{Final Score} = \sum_{i=1}^{6} (w_i \times S_i) \times 100$$

Where $\sum w_i = 1.0$:
1. **Academic Fit ($w_1 = 0.30$)**: Measures academic performance surplus above the minimum threshold:
   $$S_{\text{academic}} = 0.70 + 0.30 \times \min\left(1.0, \frac{\text{Student Score} - \text{Min Score}}{30}\right)$$
2. **Financial-Need Fit ($w_2 = 0.25$)**: Inversely proportional to family income ratio for need-based programs:
   $$S_{\text{need}} = 1.0 - \left(0.65 \times \frac{\text{Family Income}}{\text{Max Income Ceiling}}\right)$$
3. **Course & Education Level Fit ($w_3 = 0.20$)**: 1.0 for exact major/specialization match, 0.85 for open fields, 0.70 for allied STEM disciplines.
4. **Geographic Domicile Fit ($w_4 = 0.10$)**: 1.0 for state-level residency matches, 0.80 for national/all-India grants.
5. **Skills & Achievements Fit ($w_5 = 0.10$)**: Keyword intersection between student portfolio (e.g., coding, research, hackathon, leadership) and grant objectives.
6. **Deadline Suitability ($w_6 = 0.05$)**: Priority boost for opportunities with deadlines in the 7–45 day window.

*Disclaimer: Match scores represent analytical estimates based on student profile attributes and do not guarantee grant awards.*

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion, Plus Jakarta Sans & JetBrains Mono typography.
- **Backend**: Python 3.10 with FastAPI (RESTful endpoints, Pydantic schemas, Swagger docs) & Express Full-Stack Bridge.
- **Data Science & Recommendation Engine**: Python rule-based filter + weighted vector score calculations.
- **Database**: SQLite3 (Local & Evaluation) with SQLAlchemy models supporting PostgreSQL in production.
- **Testing**: Automated Python unit test suite (`unittest`).

---

## 3. Quick Start & Execution Commands

### Prerequisites
- Python 3.10+
- Node.js 18+

### Running the Live Web Application (Full-Stack Mode)
```bash
# 1. Install Node dependencies
npm install

# 2. Initialize and Seed the Database
python3 backend/seed_data.py

# 3. Start the Full-Stack Application (runs on http://localhost:3000)
npm run dev
```

### Running the FastAPI Backend Standalone (FastAPI Mode)
```bash
# 1. Install Python dependencies
pip install -r backend/requirements.txt

# 2. Launch FastAPI with Uvicorn
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# 3. Open Interactive Swagger API Documentation
# Visit http://localhost:8000/docs
```

### Running the Automated Test Suite
```bash
python3 backend/tests/test_scholarship_system.py
```

---

## 4. Default Demo Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Demo Student** | `student@scholarshipfinder.edu` | `Student@1234` | B.Tech CS Student, 86.5%, ₹4.2L Income |
| **Administrator** | `admin@scholarshipfinder.edu` | `Admin@1234` | Full CRUD, verification, CSV export, audit logs |

---

## 5. Deployment Guide (Vercel & Cloud PostgreSQL)

### Vercel Deployment Architecture
1. **Frontend**: Deploy the React SPA to Vercel by connecting your GitHub repository.
2. **Backend**:
   - Option A: Deploy the FastAPI service to Render / Railway / Google Cloud Run.
   - Option B: Use Vercel Serverless Functions via `/api` Python runtime.
3. **Database**: Provision a managed PostgreSQL instance (e.g., Supabase or Neon) and set:
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/scholarship_db"
   ```
4. Set the environment variable on Vercel:
   ```bash
   VITE_API_URL="https://your-backend-service.com"
   ```
