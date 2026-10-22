import React, { useState } from 'react';
import { Scholarship } from '../types';
import { Columns3, ExternalLink, X, Plus, Calendar, DollarSign, Award, GraduationCap } from 'lucide-react';

interface CompareViewProps {
  scholarships: Scholarship[];
  onSelectScholarship: (scholarship: Scholarship) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  scholarships,
  onSelectScholarship,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 4]);

  const selectedScholarships = selectedIds
    .map((id) => scholarships.find((s) => s.id === id))
    .filter(Boolean) as Scholarship[];

  const handleAdd = (id: number) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemove = (id: number) => {
    setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>Comparative Matrix Analysis</span>
          <span aria-hidden="true">·</span>
          <span>Side-by-Side Evaluation</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Scholarship Opportunity Comparison
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Compare funding values, eligibility cutoffs, document requirements, and deadlines across up to 3 opportunities.
        </p>
      </div>

      {/* Selector Strip */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-700">
            Selected for Comparison ({selectedScholarships.length} of 3 maximum):
          </span>
          {selectedScholarships.length < 3 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Add to compare:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleAdd(parseInt(e.target.value, 10));
                }}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>Choose scholarship...</option>
                {scholarships
                  .filter((s) => !selectedIds.includes(s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.provider})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Selected chips */}
        <div className="flex flex-wrap gap-2">
          {selectedScholarships.map((s) => (
            <div
              key={s.id}
              className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-800 flex items-center gap-2"
            >
              <span className="truncate max-w-[200px]">{s.name}</span>
              <button
                onClick={() => handleRemove(s.id)}
                className="text-slate-400 hover:text-rose-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedScholarships.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
          <p className="text-sm">Please select at least one scholarship above to view comparison details.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-4 w-44 font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                  Comparison Parameter
                </th>
                {selectedScholarships.map((s) => (
                  <th key={s.id} className="p-4 min-w-[240px] font-bold text-slate-900 border-l border-slate-100">
                    <div className="text-teal-700 text-[11px] font-semibold">{s.provider}</div>
                    <div className="text-sm font-bold mt-0.5">{s.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Grant Value */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Grant Amount</td>
                {selectedScholarships.map((s) => (
                  <td key={s.id} className="p-4 border-l border-slate-100 font-mono tabular-nums text-base font-bold text-slate-900">
                    {s.currency} {s.amount.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Funding Type */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Funding Classification</td>
                {selectedScholarships.map((s) => (
                  <td key={s.id} className="p-4 border-l border-slate-100 font-medium text-slate-800">
                    {s.funding_type}
                  </td>
                ))}
              </tr>

              {/* Academic Score Cutoff */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Min Academic Score</td>
                {selectedScholarships.map((s) => (
                  <td key={s.id} className="p-4 border-l border-slate-100 font-mono tabular-nums text-slate-800">
                    {s.min_academic_score > 0 ? `${s.min_academic_score}% or equivalent` : 'No minimum threshold'}
                  </td>
                ))}
              </tr>

              {/* Income Limit */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Family Income Ceiling</td>
                {selectedScholarships.map((s) => (
                  <td key={s.id} className="p-4 border-l border-slate-100 font-mono tabular-nums text-slate-800">
                    {s.max_family_income ? `≤ ₹${s.max_family_income.toLocaleString()} / year` : 'No income ceiling'}
                  </td>
                ))}
              </tr>

              {/* Education Levels */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Eligible Levels</td>
                {selectedScholarships.map((s) => (
                  <td key={s.id} className="p-4 border-l border-slate-100 text-slate-700">
                    {s.education_levels?.join(', ') || 'All levels'}
                  </td>
                ))}
              </tr>

              {/* Courses */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Eligible Disciplines</td>
                {selectedScholarships.map((s) => (
                  <td key={s.id} className="p-4 border-l border-slate-100 text-slate-700">
                    {s.courses?.join(', ') || 'All fields'}
                  </td>
                ))}
              </tr>

              {/* Deadline */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Application Deadline</td>
                {selectedScholarships.map((s) => (
                  <td key={s.id} className="p-4 border-l border-slate-100 font-mono tabular-nums font-semibold text-slate-900">
                    {s.application_deadline}
                  </td>
                ))}
              </tr>

              {/* Mandatory Documents */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Required Documents</td>
                {selectedScholarships.map((s) => (
                  <td key={s.id} className="p-4 border-l border-slate-100 text-slate-700">
                    <ul className="list-disc pl-4 space-y-1">
                      {s.required_documents?.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Action Buttons */}
              <tr>
                <td className="p-4 font-semibold text-slate-600 bg-slate-50/40">Action</td>
                {selectedScholarships.map((s) => (
                  <td key={s.id} className="p-4 border-l border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectScholarship(s)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                      <a
                        href={s.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
