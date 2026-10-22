import React, { useState, useMemo } from 'react';
import { Scholarship } from '../types';
import {
  Search,
  Filter,
  X,
  Bookmark,
  Calendar,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DiscoverViewProps {
  scholarships: Scholarship[];
  loading: boolean;
  onSelectScholarship: (scholarship: Scholarship) => void;
  onToggleSave: (id: number) => void;
  savedIds: Set<number>;
  onAddToTracker: (scholarship: Scholarship) => void;
  onSearchChange: (filters: Record<string, any>) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  scholarships,
  loading,
  onSelectScholarship,
  onToggleSave,
  savedIds,
  onAddToTracker,
  onSearchChange,
}) => {
  const [search, setSearch] = useState('');
  const [educationLevel, setEducationLevel] = useState('all');
  const [fundingType, setFundingType] = useState('all');
  const [maxIncome, setMaxIncome] = useState('');
  const [minScore, setMinScore] = useState('');
  const [sortBy, setSortBy] = useState<'deadline' | 'amount_desc' | 'amount_asc' | 'score_asc'>('deadline');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange({
      search,
      education_level: educationLevel,
      funding_type: fundingType,
      max_income: maxIncome,
      min_score: minScore,
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setEducationLevel('all');
    setFundingType('all');
    setMaxIncome('');
    setMinScore('');
    onSearchChange({});
    setCurrentPage(1);
  };

  // Client-side sorting
  const sortedScholarships = useMemo(() => {
    const list = [...scholarships];
    if (sortBy === 'deadline') {
      list.sort((a, b) => a.application_deadline.localeCompare(b.application_deadline));
    } else if (sortBy === 'amount_desc') {
      list.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount_asc') {
      list.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === 'score_asc') {
      list.sort((a, b) => a.min_academic_score - b.min_academic_score);
    }
    return list;
  }, [scholarships, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedScholarships.length / itemsPerPage) || 1;
  const paginatedItems = sortedScholarships.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>Database Discovery Catalog</span>
          <span aria-hidden="true">·</span>
          <span>{scholarships.length} Available Opportunities</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Discover All Scholarships
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Filter through government, corporate, institutional, and trust-sponsored student grant opportunities.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by scholarship title, provider agency, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Multi-Faceted Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs border-t border-slate-100">
          {/* Education Level */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Education Level</label>
            <select
              value={educationLevel}
              onChange={(e) => {
                setEducationLevel(e.target.value);
                onSearchChange({ education_level: e.target.value, search, funding_type: fundingType });
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Education Levels</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="postgraduate">Postgraduate</option>
              <option value="high school">High School</option>
              <option value="doctoral">Doctoral / PhD</option>
              <option value="diploma">Diploma</option>
            </select>
          </div>

          {/* Funding Type */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Funding Type</label>
            <select
              value={fundingType}
              onChange={(e) => {
                setFundingType(e.target.value);
                onSearchChange({ funding_type: e.target.value, search, education_level: educationLevel });
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All Funding Types</option>
              <option value="merit-based">Merit-Based</option>
              <option value="need-based">Need-Based</option>
              <option value="merit-cum-need">Merit-cum-Need</option>
              <option value="special category">Special Category</option>
            </select>
          </div>

          {/* Min Score Cutoff */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Max Min-Cutoff (%)</label>
            <input
              type="number"
              placeholder="e.g. 75"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Sort Results By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
            >
              <option value="deadline">Approaching Deadline</option>
              <option value="amount_desc">Amount (Highest First)</option>
              <option value="amount_asc">Amount (Lowest First)</option>
              <option value="score_asc">Minimum Cutoff (Lowest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing {paginatedItems.length} of {sortedScholarships.length} scholarships</span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Scholarships Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
          <p className="text-sm">No scholarships match the selected query or filter criteria.</p>
          <button
            onClick={handleClearFilters}
            className="mt-3 text-xs font-semibold text-teal-700 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedItems.map((sch) => {
            const isSaved = savedIds.has(sch.id);
            return (
              <div
                key={sch.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-teal-700 truncate max-w-[180px]">{sch.provider}</span>
                      <span aria-hidden="true">·</span>
                      <span>{sch.funding_type}</span>
                    </div>

                    <button
                      onClick={() => onToggleSave(sch.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors"
                      title={isSaved ? 'Remove from saved' : 'Save scholarship'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  <h2
                    onClick={() => onSelectScholarship(sch)}
                    className="text-base font-bold text-slate-900 hover:text-teal-700 transition-colors cursor-pointer line-clamp-1"
                  >
                    {sch.name}
                  </h2>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {sch.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-500">Grant Value:</span>{' '}
                      <span className="font-mono tabular-nums font-bold text-slate-900">
                        {sch.currency} {sch.amount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Min. Score:</span>{' '}
                      <span className="font-mono tabular-nums font-medium text-slate-800">
                        {sch.min_academic_score > 0 ? `${sch.min_academic_score}%` : 'Open'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Deadline:</span>{' '}
                      <span className="font-mono tabular-nums text-slate-800">
                        {sch.application_deadline}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Income Limit:</span>{' '}
                      <span className="font-mono tabular-nums text-slate-800">
                        {sch.max_family_income ? `≤ ₹${sch.max_family_income.toLocaleString()}` : 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onAddToTracker(sch)}
                    className="px-2.5 py-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>Add to Tracker</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectScholarship(sch)}
                      className="px-3 py-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors font-medium"
                    >
                      Details
                    </button>
                    <a
                      href={sch.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-200 rounded-lg disabled:opacity-40 text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-medium text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 border border-slate-200 rounded-lg disabled:opacity-40 text-slate-700 hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
