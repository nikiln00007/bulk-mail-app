import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, RefreshCw, Mail, RotateCcw } from 'lucide-react';
import { mailService } from '../services/api';
import toast from 'react-hot-toast';

const TRASH_KEY = 'bulkmail_trash';

const Trash = () => {
  const [trash, setTrash] = useState(() => {
    try { return JSON.parse(localStorage.getItem(TRASH_KEY) || '[]'); }
    catch { return []; }
  });

  const restore = (id) => {
    setTrash((prev) => {
      const next = prev.filter((i) => i.id !== id);
      localStorage.setItem(TRASH_KEY, JSON.stringify(next));
      return next;
    });
    toast.success('Item restored');
  };

  const emptyTrash = () => {
    setTrash([]);
    localStorage.setItem(TRASH_KEY, '[]');
    toast.success('Trash emptied');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-slate-500" />
            Trash
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{trash.length} deleted item{trash.length !== 1 ? 's' : ''}</p>
        </div>
        {trash.length > 0 && (
          <button
            onClick={emptyTrash}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Empty Trash
          </button>
        )}
      </div>

      {trash.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-slate-400" />
          </div>
          <h4 className="font-bold text-slate-700 text-lg">Trash is empty</h4>
          <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
            Deleted emails and campaigns will appear here before being permanently removed.
          </p>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
          >
            <Mail className="w-3.5 h-3.5" />
            View Email History
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100">
          {trash.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate text-sm">{item.subject || 'Untitled'}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.deletedAt ? `Deleted ${new Date(item.deletedAt).toLocaleDateString()}` : ''}</p>
                </div>
              </div>
              <button
                onClick={() => restore(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors shrink-0 ml-4"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trash;
