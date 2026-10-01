import React from 'react';
import { Menu, Plus, Bell, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const Navbar = ({ onOpenSidebar }) => {
  const location = useLocation();
  const user = authService.getCurrentUser() || { name: 'Admin' };

  // Generate title based on current path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/compose':
        return 'Compose Bulk Mail';
      case '/history':
        return 'Email History';
      case '/settings':
        return 'System & SMTP Settings';
      default:
        if (location.pathname.startsWith('/history/')) {
          return 'Campaign Details';
        }
        return 'Dashboard';
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {getPageTitle()}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            BulkMail Pro Enterprise Dispatcher
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick action button */}
        {location.pathname !== '/compose' && (
          <Link
            to="/compose"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Mail</span>
          </Link>
        )}

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {/* User badge */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-bold text-xs flex items-center justify-center">
            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden md:inline">
            {user.name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
