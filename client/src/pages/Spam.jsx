import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ShieldCheck } from 'lucide-react';

const Spam = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
        <AlertOctagon className="w-6 h-6 text-rose-500" />
        Spam
      </h2>
      <p className="text-sm text-slate-500 mt-0.5">Messages marked as spam</p>
    </div>
    <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
        <ShieldCheck className="w-7 h-7 text-emerald-500" />
      </div>
      <h4 className="font-bold text-slate-700 text-lg">You're all clear!</h4>
      <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
        No spam messages detected. BulkMail Pro's sending engine maintains high deliverability to keep you out of spam folders.
      </p>
      <Link
        to="/settings"
        className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
      >
        Review SMTP Settings
      </Link>
    </div>
  </div>
);

export default Spam;
