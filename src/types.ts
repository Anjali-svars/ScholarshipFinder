export interface User {
  id: number;
  email: string;
  role: 'student' | 'admin';
  full_name?: string;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  full_name: string;
  email?: string;
  role?: string;
  state: string;
  country: string;
  education_level: string;
  course: string;
  institution_name: string;
  current_year: number;
  academic_score: number | null;
  academic_score_type: 'percentage' | 'cgpa';
  family_income: number | null;
  category: string;
  disability_status: string;
  skills: string;
  achievements: string;
  completion_percentage?: number;
  updated_at: string;
}

export interface Scholarship {
  id: number;
  name: string;
  provider: string;
  description: string;
  education_levels: string[];
  courses: string[];
  min_academic_score: number;
  max_family_income: number | null;
  eligible_locations: string[];
  categories: string[];
  disability_eligible_only: number | boolean;
  amount: number;
  currency: string;
  funding_type: string;
  required_documents: string[];
  application_open_date?: string;
  application_deadline: string;
  official_url: string;
  is_active: number | boolean;
  is_verified: number | boolean;
  last_verified_date: string;
  created_at?: string;
}

export interface SubScores {
  academic: number;
  financial_need: number;
  course_level: number;
  geographic: number;
  skills_achievements: number;
  deadline_suitability: number;
}

export interface Recommendation {
  scholarship_id: number;
  scholarship_name: string;
  provider: string;
  description: string;
  amount: number;
  currency: string;
  funding_type: string;
  application_deadline: string;
  days_left: number | null;
  official_url: string;
  is_verified: number | boolean;
  required_documents: string[];
  education_levels: string[];
  courses: string[];
  min_academic_score: number;
  max_family_income: number | null;
  eligibility_status: 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'INELIGIBLE';
  match_score: number;
  sub_scores: SubScores;
  match_reasons: string[];
  missing_or_verify: string[];
  fail_reasons: string[];
  disclaimer: string;
  is_saved?: boolean;
  application_status?: string | null;
}

export interface ApplicationTrackerItem {
  id: number;
  user_id: number;
  scholarship_id: number;
  scholarship_name: string;
  provider: string;
  amount: number;
  currency: string;
  application_deadline: string;
  official_url: string;
  required_documents: string[];
  status: 'Interested' | 'Preparing Documents' | 'Ready to Apply' | 'Applied' | 'Awarded' | 'Rejected';
  applied_date?: string;
  personal_notes?: string;
  documents_checklist: Record<string, boolean>;
  updated_at: string;
}

export interface DashboardStats {
  student: {
    name: string;
    course: string;
    education_level: string;
    academic_score: number | null;
    state: string;
  };
  stats: {
    completion_percentage: number;
    matching_scholarships: number;
    potential_scholarships: number;
    saved_count: number;
    total_applications: number;
    status_breakdown: Record<string, number>;
    total_available_scholarships: number;
  };
  upcoming_deadlines: Array<{
    scholarship_id: number;
    name: string;
    provider: string;
    deadline: string;
    days_left: number;
    amount: number;
    currency: string;
    match_score: number;
  }>;
  top_recommendations: Recommendation[];
  funding_distribution: Record<string, number>;
}

export interface RecommendationWeights {
  academic: number;
  financial_need: number;
  course_level: number;
  geographic: number;
  skills_achievements: number;
  deadline_suitability: number;
}

export interface AuditLog {
  id: number;
  admin_email: string;
  action: string;
  target_entity: string;
  target_id: number | null;
  details: string;
  created_at: string;
}
