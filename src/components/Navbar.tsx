import React from 'react';
import { User } from '../types';
import { GraduationCap, UserCircle, LogOut, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenProfile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'discover', label: 'Discover' },
    { id: 'tracker', label: 'Tracker' },
    { id: 'checklist', label: 'Documents' },
    { id: 'compare', label: 'Compare' },
    ...(currentUser?.role === 'admin'
      ? [{ id: 'admin', label: 'Admin Console' }]
      : [{ id: 'admin', label: 'Admin Demo' }]),
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white hover:text-teal-400 transition-colors whitespace-nowrap shrink-0 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span>Scholarship Finder</span>
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'text-teal-400 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  title="View Student Profile"
                >
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  ) : (
                    <UserCircle className="w-4 h-4 text-teal-400" />
                  )}
                  <span className="max-w-[120px] truncate">
                    {currentUser.full_name || currentUser.email}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sub-navigation bar */}
      <div className="md:hidden overflow-x-auto border-t border-slate-800 bg-slate-900/90 px-4 py-2 flex items-center gap-4 scrollbar-none text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${
              currentTab === item.id
                ? 'bg-teal-500/20 text-teal-300 font-semibold'
                : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
