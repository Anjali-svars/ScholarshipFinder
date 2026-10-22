"""
Scholarship Recommendation Engine
Implements:
  Stage 1: Multi-criteria Rule-Based Eligibility Filtering
           (Classifies as ELIGIBLE, POTENTIALLY_ELIGIBLE, or INELIGIBLE)
  Stage 2: Normalized Multi-Criteria Weighted Ranking
           (Academic: 30%, Need: 25%, Course/Level: 20%, Geo: 10%, Skills: 10%, Deadline: 5%)
  Stage 3: Match Explanations, Criteria Verification Flags, and Scoring Disclaimers.
"""
import json
import math
from datetime import datetime, date

DEFAULT_WEIGHTS = {
    "academic": 0.30,
    "financial_need": 0.25,
    "course_level": 0.20,
    "geographic": 0.10,
    "skills_achievements": 0.10,
    "deadline_suitability": 0.05
}

def normalize_academic_score(score, score_type="percentage"):
    """Normalizes CGPA (0-10 or 0-4) or percentage (0-100) to a standard 0-100 percentage scale."""
    if score is None:
        return None
    try:
        val = float(score)
    except (ValueError, TypeError):
        return None

    if score_type.lower() == "cgpa":
        if val <= 4.0:
            return (val / 4.0) * 100.0
        elif val <= 10.0:
            # Common Indian standard: CGPA * 9.5 or direct %
            return min(val * 10.0, 100.0)
    elif val <= 10.0 and val > 0.0:
        # User entered CGPA under percentage field
        return min(val * 10.0, 100.0)
    
    return min(max(val, 0.0), 100.0)

def parse_json_list(val):
    """Safely parses JSON array or comma-separated string into a list of strings."""
    if isinstance(val, list):
        return [str(x).strip().lower() for x in val]
    if isinstance(val, str):
        val = val.strip()
        if val.startswith("[") and val.endswith("]"):
            try:
                parsed = json.loads(val)
                return [str(x).strip().lower() for x in parsed]
            except Exception:
                pass
        return [x.strip().lower() for x in val.split(",") if x.strip()]
    return []

