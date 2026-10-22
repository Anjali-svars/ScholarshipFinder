import React, { useState, useEffect } from 'react';
import { Scholarship, AuditLog } from '../types';
import { api } from '../api';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Download,
  Terminal,
  FileSpreadsheet,
  Clock,
  Search,
  RefreshCw,
  Play
} from 'lucide-react';

interface AdminViewProps {
  scholarships: Scholarship[];
  onRefreshScholarships: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  scholarships,
  onRefreshScholarships,
}) => {
  const [activeTab, setActiveTab] = useState<'scholarships' | 'audit' | 'tests'>('scholarships');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // New scholarship modal / form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [formName, setFormName] = useState('');
  const [formProvider, setFormProvider] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState(50000);
  const [formFundingType, setFormFundingType] = useState('Merit-Based');
  const [formDeadline, setFormDeadline] = useState('2026-12-31');
  const [formMinScore, setFormMinScore] = useState(70);
  const [formMaxIncome, setFormMaxIncome] = useState<number | ''>(500000);
  const [formUrl, setFormUrl] = useState('https://scholarships.gov.in');
  const [savingForm, setSavingForm] = useState(false);

  // Test Runner state
  const [runningTests, setRunningTests] = useState(false);
  const [testOutput, setTestOutput] = useState<{ stdout: string; stderr: string; success: boolean } | null>(null);

  // Load audit logs when switching to audit tab
  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab]);

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const logs = await api.adminGetAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleToggleVerify = async (id: number) => {
    try {
      await api.adminToggleVerify(id);
      onRefreshScholarships();
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this scholarship record?')) {
      try {
        await api.adminDeleteScholarship(id);
        onRefreshScholarships();
      } catch (err: any) {
        alert('Error deleting: ' + err.message);
      }
    }
  };

  const handleExportCSV = () => {
    window.open('/api/admin/export-csv', '_blank');
  };

  const handleRunPythonTests = async () => {
    setRunningTests(true);
    setTestOutput(null);
    try {
      const res = await api.adminRunTests();
      setTestOutput(res);
    } catch (err: any) {
      setTestOutput({
        stdout: '',
        stderr: err.message,
        success: false,
      });
    } finally {
      setRunningTests(false);
    }
  };

  const openAddModal = () => {
    setEditingScholarship(null);
    setFormName('');
    setFormProvider('');
    setFormDesc('');
    setFormAmount(60000);
    setFormFundingType('Merit-Based');
    setFormDeadline('2026-12-31');
    setFormMinScore(75);
    setFormMaxIncome(600000);
    setFormUrl('https://scholarships.gov.in');
    setShowAddModal(true);
  };

  const openEditModal = (s: Scholarship) => {
    setEditingScholarship(s);
    setFormName(s.name);
    setFormProvider(s.provider);
    setFormDesc(s.description);
    setFormAmount(s.amount);
    setFormFundingType(s.funding_type);
    setFormDeadline(s.application_deadline);
    setFormMinScore(s.min_academic_score);
    setFormMaxIncome(s.max_family_income || '');
    setFormUrl(s.official_url);
    setShowAddModal(true);
  };

  const handleSaveScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingForm(true);
    try {
      const payload: Partial<Scholarship> = {
        name: formName,
        provider: formProvider,
        description: formDesc,
        amount: formAmount,
        currency: '₹',
        funding_type: formFundingType,
        application_deadline: formDeadline,
        min_academic_score: formMinScore,
        max_family_income: formMaxIncome ? Number(formMaxIncome) : null,
        official_url: formUrl,
        education_levels: ['Undergraduate', 'Postgraduate'],
        courses: ['All Fields'],
        required_documents: ['Academic Marksheets', 'College Bonafide Certificate'],
      };

      if (editingScholarship) {
        await api.adminUpdateScholarship(editingScholarship.id, payload);
      } else {
        await api.adminCreateScholarship(payload);
      }
      setShowAddModal(false);
      onRefreshScholarships();
    } catch (err: any) {
      alert('Failed to save scholarship: ' + err.message);
    } finally {
      setSavingForm(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-800">Administrator Console</span>
            <span aria-hidden="true">·</span>
            <span>Academic Project Evaluation Mode</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Administration & Testing Suite
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage scholarship records, audit system actions, export data, and execute live Python recommendation test suites.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scholarship</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('scholarships')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'scholarships'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Scholarship Catalog ({scholarships.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          System Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'tests'
              ? 'border-teal-600 text-teal-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Automated Python Test Suite Runner
        </button>
      </div>

      {/* TAB 1: Scholarship Catalog CRUD */}
      {activeTab === 'scholarships' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Database Records</span>
            <button
              onClick={onRefreshScholarships}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                  <th className="p-3">ID</th>
                  <th className="p-3">Scholarship Name & Provider</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Cutoff</th>
                  <th className="p-3">Deadline</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scholarships.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-mono text-slate-500">{s.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.provider}</div>
                    </td>
                    <td className="p-3 font-mono tabular-nums font-semibold text-slate-900">
                      {s.currency} {s.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-700">{s.funding_type}</td>
                    <td className="p-3 font-mono tabular-nums text-slate-700">
                      {s.min_academic_score > 0 ? `${s.min_academic_score}%` : 'Open'}
                    </td>
                    <td className="p-3 font-mono tabular-nums text-slate-700">
                      {s.application_deadline}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleVerify(s.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                          s.is_verified
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                        title="Click to toggle verification status"
                      >
                        {s.is_verified ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Unverified</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="Edit scholarship"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                        title="Delete scholarship"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: System Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Administrative Audit Trail</span>
            <button
              onClick={loadAuditLogs}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {loadingAudit ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading audit trail...</div>
          ) : auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">No audit events recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor Email</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="p-3 font-mono text-slate-500">{log.created_at?.slice(0, 19).replace('T', ' ')}</td>
                      <td className="p-3 font-medium text-slate-800">{log.admin_email}</td>
                      <td className="p-3 font-mono font-semibold text-teal-800">{log.action}</td>
                      <td className="p-3 text-slate-600">{log.target_entity} #{log.target_id}</td>
                      <td className="p-3 text-slate-600">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Automated Test Suite Runner */}
      {activeTab === 'tests' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Automated Python Backend Test Runner
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Executes <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">backend/tests/test_scholarship_system.py</code> directly on the server to validate academic filtering, ranking algorithms, and auth constraints.
              </p>
            </div>

            <button
              onClick={handleRunPythonTests}
              disabled={runningTests}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
            >
              <Play className="w-3.5 h-3.5 text-teal-400" />
              <span>{runningTests ? 'Running Python Tests...' : 'Execute Automated Tests'}</span>
            </button>
          </div>

          {testOutput && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold">
                {testOutput.success ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    All Automated Unit Tests Passed (Exit Code 0)
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Tests Completed with Failures
                  </span>
                )}
              </div>

              <div className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800 max-h-96">
                <div className="text-teal-400 mb-2">$ python3 backend/tests/test_scholarship_system.py</div>
                <pre className="whitespace-pre-wrap">{testOutput.stdout || testOutput.stderr}</pre>
              </div>
            </div>
          )}

          {!testOutput && !runningTests && (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Terminal className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-medium text-slate-700">Click "Execute Automated Tests" to run validation</p>
              <p className="text-slate-400 mt-1">Tests 9 critical components: score normalization, eligibility filters, income checks, weighted ranking, and auth hashing.</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Scholarship Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingScholarship ? 'Edit Scholarship Record' : 'Add New Scholarship Record'}
            </h2>

            <form onSubmit={handleSaveScholarship} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Scholarship Title *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Sponsoring Provider Organization *</label>
                <input
                  type="text"
                  required
                  value={formProvider}
                  onChange={(e) => setFormProvider(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Grant Value (Amount in ₹) *</label>
                <input
                  type="number"
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(parseFloat(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Funding Type</label>
                  <select
                    value={formFundingType}
                    onChange={(e) => setFormFundingType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Merit-Based">Merit-Based</option>
                    <option value="Need-Based">Need-Based</option>
                    <option value="Merit-cum-Need">Merit-cum-Need</option>
                    <option value="Special Category">Special Category</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Min. Academic Score (%)</label>
                  <input
                    type="number"
                    value={formMinScore}
                    onChange={(e) => setFormMinScore(parseFloat(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Max Family Income (₹)</label>
                  <input
                    type="number"
                    value={formMaxIncome}
                    onChange={(e) => setFormMaxIncome(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="Leave empty if none"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Application URL</label>
                <input
                  type="url"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Brief Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingForm}
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs"
                >
                  {savingForm ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
