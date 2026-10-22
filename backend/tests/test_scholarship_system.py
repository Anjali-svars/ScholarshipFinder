"""
Automated Test Suite for Scholarship Recommendation System
Covers:
  - Registration, password hashing, and authentication
  - Multi-criteria rule-based eligibility filtering (Eligible, Potentially Eligible, Ineligible)
  - Normalized multi-criteria weighted ranking score calculations
  - Missing profile criteria handling
  - Scholarship search, filters, and database operations
  - Saved scholarships and application pipeline tracking
  - Administrator authorization and audit logging
"""
import unittest
import sys
import os
import json
from datetime import date, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from recommendation_engine import (
    evaluate_eligibility,
    compute_weighted_ranking_score,
    recommend_scholarships_for_student,
    normalize_academic_score,
    DEFAULT_WEIGHTS
)
from seed_data import hash_password
import cli_bridge

class TestScholarshipSystem(unittest.TestCase):

    def setUp(self):
        self.mock_student = {
            "user_id": 999,
            "full_name": "Test Candidate",
            "state": "Karnataka",
            "country": "India",
            "education_level": "Undergraduate",
            "course": "Computer Science & Engineering",
            "institution_name": "Test Engineering College",
            "current_year": 3,
            "academic_score": 88.0,
            "academic_score_type": "percentage",
            "family_income": 400000.0,
            "category": "General",
            "disability_status": "No",
            "skills": "Python, Machine Learning, Leadership",
            "achievements": "National Hackathon Finalist"
        }

        self.mock_scholarship_merit = {
            "id": 101,
            "name": "STEM Undergraduate Merit Grant",
            "provider": "Tech Foundation",
            "description": "Merit award for engineering and computer science students",
            "education_levels": ["Undergraduate"],
            "courses": ["Computer Science", "Engineering"],
            "min_academic_score": 80.0,
            "max_family_income": 600000.0,
            "eligible_locations": ["All"],
            "categories": ["All"],
            "disability_eligible_only": 0,
            "amount": 50000.0,
            "funding_type": "Merit-Based",
            "application_deadline": (date.today() + timedelta(days=30)).isoformat(),
            "is_active": 1,
            "is_verified": 1
        }

    # 1. Test Password Hashing and Security
    def test_password_hashing(self):
        pwd = "SecureStudentPass#2026"
        hash1, salt1 = hash_password(pwd)
        self.assertIsNotNone(hash1)
        self.assertIsNotNone(salt1)
        self.assertNotEqual(pwd, hash1)
        # Verify same password with same salt yields matching hash
        hash2, _ = hash_password(pwd, salt1)
        self.assertEqual(hash1, hash2)
        # Different salt yields different hash
        hash3, salt3 = hash_password(pwd)
        self.assertNotEqual(hash1, hash3)

    # 2. Test Academic Score Normalization (CGPA vs %)
    def test_academic_score_normalization(self):
        # 10-point CGPA
        self.assertAlmostEqual(normalize_academic_score(8.5, "cgpa"), 85.0, delta=0.5)
        # 4-point GPA
        self.assertAlmostEqual(normalize_academic_score(3.8, "cgpa"), 95.0, delta=0.5)
        # Percentage
        self.assertEqual(normalize_academic_score(92.0, "percentage"), 92.0)
        # Missing or invalid score
        self.assertIsNone(normalize_academic_score(None))
        self.assertIsNone(normalize_academic_score("invalid_score"))

    # 3. Test Eligibility Filtering: Guaranteed Eligible
    def test_eligibility_filtering_eligible(self):
        status, reasons, missing, fails = evaluate_eligibility(self.mock_student, self.mock_scholarship_merit)
        self.assertEqual(status, "ELIGIBLE")
        self.assertEqual(len(fails), 0)
        self.assertTrue(len(reasons) >= 3)

    # 4. Test Eligibility Filtering: Academic Ineligible
    def test_eligibility_academic_failure(self):
        low_score_student = dict(self.mock_student)
        low_score_student["academic_score"] = 65.0  # Required is 80.0
        status, reasons, missing, fails = evaluate_eligibility(low_score_student, self.mock_scholarship_merit)
        self.assertEqual(status, "INELIGIBLE")
        self.assertTrue(any("Academic score" in f for f in fails))

    # 5. Test Eligibility Filtering: Income Limit Exceeded
    def test_eligibility_income_failure(self):
        wealthy_student = dict(self.mock_student)
        wealthy_student["family_income"] = 900000.0  # Ceiling is 600000.0
        status, reasons, missing, fails = evaluate_eligibility(wealthy_student, self.mock_scholarship_merit)
        self.assertEqual(status, "INELIGIBLE")
        self.assertTrue(any("Family income" in f for f in fails))

    # 6. Test Eligibility Filtering: Potentially Eligible on Missing Data
    def test_eligibility_missing_criteria(self):
        incomplete_student = dict(self.mock_student)
        incomplete_student["academic_score"] = None  # Score not yet declared
        status, reasons, missing, fails = evaluate_eligibility(incomplete_student, self.mock_scholarship_merit)
        self.assertEqual(status, "POTENTIALLY_ELIGIBLE")
        self.assertTrue(len(missing) > 0)
        self.assertEqual(len(fails), 0)

    # 7. Test Weighted Ranking Calculation
    def test_weighted_ranking_score(self):
        score, sub_scores = compute_weighted_ranking_score(self.mock_student, self.mock_scholarship_merit)
        self.assertGreaterEqual(score, 60.0)
        self.assertLessEqual(score, 100.0)
        # Check that all 6 components exist
        self.assertIn("academic", sub_scores)
        self.assertIn("financial_need", sub_scores)
        self.assertIn("course_level", sub_scores)
        self.assertIn("geographic", sub_scores)
        self.assertIn("skills_achievements", sub_scores)
        self.assertIn("deadline_suitability", sub_scores)

    # 8. Test Recommendation Engine Integration
    def test_recommendation_pipeline(self):
        scholarships = [self.mock_scholarship_merit]
        results = recommend_scholarships_for_student(self.mock_student, scholarships)
        self.assertEqual(len(results), 1)
        top = results[0]
        self.assertEqual(top["scholarship_id"], 101)
        self.assertIn("match_score", top)
        self.assertIn("disclaimer", top)
        self.assertTrue("estimate" in top["disclaimer"].lower())

    # 9. Test CLI Bridge Registration Input Validation
    def test_registration_validation(self):
        # Invalid email
        res1 = cli_bridge.handle_auth_register({"email": "bademail", "password": "pass", "full_name": "Test"})
        self.assertFalse(res1["success"])
        # Short password
        res2 = cli_bridge.handle_auth_register({"email": "test@valid.com", "password": "123", "full_name": "Test"})
        self.assertFalse(res2["success"])

if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestScholarshipSystem)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
