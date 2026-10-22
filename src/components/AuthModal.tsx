import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';
import { X, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register(email, password, fullName);
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(email, password);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setEmail('student@scholarshipfinder.edu');
      setPassword('Student@1234');
      setFullName('Ananya Sharma');
      setIsRegister(false);
    } else {
      setEmail('admin@scholarshipfinder.edu');
      setPassword('Admin@1234');
      setFullName('Administrator');
      setIsRegister(false);
    }
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isRegister ? 'Create Student Account' : 'Sign in to Scholarship Finder'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRegister
                ? 'Join to access tailored matching and track applications'
                : 'Access your saved matches and personalized recommendations'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Credentials */}
        <div className="px-6 pt-4">
          <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>One-Click Academic Evaluation Credentials</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="flex-1 py-1.5 px-2 bg-white text-teal-800 text-xs font-medium rounded-lg border border-teal-200 hover:bg-teal-50 transition-colors shadow-2xs"
              >
                Demo Student
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="flex-1 py-1.5 px-2 bg-white text-slate-800 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Administrator
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors shadow-sm"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-teal-700 hover:text-teal-800 font-medium"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account yet? Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