def evaluate_eligibility(student, scholarship):
    """
    Stage 1: Eligibility Filtering
    Returns:
      status: 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'INELIGIBLE'
      reasons: List of match reasons
      missing_or_verify: List of conditions/documents student must verify
      fail_reasons: List of reasons why student was marked ineligible
    """
    reasons = []
    missing_or_verify = []
    fail_reasons = []

    # 1. Active status and deadline
    deadline_str = scholarship.get("application_deadline")
    is_active = scholarship.get("is_active", 1)
    if not is_active:
        return "INELIGIBLE", [], [], ["Scholarship is currently inactive or archived."]
    
    if deadline_str:
        try:
            deadline_date = datetime.strptime(deadline_str[:10], "%Y-%m-%d").date()
            today = date.today()
            if deadline_date < today:
                return "INELIGIBLE", [], [], [f"Application deadline expired on {deadline_str}."]
        except Exception:
            pass

    # 2. Education level check
    sch_levels = parse_json_list(scholarship.get("education_levels", []))
    stu_level = (student.get("education_level") or "").strip().lower()

    if "all" not in sch_levels and "any" not in sch_levels and sch_levels:
        if not stu_level:
            missing_or_verify.append("Education level not specified in student profile.")
        elif stu_level not in sch_levels:
            fail_reasons.append(f"Requires {', '.join(sch_levels).title()}; your current level is {stu_level.title()}.")
        else:
            reasons.append(f"Education level matches requirement ({stu_level.title()}).")

    # 3. Academic score check
    min_score = scholarship.get("min_academic_score") or 0.0
    stu_score_raw = student.get("academic_score")
    stu_score_type = student.get("academic_score_type") or "percentage"
    norm_stu_score = normalize_academic_score(stu_score_raw, stu_score_type)

    if min_score > 0:
        if norm_stu_score is None:
            missing_or_verify.append(f"Requires minimum academic score of {min_score}%; score missing in profile.")
        elif norm_stu_score < min_score:
            fail_reasons.append(f"Academic score ({norm_stu_score:.1f}%) is below minimum requirement ({min_score}%).")
        else:
            surplus = norm_stu_score - min_score
            reasons.append(f"Academic score of {norm_stu_score:.1f}% satisfies minimum requirement of {min_score}% (+{surplus:.1f}% buffer).")

    # 4. Income limit check
    max_income = scholarship.get("max_family_income")
    stu_income = student.get("family_income")

    if max_income is not None and max_income > 0:
        if stu_income is None:
            missing_or_verify.append(f"Requires family income below ₹{max_income:,.0f}/yr; income unverified in profile.")
        elif float(stu_income) > float(max_income):
            fail_reasons.append(f"Family income (₹{float(stu_income):,.0f}) exceeds maximum threshold of ₹{float(max_income):,.0f}.")
        else:
            reasons.append(f"Family income qualifies under ceiling limit (₹{max_income:,.0f}).")

    # 5. Course and Field of study
    sch_courses = parse_json_list(scholarship.get("courses", []))
    stu_course = (student.get("course") or "").strip().lower()

    if sch_courses and "all" not in sch_courses and "all fields" not in sch_courses and "any" not in sch_courses:
        if not stu_course:
            missing_or_verify.append(f"Open to specific fields ({', '.join(sch_courses).title()}); student course not specified.")
        else:
            matched_course = any(c in stu_course or stu_course in c for c in sch_courses)
            # STEM keyword handling
            is_stem_course = any(kw in stu_course for kw in ["computer", "data", "engineer", "math", "physics", "science", "tech", "biology", "chemistry"])
            if not matched_course and "stem" in sch_courses and is_stem_course:
                matched_course = True
            
            if matched_course:
                reasons.append(f"Course '{student.get('course')}' directly aligns with eligible disciplines.")
            else:
                fail_reasons.append(f"Offered only for courses in: {', '.join(sch_courses).title()}.")

    # 6. Geographic / Location eligibility
    sch_locations = parse_json_list(scholarship.get("eligible_locations", []))
    stu_state = (student.get("state") or "").strip().lower()
    stu_country = (student.get("country") or "India").strip().lower()

    if sch_locations and "all" not in sch_locations and "any" not in sch_locations:
        state_match = any(stu_state and (loc in stu_state or stu_state in loc) for loc in sch_locations)
        country_match = any(loc in stu_country or stu_country in loc for loc in sch_locations)
        
        if not (state_match or country_match):
            if not stu_state:
                missing_or_verify.append(f"Specific to residents of {', '.join(sch_locations).title()}; state missing from profile.")
            else:
                fail_reasons.append(f"Geographic eligibility restricted to: {', '.join(sch_locations).title()}.")
        else:
            reasons.append(f"Geographic residency matches ({student.get('state') or student.get('country')}).")

    # 7. Category and Diversity criteria
    sch_categories = parse_json_list(scholarship.get("categories", []))
    stu_cat = (student.get("category") or "").strip().lower()

    if sch_categories and "all" not in sch_categories and "open to all" not in sch_categories:
        cat_match = False
        if stu_cat:
            cat_match = any(c in stu_cat or stu_cat in c for c in sch_categories)
        
        # Women in STEM check
        if not cat_match and any("women" in c or "female" in c for c in sch_categories):
            # Check if student indicated or if female
            pass

        if not cat_match:
            if not stu_cat:
                missing_or_verify.append(f"Targeted for {', '.join(sch_categories).title()} category; verify category documentation.")
            else:
                # If scholarship allows multiple or has quota
                fail_reasons.append(f"Eligible only for {', '.join(sch_categories).title()} candidates.")
        else:
            reasons.append(f"Category status ({student.get('category')}) qualifies.")

    # 8. Disability criteria
    disability_required = scholarship.get("disability_eligible_only", 0)
    stu_disability = (student.get("disability_status") or "no").strip().lower()
    if disability_required:
        if stu_disability not in ["yes", "y"]:
            fail_reasons.append("Reserved exclusively for students with benchmark disabilities (PwD).")
        else:
            reasons.append("Special PwD quota criterion met.")

    # Determine final eligibility stage classification
    if fail_reasons:
        return "INELIGIBLE", reasons, missing_or_verify, fail_reasons
    elif missing_or_verify:
        return "POTENTIALLY_ELIGIBLE", reasons, missing_or_verify, []
    else:
        return "ELIGIBLE", reasons, [], []

