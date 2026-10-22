import React, { useState, useEffect, useCallback } from 'react';
import { api, getStoredUser, clearStoredSession } from './api';
import {
  User,
  StudentProfile,
  Scholarship,
  Recommendation,
  ApplicationTrackerItem,
  DashboardStats,
  RecommendationWeights
} from './types';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RecommendationsView } from './components/RecommendationsView';
import { DiscoverView } from './components/DiscoverView';
import { TrackerView } from './components/TrackerView';
import { ChecklistView } from './components/ChecklistView';
import { CompareView } from './components/CompareView';
import { ProfileView } from './components/ProfileView';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import { ScholarshipDetailModal } from './components/ScholarshipDetailModal';
import { GraduationCap, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Core Data States
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [applications, setApplications] = useState<ApplicationTrackerItem[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);

  // Selected modals and tools
  const [detailScholarship, setDetailScholarship] = useState<Scholarship | Recommendation | null>(null);
  const [checklistScholarshipId, setChecklistScholarshipId] = useState<number | null>(null);

  // Loading States
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingScholarships, setLoadingScholarships] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // Dynamic Recommendation Weights
  const [weights, setWeights] = useState<RecommendationWeights>({
    academic: 0.30,
    financial_need: 0.25,
    course_level: 0.20,
    geographic: 0.10,
    skills_achievements: 0.10,
    deadline_suitability: 0.05,
  });

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch Dashboard Stats
  const fetchDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const data = await api.getDashboard();
      setDashboardStats(data);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  // 2. Fetch Recommendations with current weights
  const fetchRecommendations = useCallback(async (currentWeights?: RecommendationWeights) => {
    setLoadingRecommendations(true);
    try {
      const res = await api.getRecommendations(currentWeights || weights);
      setRecommendations(res.recommendations);
    } catch (err: any) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [weights]);

  // 3. Fetch All Scholarships
  const fetchScholarships = useCallback(async (filters: Record<string, any> = {}) => {
    setLoadingScholarships(true);
    try {
      const res = await api.getScholarships(filters);
      setAllScholarships(res.scholarships);
    } catch (err: any) {
      console.error('Failed to load scholarships:', err);
    } finally {
      setLoadingScholarships(false);
    }
  }, []);

  // 4. Fetch Applications Tracker
  const fetchApplications = useCallback(async () => {
    setLoadingApplications(true);
    try {
      const apps = await api.getApplications();
      setApplications(apps);
    } catch (err: any) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  // 5. Fetch Saved Scholarships
  const fetchSaved = useCallback(async () => {
    try {
      const saved = await api.getSavedScholarships();
      setSavedIds(new Set(saved.map((s) => s.id)));
    } catch (err: any) {
      console.error('Failed to load saved scholarships:', err);
    }
  }, []);

  // 6. Fetch Student Profile
  const fetchProfile = useCallback(async () => {
    try {
      const prof = await api.getProfile();
      setStudentProfile(prof);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboard();
    fetchRecommendations();
    fetchScholarships();
    fetchApplications();
    fetchSaved();
    fetchProfile();
  }, [fetchDashboard, fetchRecommendations, fetchScholarships, fetchApplications, fetchSaved, fetchProfile]);

  // Actions
  const handleToggleSave = async (id: number) => {
    try {
      const res = await api.toggleSaveScholarship(id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (res.is_saved) {
          next.add(id);
          showToast('Scholarship saved to your bookmarks.');
        } else {
          next.delete(id);
          showToast('Scholarship removed from bookmarks.');
        }
        return next;
      });
      fetchDashboard();
      fetchRecommendations();
    } catch (err: any) {
      showToast('Error saving: ' + err.message);
    }
  };

  const handleAddToTracker = async (scholarship: Scholarship | Recommendation) => {
    const sId = 'scholarship_id' in scholarship ? scholarship.scholarship_id : scholarship.id;
    try {
      await api.saveApplication({
        scholarship_id: sId,
        status: 'Interested',
      });
      showToast('Added to Application Tracker under "Interested" stage.');
      fetchApplications();
      fetchDashboard();
    } catch (err: any) {
      showToast('Error tracking application: ' + err.message);
    }
  };

  const handleUpdateApplicationStatus = async (item: ApplicationTrackerItem, newStatus: string) => {
    try {
      await api.saveApplication({
        scholarship_id: item.scholarship_id,
        status: newStatus,
        applied_date: item.applied_date,
        personal_notes: item.personal_notes,
        documents_checklist: item.documents_checklist,
      });
      showToast(`Updated status to "${newStatus}".`);
      fetchApplications();
      fetchDashboard();
    } catch (err: any) {
      showToast('Error updating status: ' + err.message);
    }
  };

  const handleSaveNotes = async (scholarshipId: number, notes: string, appliedDate?: string) => {
    try {
      const current = applications.find((a) => a.scholarship_id === scholarshipId);
      await api.saveApplication({
        scholarship_id: scholarshipId,
        status: current?.status || 'Interested',
        applied_date: appliedDate,
        personal_notes: notes,
        documents_checklist: current?.documents_checklist,
      });
      showToast('Notes and dates updated successfully.');
      fetchApplications();
    } catch (err: any) {
      showToast('Error saving notes: ' + err.message);
    }
  };

  const handleDeleteApplication = async (scholarshipId: number) => {
    try {
      await api.deleteApplication(scholarshipId);
      showToast('Removed from tracker.');
      fetchApplications();
      fetchDashboard();
    } catch (err: any) {
      showToast('Error removing: ' + err.message);
    }
  };

  const handleToggleDocChecklist = async (scholarshipId: number, docName: string, currentVal: boolean) => {
    const app = applications.find((a) => a.scholarship_id === scholarshipId);
    if (!app) return;

    const nextChecklist = {
      ...(app.documents_checklist || {}),
      [docName]: !currentVal,
    };

    try {
      await api.saveApplication({
        scholarship_id: scholarshipId,
        status: app.status,
        applied_date: app.applied_date,
        personal_notes: app.personal_notes,
        documents_checklist: nextChecklist,
      });
      fetchApplications();
    } catch (err: any) {
      showToast('Error updating document status: ' + err.message);
    }
  };

  const handleUpdateWeights = (newWeights: RecommendationWeights) => {
    setWeights(newWeights);
    fetchRecommendations(newWeights);
    showToast('Recalculated recommendations using updated weights.');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.full_name || user.email}!`);
    fetchDashboard();
    fetchRecommendations();
    fetchApplications();
    fetchSaved();
    fetchProfile();
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    showToast('You have been logged out.');
  };

  const handleNavigateToChecklist = (scholarshipId: number) => {
    setChecklistScholarshipId(scholarshipId);
    setCurrentTab('checklist');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenProfile={() => setCurrentTab('profile')}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            stats={dashboardStats}
            loading={loadingDashboard}
            onNavigate={setCurrentTab}
            onSelectScholarship={setDetailScholarship}
            onToggleSave={handleToggleSave}
          />
        )}

        {currentTab === 'recommendations' && (
          <RecommendationsView
            recommendations={recommendations}
            loading={loadingRecommendations}
            weights={weights}
            onUpdateWeights={handleUpdateWeights}
            onSelectScholarship={setDetailScholarship}
            onToggleSave={handleToggleSave}
            onAddToTracker={handleAddToTracker}
          />
        )}

        {currentTab === 'discover' && (
          <DiscoverView
            scholarships={allScholarships}
            loading={loadingScholarships}
            onSelectScholarship={setDetailScholarship}
            onToggleSave={handleToggleSave}
            savedIds={savedIds}
            onAddToTracker={handleAddToTracker}
            onSearchChange={fetchScholarships}
          />
        )}

        {currentTab === 'tracker' && (
          <TrackerView
            applications={applications}
            loading={loadingApplications}
            onUpdateStatus={handleUpdateApplicationStatus}
            onSaveNotes={handleSaveNotes}
            onDeleteApplication={handleDeleteApplication}
            onNavigateToChecklist={handleNavigateToChecklist}
          />
        )}

        {currentTab === 'checklist' && (
          <ChecklistView
            applications={applications}
            selectedScholarshipId={checklistScholarshipId}
            onToggleDoc={handleToggleDocChecklist}
            onSelectApplication={setChecklistScholarshipId}
          />
        )}

        {currentTab === 'compare' && (
          <CompareView
            scholarships={allScholarships}
            onSelectScholarship={setDetailScholarship}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            profile={studentProfile}
            onProfileUpdated={(updated) => {
              setStudentProfile(updated);
              fetchDashboard();
              fetchRecommendations();
            }}
            onNavigateToRecommendations={() => setCurrentTab('recommendations')}
          />
        )}

        {currentTab === 'admin' && (
          <AdminView
            scholarships={allScholarships}
            onRefreshScholarships={() => {
              fetchScholarships();
              fetchDashboard();
              fetchRecommendations();
            }}
          />
        )}
      </main>

      {/* Scholarship Detail Modal */}
      {detailScholarship && (
        <ScholarshipDetailModal
          scholarship={detailScholarship}
          onClose={() => setDetailScholarship(null)}
          onToggleSave={handleToggleSave}
          isSaved={savedIds.has(
            'scholarship_id' in detailScholarship
              ? detailScholarship.scholarship_id
              : detailScholarship.id
          )}
          onAddToTracker={handleAddToTracker}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white text-xs text-slate-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <GraduationCap className="w-4 h-4 text-teal-600" />
            <span>Scholarship Finder · Student Recommendation System</span>
          </div>

          <div className="text-center sm:text-right">
            <span>B.Sc. Data Science Mini-Project Demonstration</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Multi-Criteria Weighted Ranking Algorithm</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
