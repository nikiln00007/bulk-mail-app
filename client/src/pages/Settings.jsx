import React from 'react';
import {
  Server,
  Shield,
  User,
  LogOut,
  Mail,
  Key,
  Info,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || {
    name: 'Administrator',
    email: 'admin@bulkmailpro.com',
  };

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          System & SMTP Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          View your email dispatch gateway parameters and administrator profile
        </p>
      </div>

      {/* SMTP Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">SMTP Gateway Configuration</h3>
              <p className="text-xs text-slate-500">
                Active mailing transport settings loaded from server environment
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Connected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              SMTP Host
            </span>
            <p className="text-sm font-semibold text-slate-900 mt-1 font-mono">
              smtp.gmail.com
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">TLS / SSL Relay Server</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              SMTP Port
            </span>
            <p className="text-sm font-semibold text-slate-900 mt-1 font-mono">
              587 (or 465)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Standard Secure Port</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sender Email
            </span>
            <p className="text-sm font-semibold text-slate-900 mt-1 font-mono truncate">
              BulkMail Pro Gateway
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Configured in server/.env</p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
          <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-900">Security Safeguard:</strong> SMTP
            credentials and passwords are encrypted and strictly protected on the backend. They are
            never exposed or transmitted to client browsers.
          </div>
        </div>
      </div>

      {/* Gmail App Password Setup Instructions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">How to Setup Gmail App Password</h3>
            <p className="text-xs text-slate-500">
              Quick guide to configure real delivery using Google SMTP
            </p>
          </div>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
          <li>
            Go to your Google Account &gt; <strong className="text-slate-800">Security</strong>.
          </li>
          <li>
            Ensure <strong className="text-slate-800">2-Step Verification</strong> is enabled.
          </li>
          <li>
            Search for <strong className="text-slate-800">App Passwords</strong> in the top search bar.
          </li>
          <li>
            Create a new app name (e.g. <em>BulkMail Pro</em>) and copy the generated 16-character code.
          </li>
          <li>
            Open <code className="px-1.5 py-0.5 bg-slate-100 rounded text-blue-600 font-mono text-xs">server/.env</code> and set:
            <pre className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto">
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM=BulkMail Pro &lt;your_email@gmail.com&gt;</pre>
          </li>
        </ol>
      </div>

      {/* Admin Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Admin Account Info</h3>
              <p className="text-xs text-slate-500">Active session identity details</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">{user.name}</h4>
              <p className="text-xs text-slate-500">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider">
                Full Administrator
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold transition-colors self-start sm:self-center"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
