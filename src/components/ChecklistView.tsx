import React, { useState } from 'react';
import { ApplicationTrackerItem } from '../types';
import {
  FileText,
  CheckCircle2,
  Circle,
  ShieldCheck,
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ChecklistViewProps {
  applications: ApplicationTrackerItem[];
  selectedScholarshipId: number | null;
  onToggleDoc: (scholarshipId: number, docName: string, currentVal: boolean) => void;
  onSelectApplication: (id: number) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  applications,
  selectedScholarshipId,
  onToggleDoc,
  onSelectApplication,
}) => {
  const activeApp = applications.find((a) => a.scholarship_id === selectedScholarshipId) || applications[0];

  const standardDocGuides: Record<string, string> = {
    'marksheet': 'Attested copies of Grade 10, 12, or collegiate semester grade cards signed by the registrar.',
    'income': 'Official Income Certificate issued by the designated Tehsildar / Sub-Divisional Revenue Officer.',
    'bonafide': 'Official Bonafide Student Certificate issued by your college Dean / Principal on institute letterhead.',
    'caste': 'Government Community / Caste / Category certificate with digital verification seal.',
    'disability': 'UDID (Unique Disability ID) Card or disability certification from a recognized medical board (40%+).',
    'id': 'Government identity proof (Aadhaar, Passport, or Voter ID).',
    'residence': 'State Domicile certificate or Residential verification document.',
  };

  const getGuide = (docName: string): string => {
    const lower = docName.toLowerCase();
    for (const [key, guide] of Object.entries(standardDocGuides)) {
      if (lower.includes(key)) return guide;
    }
    return 'Official documentation verifying eligibility as required by the sponsoring foundation.';
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>Application Readiness Tool</span>
          <span aria-hidden="true">·</span>
          <span>Document Verification Checklists</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Document Checklist & Readiness Tracker
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track preparation of mandatory certificates, transcripts, and verifications required for each scholarship.
        </p>
      </div>

      {/* Sensitive Data Notice */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-600 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-900">Privacy Notice:</strong> For student data protection, this tool tracks
          your preparation readiness locally without uploading sensitive files or personal government IDs to third-party
          servers.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No applications to track documents for</p>
          <p className="text-xs text-slate-500 mt-1">
            Add scholarships to your Application Tracker to unlock custom document checklists.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Scholarship Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Tracked Opportunities ({applications.length})
            </h3>
            <div className="space-y-1.5">
              {applications.map((app) => {
                const isSelected = activeApp?.scholarship_id === app.scholarship_id;
                const checked = Object.values(app.documents_checklist || {}).filter(Boolean).length;
                const total = app.required_documents?.length || 0;
                const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

                return (
                  <button
                    key={app.scholarship_id}
                    onClick={() => onSelectApplication(app.scholarship_id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between gap-2 border ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-200 text-slate-900'
                        : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{app.scholarship_name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono tabular-nums">{checked}/{total} verified</span>
                        <span aria-hidden="true">·</span>
                        <span>{pct}% ready</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-600' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Document Checklist */}
          {activeApp && (
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs text-teal-700 font-semibold">{activeApp.provider}</div>
                  <h2 className="text-lg font-bold text-slate-900">{activeApp.scholarship_name}</h2>
                </div>
                <a
                  href={activeApp.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Official Portal Guidelines</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Progress Bar */}
              <div>
                {(() => {
                  const checked = Object.values(activeApp.documents_checklist || {}).filter(Boolean).length;
                  const total = activeApp.required_documents?.length || 0;
                  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
                  return (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700">Readiness Preparation Progress</span>
                        <span className="font-mono tabular-nums font-bold text-slate-900">
                          {checked} of {total} documents ready ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Document List */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mandatory Document Checklist
                </h3>
                <div className="space-y-2">
                  {activeApp.required_documents?.map((doc, idx) => {
                    const isChecked = !!activeApp.documents_checklist?.[doc];
                    return (
                      <div
                        key={idx}
                        onClick={() => onToggleDoc(activeApp.scholarship_id, doc, isChecked)}
                        className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                          isChecked
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className={`text-xs font-bold ${isChecked ? 'text-emerald-950 line-through opacity-80' : 'text-slate-900'}`}>
                            {doc}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-relaxed">
                            {getGuide(doc)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