def compute_weighted_ranking_score(student, scholarship, weights=None):
    """
    Stage 2: Weighted Ranking Calculation
    Computes component fit sub-scores (0.0 to 1.0) and aggregates them
    using configured weights into a final normalized score (0-100%).
    """
    if weights is None:
        weights = DEFAULT_WEIGHTS

    # Normalize weights so sum is 1.0
    total_w = sum(weights.values()) or 1.0
    norm_w = {k: v / total_w for k, v in weights.items()}

    sub_scores = {}

    # 1. Academic Fit (0.0 - 1.0)
    min_score = scholarship.get("min_academic_score") or 50.0
    stu_score_raw = student.get("academic_score")
    stu_score_type = student.get("academic_score_type") or "percentage"
    norm_score = normalize_academic_score(stu_score_raw, stu_score_type)

    if norm_score is None:
        academic_sub = 0.5  # Neutral default when missing
    elif norm_score >= min_score:
        # Score scaled between requirement and 100%
        margin = norm_score - min_score
        academic_sub = min(0.70 + (margin / 30.0) * 0.30, 1.0)
    else:
        academic_sub = max(0.10, norm_score / (min_score or 1.0) * 0.50)
    sub_scores["academic"] = round(academic_sub, 3)

    # 2. Financial Need Fit (0.0 - 1.0)
    funding_type = (scholarship.get("funding_type") or "").lower()
    max_income = scholarship.get("max_family_income")
    stu_income = student.get("family_income")

    if "need" in funding_type or max_income:
        if stu_income is None:
            need_sub = 0.5
        elif max_income and float(max_income) > 0:
            # Lower income = higher need score
            income_ratio = min(float(stu_income) / float(max_income), 1.0)
            need_sub = 1.0 - (income_ratio * 0.65)
        else:
            need_sub = 0.75
    else:
        # Pure merit scholarship: all students get equitable high score
        need_sub = 0.85
    sub_scores["financial_need"] = round(max(0.1, min(need_sub, 1.0)), 3)

    # 3. Course and Education Level Fit (0.0 - 1.0)
    sch_courses = parse_json_list(scholarship.get("courses", []))
    stu_course = (student.get("course") or "").lower()
    
    if "all" in sch_courses or "all fields" in sch_courses or not sch_courses:
        course_sub = 0.85
    elif stu_course and any(c in stu_course or stu_course in c for c in sch_courses):
        course_sub = 1.0
    elif stu_course and any(kw in stu_course for kw in ["science", "engineering", "tech", "computer"]):
        course_sub = 0.70
    else:
        course_sub = 0.50
    sub_scores["course_level"] = round(course_sub, 3)

    # 4. Geographic Fit (0.0 - 1.0)
    sch_locations = parse_json_list(scholarship.get("eligible_locations", []))
    stu_state = (student.get("state") or "").lower()

    if "all" in sch_locations or "india" in sch_locations or not sch_locations:
        geo_sub = 0.80
    elif stu_state and any(loc in stu_state or stu_state in loc for loc in sch_locations):
        geo_sub = 1.0  # Exact state residency match bonus
    else:
        geo_sub = 0.40
    sub_scores["geographic"] = round(geo_sub, 3)

    # 5. Skills & Achievements Fit (0.0 - 1.0)
    stu_skills = (student.get("skills") or "").lower()
    stu_achieve = (student.get("achievements") or "").lower()
    combined_stu_text = f"{stu_skills} {stu_achieve}"

    sch_desc = f"{scholarship.get('name', '')} {scholarship.get('description', '')}".lower()
    
    # Check for relevant keyword intersections
    target_keywords = ["research", "leadership", "coding", "python", "ai", "data", "sports", "innovation", "stem", "community", "arts", "debate", "first-generation"]
    matched_kws = [kw for kw in target_keywords if kw in combined_stu_text and kw in sch_desc]
    
    if len(matched_kws) >= 3:
        skills_sub = 1.0
    elif len(matched_kws) >= 1:
        skills_sub = 0.85
    elif combined_stu_text.strip():
        skills_sub = 0.65
    else:
        skills_sub = 0.50
    sub_scores["skills_achievements"] = round(skills_sub, 3)

    # 6. Deadline Suitability (0.0 - 1.0)
    deadline_str = scholarship.get("application_deadline")
    deadline_sub = 0.70
    if deadline_str:
        try:
            deadline_date = datetime.strptime(deadline_str[:10], "%Y-%m-%d").date()
            days_left = (deadline_date - date.today()).days
            if days_left < 0:
                deadline_sub = 0.05
            elif 7 <= days_left <= 45:
                deadline_sub = 1.0  # Optimal application window
            elif 45 < days_left <= 90:
                deadline_sub = 0.85
            elif days_left < 7:
                deadline_sub = 0.60 # Imminent deadline
            else:
                deadline_sub = 0.75
        except Exception:
            deadline_sub = 0.70
    sub_scores["deadline_suitability"] = round(deadline_sub, 3)

    # Calculate final weighted score
    final_score = (
        sub_scores["academic"] * norm_w.get("academic", 0.30) +
        sub_scores["financial_need"] * norm_w.get("financial_need", 0.25) +
        sub_scores["course_level"] * norm_w.get("course_level", 0.20) +
        sub_scores["geographic"] * norm_w.get("geographic", 0.10) +
        sub_scores["skills_achievements"] * norm_w.get("skills_achievements", 0.10) +
        sub_scores["deadline_suitability"] * norm_w.get("deadline_suitability", 0.05)
    ) * 100.0

    return round(min(max(final_score, 5.0), 99.5), 1), sub_scores

