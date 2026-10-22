import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { api } from '../api';
import {
  User,
  GraduationCap,
  DollarSign,
  Award,
  ShieldCheck,
  CheckCircle2,
  Save,
  MapPin,
  Building2,
  Sparkles
} from 'lucide-react';

interface ProfileViewProps {
  profile: StudentProfile | null;
  onProfileUpdated: (updated: StudentProfile) => void;
  onNavigateToRecommendations: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onProfileUpdated,
  onNavigateToRecommendations,
}) => {
  const [formData, setFormData] = useState<Partial<StudentProfile>>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        state: profile.state || '',
        country: profile.country || 'India',
        education_level: profile.education_level || 'Undergraduate',
        course: profile.course || '',
        institution_name: profile.institution_name || '',
        current_year: profile.current_year || 1,
        academic_score: profile.academic_score ?? undefined,
        academic_score_type: profile.academic_score_type || 'percentage',
        family_income: profile.family_income ?? undefined,
        category: profile.category || 'General',
        disability_status: profile.disability_status || 'No',
        skills: profile.skills || '',
        achievements: profile.achievements || '',
      });
    }
  }, [profile]);

  const handleChange = (field: keyof StudentProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(false);

    try {
      const updated = await api.updateProfile(formData);
      onProfileUpdated(updated);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const completionPct = profile?.completion_percentage || 0;

  return (
    <div className="space-y-6 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>Student Information Hub</span>
          <span aria-hidden="true">·</span>
          <span>Matching Criteria Configuration</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Student Academic Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Your profile parameters are processed by the Python recommendation engine to compute eligibility and ranking.
        </p>
      </div>

      {/* Completion Meter Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Profile Completeness: <span className="font-mono tabular-nums">{completionPct}%</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            A comprehensive profile enhances recommendation precision and unlocks high-match grant opportunities.
          </p>
          <div className="w-full sm:w-64 bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <button
          onClick={onNavigateToRecommendations}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Test Algorithmic Recommendations</span>
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 font-semibold">Data Privacy & Evaluation Disclosure:</strong> We collect only
          information necessary for scholarship matching. Sensitive criteria such as family income and category certifications
          are strictly evaluated locally against statutory grant limits and are never shared or sold.
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile successfully updated! Recommendations have been updated in real-time.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            {errorMsg}
          </div>
        )}

        {/* Section 1: Personal & Academic Details */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">Personal & Academic Identification</h2>
            <p className="text-xs text-slate-500">Basic candidate credentials and college affiliation</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.full_name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Institution Name</label>
              <input
                type="text"
                value={formData.institution_name || ''}
                onChange={(e) => handleChange('institution_name', e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Current Education Level *</label>
              <select
                value={formData.education_level || 'Undergraduate'}
                onChange={(e) => handleChange('education_level', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
              >
                <option value="High School">High School (10th / 12th)</option>
                <option value="Undergraduate">Undergraduate (B.Tech / B.Sc / B.Com / MBBS)</option>
                <option value="Postgraduate">Postgraduate (M.Tech / M.Sc / MBA / MD)</option>
                <option value="Doctoral">Doctoral (Ph.D. / Research)</option>
                <option value="Diploma">Diploma / Polytechnic</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Course & Specialization *</label>
              <input
                type="text"
                value={formData.course || ''}
                onChange={(e) => handleChange('course', e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Current Year of Study</label>
              <select
                value={formData.current_year || 1}
                onChange={(e) => handleChange('current_year', parseInt(e.target.value, 10))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">State / Province Domicile</label>
              <input
                type="text"
                value={formData.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="e.g. Karnataka, Maharashtra, Delhi"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Performance & Financial Need */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">Academic Merit & Financial Need Criteria</h2>
            <p className="text-xs text-slate-500">Core parameters driving 55% of the weighted ranking formula</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Academic Score Type</label>
              <select
                value={formData.academic_score_type || 'percentage'}
                onChange={(e) => handleChange('academic_score_type', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="percentage">Percentage (0 - 100%)</option>
                <option value="cgpa">10-Point CGPA (e.g. 8.65)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Academic Score Value ({formData.academic_score_type === 'cgpa' ? '0.0 - 10.0' : '0 - 100%'})
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.academic_score ?? ''}
                onChange={(e) => handleChange('academic_score', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder={formData.academic_score_type === 'cgpa' ? '8.65' : '86.5'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Annual Family Income (INR ₹ / Year)
              </label>
              <input
                type="number"
                step="1000"
                value={formData.family_income ?? ''}
                onChange={(e) => handleChange('family_income', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="e.g. 420000"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Required for need-based grant eligibility validation
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Social / Reservation Category</label>
              <select
                value={formData.category || 'General'}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
              >
                <option value="General">General / Open</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
                <option value="Minority">Religious / Linguistic Minority</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Disability / PwD Status (Voluntary)
              </label>
              <select
                value={formData.disability_status || 'No'}
                onChange={(e) => handleChange('disability_status', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="No">No (Not Applicable)</option>
                <option value="Yes">Yes (Benchmark Disability 40%+)</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Enables matching with special assistance grant programs
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Skills, Achievements & Activities */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900">Skills, Extracurriculars & Research Interests</h2>
            <p className="text-xs text-slate-500">Used by the text analysis stage to match domain-specific scholarships</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Skills & Technical Competencies (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.skills || ''}
                onChange={(e) => handleChange('skills', e.target.value)}
                placeholder="e.g. Python, Machine Learning, Data Structures, Web Development, Leadership, Robotics"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Key Achievements, Hackathons, Publications & Extracurriculars
              </label>
              <textarea
                rows={3}
                value={formData.achievements || ''}
                onChange={(e) => handleChange('achievements', e.target.value)}
                placeholder="e.g. First place in University Hackathon 2025; President of Women in Tech Campus Chapter; Published paper on predictive models."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Form Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Updating Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
