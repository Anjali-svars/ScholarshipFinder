import React, { useState } from 'react';
import { Recommendation, RecommendationWeights, Scholarship } from '../types';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Bookmark,
  PlusCircle,
  Info,
  Calendar,
  RotateCcw,
  Check
} from 'lucide-react';

interface RecommendationsViewProps {
  recommendations: Recommendation[];
  loading: boolean;
  weights: RecommendationWeights;
  onUpdateWeights: (weights: RecommendationWeights) => void;
  onSelectScholarship: (scholarship: Scholarship | Recommendation) => void;
  onToggleSave: (id: number) => void;
  onAddToTracker: (scholarship: Scholarship | Recommendation) => void;
}

const DEFAULT_WEIGHTS: RecommendationWeights = {
  academic: 0.30,
  financial_need: 0.25,
  course_level: 0.20,
  geographic: 0.10,
  skills_achievements: 0.10,
  deadline_suitability: 0.05,
};

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  loading,
  weights,
  onUpdateWeights,
  onSelectScholarship,
  onToggleSave,
  onAddToTracker,
}) => {
  const [activeTier, setActiveTier] = useState<'ALL' | 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'INELIGIBLE'>('ELIGIBLE');
  const [showWeightSliders, setShowWeightSliders] = useState(false);
  const [localWeights, setLocalWeights] = useState<RecommendationWeights>(weights);

  const eligibleCount = recommendations.filter((r) => r.eligibility_status === 'ELIGIBLE').length;
  const potentialCount = recommendations.filter((r) => r.eligibility_status === 'POTENTIALLY_ELIGIBLE').length;
  const ineligibleCount = recommendations.filter((r) => r.eligibility_status === 'INELIGIBLE').length;

  const filteredRecs = recommendations.filter((r) => {
    if (activeTier === 'ALL') return true;
    return r.eligibility_status === activeTier;
  });

  const handleWeightChange = (key: keyof RecommendationWeights, val: number) => {
    setLocalWeights((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const applyWeights = () => {
    onUpdateWeights(localWeights);
  };

  const resetWeights = () => {
    setLocalWeights(DEFAULT_WEIGHTS);
    onUpdateWeights(DEFAULT_WEIGHTS);
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Data Science Recommendation Engine</span>
            <span aria-hidden="true">·</span>
            <span>2-Stage Multi-Criteria Analysis</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Personalized Scholarship Recommendations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Stage 1 filters hard constraints (score, income, discipline); Stage 2 computes normalized weighted fit scores.
          </p>
        </div>

        <button
          onClick={() => setShowWeightSliders(!showWeightSliders)}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors flex items-center gap-2 whitespace-nowrap self-start sm:self-auto ${
            showWeightSliders
              ? 'bg-teal-50 border-teal-200 text-teal-800'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configure Ranking Weights</span>
        </button>
      </div>

      {/* Real-time Weight Customizer Drawer */}
      {showWeightSliders && (
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Algorithm Weight Customization (Data Science Mini-Project Feature)
              </h3>
              <p className="text-xs text-slate-500">
                Adjust scoring importance percentages. The Python backend re-computes vector rankings dynamically.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetWeights}
                className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
              <button
                onClick={applyWeights}
                className="px-3 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Check className="w-3 h-3" />
                <span>Recalculate Ranking</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Academic Fit:</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {Math.round(localWeights.academic * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={localWeights.academic}
                onChange={(e) => handleWeightChange('academic', parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Financial-Need Fit:</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {Math.round(localWeights.financial_need * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={localWeights.financial_need}
                onChange={(e) => handleWeightChange('financial_need', parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Course & Level Fit:</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {Math.round(localWeights.course_level * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={localWeights.course_level}
                onChange={(e) => handleWeightChange('course_level', parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Geographic Match:</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {Math.round(localWeights.geographic * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.00"
                max="0.30"
                step="0.05"
                value={localWeights.geographic}
                onChange={(e) => handleWeightChange('geographic', parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Skills & Achievements:</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {Math.round(localWeights.skills_achievements * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.00"
                max="0.30"
                step="0.05"
                value={localWeights.skills_achievements}
                onChange={(e) => handleWeightChange('skills_achievements', parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Deadline Suitability:</span>
                <span className="font-mono tabular-nums font-bold text-slate-900">
                  {Math.round(localWeights.deadline_suitability * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.00"
                max="0.20"
                step="0.05"
                value={localWeights.deadline_suitability}
                onChange={(e) => handleWeightChange('deadline_suitability', parseFloat(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTier('ELIGIBLE')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTier === 'ELIGIBLE'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Eligible Matches ({eligibleCount})
        </button>
        <button
          onClick={() => setActiveTier('POTENTIALLY_ELIGIBLE')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTier === 'POTENTIALLY_ELIGIBLE'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Potentially Eligible ({potentialCount})
        </button>
        <button
          onClick={() => setActiveTier('ALL')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTier === 'ALL'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Evaluated ({recommendations.length})
        </button>
        <button
          onClick={() => setActiveTier('INELIGIBLE')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
            activeTier === 'INELIGIBLE'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ineligible ({ineligibleCount})
        </button>
      </div>

      {/* Mandatory Disclaimer Advisory */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-900">Academic Advisory:</strong> The match score is an analytical estimate
          derived from student profile attributes and stated grant criteria. It does not constitute a guarantee of award
          or funding selection.
        </p>
      </div>

      {/* Recommendation Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
          <p className="text-sm">No scholarships found under the selected eligibility tier.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecs.map((rec) => {
            const isEligible = rec.eligibility_status === 'ELIGIBLE';
            const isPotential = rec.eligibility_status === 'POTENTIALLY_ELIGIBLE';
            const isIneligible = rec.eligibility_status === 'INELIGIBLE';

            return (
              <div
                key={rec.scholarship_id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Row: Provider & Title + Match Score */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-teal-700">{rec.provider}</span>
                      <span aria-hidden="true">·</span>
                      <span>{rec.funding_type}</span>
                      <span aria-hidden="true">·</span>
                      {isEligible && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                        </span>
                      )}
                      {isPotential && (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Verify Criteria
                        </span>
                      )}
                      {isIneligible && (
                        <span className="text-rose-700 font-semibold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Ineligible
                        </span>
                      )}
                    </div>

                    <h2
                      onClick={() => onSelectScholarship(rec)}
                      className="text-base font-bold text-slate-900 hover:text-teal-700 transition-colors cursor-pointer"
                    >
                      {rec.scholarship_name}
                    </h2>

                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="font-mono tabular-nums font-semibold text-slate-900">
                        {rec.currency} {rec.amount.toLocaleString()}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Deadline: {rec.application_deadline}</span>
                      </span>
                      {rec.days_left !== null && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className={rec.days_left <= 15 ? 'text-rose-600 font-medium' : 'text-slate-500'}>
                            {rec.days_left} days left
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Match Score Gauge */}
                  <div className="sm:text-right shrink-0 bg-slate-50 p-2.5 rounded-lg border border-slate-100 min-w-[130px]">
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                        {rec.match_score}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">Estimated Match</div>
                  </div>
                </div>

                {/* Sub-Scores Breakdown Bar */}
                {rec.sub_scores && (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px] p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
                    <div>
                      <div className="text-slate-500">Academic Fit</div>
                      <div className="font-mono font-bold text-slate-800">
                        {Math.round(rec.sub_scores.academic * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Financial Need</div>
                      <div className="font-mono font-bold text-slate-800">
                        {Math.round(rec.sub_scores.financial_need * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Course / Major</div>
                      <div className="font-mono font-bold text-slate-800">
                        {Math.round(rec.sub_scores.course_level * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Geographic</div>
                      <div className="font-mono font-bold text-slate-800">
                        {Math.round(rec.sub_scores.geographic * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Skills / Awards</div>
                      <div className="font-mono font-bold text-slate-800">
                        {Math.round(rec.sub_scores.skills_achievements * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Deadline Fit</div>
                      <div className="font-mono font-bold text-slate-800">
                        {Math.round(rec.sub_scores.deadline_suitability * 100)}%
                      </div>
                    </div>
                  </div>
                )}

                {/* Match Reasons & Missing Conditions */}
                <div className="space-y-1.5 text-xs">
                  {rec.match_reasons.length > 0 && (
                    <div className="space-y-1">
                      {rec.match_reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {rec.missing_or_verify.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {rec.missing_or_verify.map((condition, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-amber-800">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                          <span>{condition}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {rec.fail_reasons && rec.fail_reasons.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {rec.fail_reasons.map((f, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-rose-800">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleSave(rec.scholarship_id)}
                      className={`px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                        rec.is_saved
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${rec.is_saved ? 'fill-amber-600 text-amber-600' : ''}`} />
                      <span>{rec.is_saved ? 'Saved' : 'Bookmark'}</span>
                    </button>

                    <button
                      onClick={() => onAddToTracker(rec)}
                      className="px-2.5 py-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
                      <span>{rec.application_status ? `In Tracker (${rec.application_status})` : 'Track Application'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectScholarship(rec)}
                      className="px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                    >
                      View Eligibility Details
                    </button>

                    <a
                      href={rec.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <span>Official Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