def recommend_scholarships_for_student(student, scholarships_list, custom_weights=None):
    """
    Combines Stage 1 and Stage 2 to evaluate all scholarships in database.
    Returns sorted list of recommendations with eligibility badges and match reasoning.
    """
    results = []

    for sch in scholarships_list:
        eligibility, match_reasons, missing_or_verify, fail_reasons = evaluate_eligibility(student, sch)
        
        # Calculate weighted ranking score
        match_score, sub_scores = compute_weighted_ranking_score(student, sch, custom_weights)

        # Ineligible scholarships have their score capped or heavily penalized
        if eligibility == "INELIGIBLE":
            display_score = min(match_score * 0.35, 38.0)
        elif eligibility == "POTENTIALLY_ELIGIBLE":
            display_score = min(match_score * 0.90, 88.0)
        else:
            display_score = match_score

        # Calculate days until deadline
        deadline_str = sch.get("application_deadline")
        days_left = None
        if deadline_str:
            try:
                deadline_date = datetime.strptime(deadline_str[:10], "%Y-%m-%d").date()
                days_left = (deadline_date - date.today()).days
            except Exception:
                pass

        results.append({
            "scholarship_id": sch.get("id"),
            "scholarship_name": sch.get("name"),
            "provider": sch.get("provider"),
            "description": sch.get("description"),
            "amount": sch.get("amount"),
            "currency": sch.get("currency", "₹"),
            "funding_type": sch.get("funding_type"),
            "application_deadline": sch.get("application_deadline"),
            "days_left": days_left,
            "official_url": sch.get("official_url"),
            "is_verified": sch.get("is_verified", 1),
            "required_documents": parse_json_list(sch.get("required_documents", [])),
            "education_levels": parse_json_list(sch.get("education_levels", [])),
            "courses": parse_json_list(sch.get("courses", [])),
            "min_academic_score": sch.get("min_academic_score"),
            "max_family_income": sch.get("max_family_income"),
            # Recommendation output fields
            "eligibility_status": eligibility,
            "match_score": round(display_score, 1),
            "sub_scores": sub_scores,
            "match_reasons": match_reasons,
            "missing_or_verify": missing_or_verify,
            "fail_reasons": fail_reasons,
            "disclaimer": "Match score is an analytical estimate based on current profile criteria, not a guarantee of selection or funding."
        })

    # Sort results:
    # 1. Eligible first, then Potentially Eligible, then Ineligible
    # 2. Descending match score
    eligibility_order = {"ELIGIBLE": 0, "POTENTIALLY_ELIGIBLE": 1, "INELIGIBLE": 2}
    results.sort(key=lambda x: (eligibility_order.get(x["eligibility_status"], 3), -x["match_score"]))

    return results
