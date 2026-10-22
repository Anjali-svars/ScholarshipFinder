import React from 'react';
import { Scholarship, Recommendation } from '../types';
import {
  X,
  ExternalLink,
  Calendar,
  CheckCircle2,
  FileText,
  Bookmark,
  PlusCircle,
  Award,
  DollarSign,
  GraduationCap,
  MapPin,
  ShieldAlert
} from 'lucide-react';

interface ScholarshipDetailModalProps {
  scholarship: Scholarship | Recommendation | null;
  onClose: () => void;
  onToggleSave: (id: number) => void;
  isSaved?: boolean;
  onAddToTracker: (scholarship: Scholarship | Recommendation) => void;
}

export const ScholarshipDetailModal: React.FC<ScholarshipDetailModalProps> = ({
  scholarship,
  onClose,
  onToggleSave,
  isSaved = false,
  onAddToTracker,
}) => {
  if (!scholarship) return null;

  const isRec = 'match_score' in scholarship;
  const daysLeft = 'days_left' in scholarship ? scholarship.days_left : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-teal-700">{scholarship.provider}</span>
              <span aria-hidden="true">·</span>
              <span>{scholarship.funding_type}</span>
              {scholarship.is_verified && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 inline" /> Verified
                  </span>
                </>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {'scholarship_name' in scholarship ? scholarship.scholarship_name : scholarship.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Key Grant Value Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-teal-50/60 rounded-xl border border-teal-100">
            <div>
              <div className="text-xs text-teal-800 font-medium">Grant Amount</div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {scholarship.currency} {scholarship.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-teal-800 font-medium">Application Deadline</div>
              <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span className="font-mono tabular-nums">{scholarship.application_deadline}</span>
              </div>
              {daysLeft !== null && daysLeft !== undefined && (
                <span className={`text-xs ${daysLeft <= 14 ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
                  {daysLeft > 0 ? `${daysLeft} days remaining` : 'Deadline passed'}
                </span>
              )}
            </div>
            {isRec && (
              <div>
                <div className="text-xs text-teal-800 font-medium">Analytical Fit</div>
                <div className="text-lg font-bold text-teal-700 font-mono tabular-nums">
                  {scholarship.match_score}%
                </div>
                <div className="text-[11px] text-slate-500">Estimate</div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Program Overview
            </h3>
            <p className="text-slate-600 leading-relaxed">{scholarship.description}</p>
          </div>

          {/* Eligibility Criteria Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Eligibility Requirements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                <GraduationCap className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">Education Levels</div>
                  <div className="text-slate-600 mt-0.5">
                    {scholarship.education_levels?.join(', ') || 'All Higher Education Levels'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">Eligible Disciplines</div>
                  <div className="text-slate-600 mt-0.5">
                    {scholarship.courses?.join(', ') || 'All Disciplines'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">Minimum Academic Cutoff</div>
                  <div className="text-slate-600 mt-0.5 font-mono tabular-nums">
                    {scholarship.min_academic_score > 0
                      ? `${scholarship.min_academic_score}% or equivalent CGPA`
                      : 'No strict minimum threshold'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                <DollarSign className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">Family Income Ceiling</div>
                  <div className="text-slate-600 mt-0.5 font-mono tabular-nums">
                    {scholarship.max_family_income
                      ? `Up to ₹${scholarship.max_family_income.toLocaleString()} / year`
                      : 'No income ceiling (Open to all)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Mandatory Documents Checklist
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {scholarship.required_documents?.map((doc, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100 text-slate-700"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Disclaimer Notice */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p>
              Please verify all eligibility details on the official sponsoring agency website before
              submitting your application. Selection processes and terms are authoritatively governed
              solely by the scholarship provider.
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave('scholarship_id' in scholarship ? scholarship.scholarship_id : scholarship.id)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => onAddToTracker(scholarship)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>Add to Tracker</span>
            </button>
          </div>

          <a
            href={scholarship.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Visit Provider Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
