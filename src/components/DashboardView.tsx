import React from 'react';
import { DashboardStats, Scholarship, Recommendation } from '../types';
import {
  GraduationCap,
  Bookmark,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Building2,
  Clock
} from 'lucide-react';

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigate: (tab: string) => void;
  onSelectScholarship: (scholarship: Scholarship | Recommendation) => void;
  onToggleSave: (id: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  loading,
  onNavigate,
  onSelectScholarship,
}) => {
  if (loading || !stats) {
    return (
      <div className="py-12 space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const { student, stats: metrics, upcoming_deadlines, top_recommendations, funding_distribution } = stats;

  return (
    <div className="space-y-8 py-6">
      {/* 1. Welcome Hero Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-teal-400 font-medium mb-2">
            <span>Student Academic Portal</span>
            <span aria-hidden="true">·</span>
            <span>{student.education_level || 'Higher Education'}</span>
            {student.state && (
              <>
                <span aria-hidden="true">·</span>
                <span>{student.state}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, {student.name || 'Student'}
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Your profile has been analyzed against active grant schemes. Discover verified scholarships
            aligned with your academic performance, discipline, and financial need.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('recommendations')}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>View Match Recommendations ({metrics.matching_scholarships})</span>
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
            >
              Update Academic Profile
            </button>
          </div>
        </div>

        {/* Ambient background graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:flex items-center justify-center">
          <GraduationCap className="w-64 h-64 text-teal-300" />
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Matching Scholarships */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Eligible Matches</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.matching_scholarships}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            + {metrics.potential_scholarships} potentially eligible
          </div>
        </div>

        {/* Metric 2: Profile Completion */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Profile Completeness</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.completion_percentage}%
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${metrics.completion_percentage}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Saved Opportunities */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Saved Bookmarks</span>
            <Bookmark className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.saved_count}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Bookmarked for later review
          </div>
        </div>

        {/* Metric 4: Active Tracker Applications */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Applications</span>
            <FileCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {metrics.total_applications}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {metrics.status_breakdown?.['Awarded'] || 0} awarded · {metrics.status_breakdown?.['Applied'] || 0} submitted
          </div>
        </div>
      </div>

      {/* 3. Upcoming Deadlines Alert Section */}
      {upcoming_deadlines.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900">
                Approaching Application Deadlines
              </h2>
            </div>
            <button
              onClick={() => onNavigate('discover')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming_deadlines.map((item) => (
              <div
                key={item.scholarship_id}
                onClick={() => onSelectScholarship(item as any)}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-xs text-slate-900 line-clamp-1">
                    {item.name}
                  </div>
                  <span
                    className={`text-[11px] font-mono tabular-nums font-semibold shrink-0 ${
                      item.days_left <= 15 ? 'text-rose-600' : 'text-slate-600'
                    }`}
                  >
                    {item.days_left}d left
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[160px]">{item.provider}</span>
                  <span className="font-mono tabular-nums text-slate-900 font-medium">
                    {item.currency} {item.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Split Grid: Top Recommendations & Funding Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top Matched Scholarships */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Top Algorithmic Matches
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated using academic surplus, discipline alignment, and financial eligibility
              </p>
            </div>
            <button
              onClick={() => onNavigate('recommendations')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>See all ({top_recommendations.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {top_recommendations.map((rec) => (
              <div
                key={rec.scholarship_id}
                onClick={() => onSelectScholarship(rec)}
                className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-4 hover:bg-slate-50/70 p-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-teal-700">{rec.provider}</span>
                    <span aria-hidden="true">·</span>
                    <span>{rec.funding_type}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 hover:text-teal-700 transition-colors">
                    {rec.scholarship_name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono tabular-nums text-slate-900 font-medium">
                      {rec.currency} {rec.amount.toLocaleString()}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Deadline: {rec.application_deadline}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-teal-700 font-mono tabular-nums">
                    {rec.match_score}%
                  </div>
                  <div className="text-[11px] text-slate-400">Match score</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Funding Distribution & Application Summary */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Scholarship Types
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Available funding distribution in database
            </p>
          </div>

          {/* Funding Distribution Visual Breakdown */}
          <div className="space-y-3">
            {Object.entries(funding_distribution).map(([type, count]) => {
              const total = Object.values(funding_distribution).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{type}</span>
                    <span className="text-slate-500 font-mono tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-800 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <div className="text-xs font-semibold text-slate-800">
              Application Tracker Overview
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-500">Interested:</span>{' '}
                <span className="font-bold font-mono text-slate-900">
                  {metrics.status_breakdown?.['Interested'] || 0}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Preparing:</span>{' '}
                <span className="font-bold font-mono text-slate-900">
                  {metrics.status_breakdown?.['Preparing Documents'] || 0}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Applied:</span>{' '}
                <span className="font-bold font-mono text-slate-900">
                  {metrics.status_breakdown?.['Applied'] || 0}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Awarded:</span>{' '}
                <span className="font-bold font-mono text-emerald-700">
                  {metrics.status_breakdown?.['Awarded'] || 0}
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('tracker')}
              className="w-full mt-2 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              Open Application Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
