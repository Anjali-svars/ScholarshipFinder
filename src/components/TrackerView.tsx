import React, { useState } from 'react';
import { ApplicationTrackerItem } from '../types';
import {
  FileCheck,
  Calendar,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Save,
  Info
} from 'lucide-react';

interface TrackerViewProps {
  applications: ApplicationTrackerItem[];
  loading: boolean;
  onUpdateStatus: (item: ApplicationTrackerItem, newStatus: string) => void;
  onSaveNotes: (scholarshipId: number, notes: string, appliedDate?: string) => void;
  onDeleteApplication: (scholarshipId: number) => void;
  onNavigateToChecklist: (scholarshipId: number) => void;
}

const STATUS_STAGES = [
  { id: 'Interested', label: 'Interested', color: 'text-slate-700 bg-slate-100' },
  { id: 'Preparing Documents', label: 'Preparing Documents', color: 'text-amber-800 bg-amber-50' },
  { id: 'Ready to Apply', label: 'Ready to Apply', color: 'text-blue-800 bg-blue-50' },
  { id: 'Applied', label: 'Applied', color: 'text-purple-800 bg-purple-50' },
  { id: 'Awarded', label: 'Awarded', color: 'text-emerald-800 bg-emerald-50' },
  { id: 'Rejected', label: 'Rejected', color: 'text-rose-800 bg-rose-50' },
];

export const TrackerView: React.FC<TrackerViewProps> = ({
  applications,
  loading,
  onUpdateStatus,
  onSaveNotes,
  onDeleteApplication,
  onNavigateToChecklist,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [tempDate, setTempDate] = useState('');

  const startEdit = (item: ApplicationTrackerItem) => {
    setEditingId(item.scholarship_id);
    setTempNotes(item.personal_notes || '');
    setTempDate(item.applied_date || '');
  };

  const handleSaveNotes = (id: number) => {
    onSaveNotes(id, tempNotes, tempDate);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>Student Pipeline Workflow</span>
          <span aria-hidden="true">·</span>
          <span>{applications.length} Tracked Opportunities</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Application Tracking Pipeline
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your personal application status, submission dates, document preparation milestones, and notes.
        </p>
      </div>

      {/* Advisory clarification notice */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-900">Notice:</strong> The Application Tracker records your personal workflow
          and preparation progress. Actual grant submissions must be made through each official scholarship provider's
          accredited portal.
        </p>
      </div>

      {/* Stage Summary Tickers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {STATUS_STAGES.map((stage) => {
          const count = applications.filter((a) => a.status === stage.id).length;
          return (
            <div
              key={stage.id}
              className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1"
            >
              <div className="text-[11px] font-medium text-slate-500 truncate">{stage.label}</div>
              <div className="text-lg font-bold font-mono text-slate-900">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
          <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No applications in your tracker yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Browse through recommendations or the discovery catalog and click "Add to Tracker".
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((item) => {
            const isEditing = editingId === item.scholarship_id;
            const checkedDocsCount = Object.values(item.documents_checklist || {}).filter(Boolean).length;
            const totalDocsCount = item.required_documents?.length || 0;

            return (
              <div
                key={item.scholarship_id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4"
              >
                {/* Header Row: Title & Stage Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-teal-700">{item.provider}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums font-medium text-slate-900">
                        {item.currency} {item.amount?.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {item.scholarship_name}
                    </h3>
                  </div>

                  {/* Status Dropdown Selector */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs text-slate-500 font-medium">Stage:</span>
                    <select
                      value={item.status}
                      onChange={(e) => onUpdateStatus(item, e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900"
                    >
                      {STATUS_STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Info Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deadline: <strong className="font-mono">{item.application_deadline}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Applied on: <strong className="font-mono">{item.applied_date || 'Not recorded'}</strong></span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Docs Prepared: <strong className="font-mono">{checkedDocsCount}/{totalDocsCount}</strong></span>
                    <button
                      onClick={() => onNavigateToChecklist(item.scholarship_id)}
                      className="text-teal-700 hover:text-teal-800 font-semibold"
                    >
                      Checklist &rarr;
                    </button>
                  </div>
                </div>

                {/* Personal Notes Section */}
                {isEditing ? (
                  <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Submission Date (if submitted)
                        </label>
                        <input
                          type="date"
                          value={tempDate}
                          onChange={(e) => setTempDate(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Personal Application Notes & Reminders
                      </label>
                      <textarea
                        rows={2}
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="e.g. Reference letter requested from Prof. Verma; Interview scheduled for 15th."
                        className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSaveNotes(item.scholarship_id)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save Notes</span>
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700">Notes: </span>
                      {item.personal_notes ? (
                        <span>{item.personal_notes}</span>
                      ) : (
                        <span className="italic text-slate-400">No personal notes added yet.</span>
                      )}
                    </div>
                    <button
                      onClick={() => startEdit(item)}
                      className="text-slate-500 hover:text-teal-700 flex items-center gap-1 shrink-0 font-medium ml-2"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onDeleteApplication(item.scholarship_id)}
                    className="text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove from Tracker</span>
                  </button>

                  <a
                    href={item.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1"
                  >
                    <span>Visit Provider Application Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
