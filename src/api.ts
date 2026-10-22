import {
  User,
  StudentProfile,
  Scholarship,
  Recommendation,
  ApplicationTrackerItem,
  DashboardStats,
  RecommendationWeights,
  AuditLog
} from './types';

const TOKEN_KEY = 'scholarship_auth_token';
const USER_KEY = 'scholarship_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const u = localStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
}

export function setStoredSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.error || 'Request failed with status ' + response.status);
  }

  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; user: User; token: string }> {
    const res = await request<{ success: boolean; user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredSession(res.token, res.user);
    return res;
  },

  async register(email: string, password: string, fullName: string): Promise<{ success: boolean; user: User; token: string }> {
    const res = await request<{ success: boolean; user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    setStoredSession(res.token, res.user);
    return res;
  },

  async logout(): Promise<void> {
    clearStoredSession();
  },

  // Student Profile
  async getProfile(): Promise<StudentProfile> {
    const res = await request<{ success: boolean; profile: StudentProfile }>('/api/students/me');
    return res.profile;
  },

  async updateProfile(profile: Partial<StudentProfile>): Promise<StudentProfile> {
    const res = await request<{ success: boolean; profile: StudentProfile }>('/api/students/me', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
    return res.profile;
  },

  // Scholarships
  async getScholarships(filters: Record<string, any> = {}): Promise<{ count: number; scholarships: Scholarship[] }> {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const url = `/api/scholarships${query.toString() ? '?' + query.toString() : ''}`;
    return request<{ count: number; scholarships: Scholarship[] }>(url);
  },

  async getScholarshipById(id: number): Promise<Scholarship> {
    const res = await request<{ success: boolean; scholarship: Scholarship }>(`/api/scholarships/${id}`);
    return res.scholarship;
  },

  // Recommendations
  async getRecommendations(weights?: Partial<RecommendationWeights>): Promise<{
    student_name: string;
    total_evaluated: number;
    eligible_count: number;
    potentially_eligible_count: number;
    ineligible_count: number;
    recommendations: Recommendation[];
    weights_used: RecommendationWeights;
  }> {
    const query = new URLSearchParams();
    if (weights) {
      query.append('weights', JSON.stringify(weights));
    }
    const url = `/api/recommendations${query.toString() ? '?' + query.toString() : ''}`;
    return request(url);
  },

  // Saved Scholarships
  async getSavedScholarships(): Promise<Scholarship[]> {
    const res = await request<{ success: boolean; saved_scholarships: Scholarship[] }>('/api/saved-scholarships');
    return res.saved_scholarships;
  },

  async toggleSaveScholarship(id: number): Promise<{ is_saved: boolean }> {
    return request<{ is_saved: boolean }>(`/api/saved-scholarships/${id}`, {
      method: 'POST',
    });
  },

  // Applications
  async getApplications(): Promise<ApplicationTrackerItem[]> {
    const res = await request<{ success: boolean; applications: ApplicationTrackerItem[] }>('/api/applications');
    return res.applications;
  },

  async saveApplication(item: {
    scholarship_id: number;
    status: string;
    applied_date?: string;
    personal_notes?: string;
    documents_checklist?: Record<string, boolean>;
  }): Promise<void> {
    await request('/api/applications', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async deleteApplication(scholarshipId: number): Promise<void> {
    await request(`/api/applications/${scholarshipId}`, {
      method: 'DELETE',
    });
  },

  // Dashboard
  async getDashboard(): Promise<DashboardStats> {
    return request<DashboardStats>('/api/dashboard');
  },

  // Admin
  async adminCreateScholarship(scholarship: Partial<Scholarship>): Promise<void> {
    await request('/api/admin/scholarships', {
      method: 'POST',
      body: JSON.stringify(scholarship),
    });
  },

  async adminUpdateScholarship(id: number, scholarship: Partial<Scholarship>): Promise<void> {
    await request(`/api/admin/scholarships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scholarship),
    });
  },

  async adminDeleteScholarship(id: number): Promise<void> {
    await request(`/api/admin/scholarships/${id}`, {
      method: 'DELETE',
    });
  },

  async adminToggleVerify(id: number): Promise<{ is_verified: number }> {
    return request<{ is_verified: number }>(`/api/admin/scholarships/${id}/verify`, {
      method: 'POST',
    });
  },

  async adminGetAuditLogs(): Promise<AuditLog[]> {
    const res = await request<{ success: boolean; audit_logs: AuditLog[] }>('/api/admin/audit-logs');
    return res.audit_logs;
  },

  async adminRunTests(): Promise<{ success: boolean; stdout: string; stderr: string; exit_code: number }> {
    return request('/api/admin/run-tests', {
      method: 'POST',
    });
  },
};
