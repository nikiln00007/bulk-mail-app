import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Send,
  History,
  Settings,
  LogOut,
  Mail,
  X,
  FileText,
  Star,
  Trash2,
  AlertOctagon,
  Users,
  Tag,
  Plus,
  ChevronDown,
  Inbox,
} from 'lucide-react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const LABEL_COLORS = [
  { name: 'Personal', color: '#22c55e' },
  { name: 'School',   color: '#3b82f6' },
  { name: 'Social',   color: '#a855f7' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || {
    name: 'Admin User',
    email: 'admin@bulkmailpro.com',
  };

  const [labelsOpen, setLabelsOpen] = useState(true);
  const [labels, setLabels] = useState(LABEL_COLORS);
  const [addingLabel, setAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');

  const mainNav = [
    { name: 'Dashboard',    path: '/dashboard', icon: LayoutDashboard },
    { name: 'Compose Mail', path: '/compose',   icon: Send },
    { name: 'Email History',path: '/history',   icon: History },
    { name: 'Contacts',     path: '/contacts',  icon: Users },
    { name: 'Settings',     path: '/settings',  icon: Settings },
  ];

  // Mail-folder style items — counts are illustrative
  const folderItems = [
    { name: 'Inbox',      path: '/dashboard', icon: Inbox,       count: null,   badge: true  },
    { name: 'Sent Mails', path: '/history',   icon: Send,        count: null,   badge: false },
    { name: 'Drafts',     path: '/drafts',    icon: FileText,    count: null,   badge: false },
    { name: 'Favourites', path: '/favourites',icon: Star,        count: null,   badge: false },
    { name: 'Spam',       path: '/spam',      icon: AlertOctagon,count: null,   badge: false },
    { name: 'Trash',      path: '/trash',     icon: Trash2,      count: null,   badge: false },
  ];

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const addLabel = () => {
    const name = newLabelName.trim();
    if (!name) return;
    const colors = ['#f59e0b', '#ef4444', '#06b6d4', '#10b981', '#ec4899'];
    setLabels((prev) => [...prev, { name, color: colors[prev.length % colors.length] }]);
    setNewLabelName('');
    setAddingLabel(false);
    toast.success(`Label "${name}" added`);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#F1F5F9] border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
      >
        {/* ── Brand Logo ── */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200/80 bg-white/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                BulkMail <span className="text-blue-600">Pro</span>
              </h1>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Campaign Suite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Compose Button ── */}
        <div className="px-4 pt-4">
          <NavLink
            to="/compose"
            onClick={() => onClose && onClose()}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Message
          </NavLink>
        </div>

        {/* ── Mail Folders ── */}
        <nav className="px-4 pt-4 space-y-0.5">
          {folderItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path + item.name}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* ── LABELS ── */}
        <div className="px-4 pt-5">
          <button
            onClick={() => setLabelsOpen((o) => !o)}
            className="flex items-center justify-between w-full px-1 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider"
          >
            <span>Labels</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${labelsOpen ? '' : '-rotate-90'}`}
            />
          </button>

          {labelsOpen && (
            <div className="space-y-0.5">
              {labels.map((label) => (
                <button
                  key={label.name}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-all font-medium"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  {label.name}
                </button>
              ))}

              {/* Add Label */}
              {addingLabel ? (
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Label name..."
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addLabel(); if (e.key === 'Escape') setAddingLabel(false); }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button onClick={addLabel} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingLabel(true)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl w-full transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Labels
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom Profile & Logout ── */}
        <div className="mt-auto p-4 border-t border-slate-200/80 bg-white/40">
          <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-sm mb-3 flex items-center gap-3">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-blue-100"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">{user.name || 'Admin'}</div>
              <div className="text-[11px] text-slate-500 truncate">{user.email || 'admin@bulkmailpro.com'}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
