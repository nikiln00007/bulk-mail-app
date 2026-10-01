import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Send,
  Clock,
  X,
  Save,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'bulkmail_drafts';

const Drafts = () => {
  const [drafts, setDrafts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          subject: 'Welcome Newsletter — Q4 Edition',
          body: 'Dear {{name}}, We are thrilled to share...',
          recipients: 'subscribers@example.com, team@example.com',
          savedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 2,
          subject: 'Product Launch Announcement',
          body: 'Hi {{name}}, Our newest product is finally here...',
          recipients: 'leads@example.com',
          savedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
      ];
    } catch {
      return [];
    }
  });

  const [editing, setEditing] = useState(null); // draft being edited
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ subject: '', body: '', recipients: '' });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }, [drafts]);

  const saveDraft = () => {
    if (!form.subject.trim()) {
      toast.error('Subject is required to save a draft');
      return;
    }
    if (editing) {
      setDrafts((prev) =>
        prev.map((d) => (d.id === editing ? { ...d, ...form, savedAt: new Date().toISOString() } : d))
      );
      toast.success('Draft updated');
      setEditing(null);
    } else {
      setDrafts((prev) => [
        { id: Date.now(), ...form, savedAt: new Date().toISOString() },
        ...prev,
      ]);
      toast.success('Draft saved!');
    }
    setForm({ subject: '', body: '', recipients: '' });
    setShowNew(false);
  };

  const startEdit = (draft) => {
    setEditing(draft.id);
    setForm({ subject: draft.subject, body: draft.body, recipients: draft.recipients });
    setShowNew(true);
  };

  const deleteDraft = (id) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    toast.success('Draft deleted');
  };

  const cancelEdit = () => {
    setEditing(null);
    setShowNew(false);
    setForm({ subject: '', body: '', recipients: '' });
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Drafts</h2>
          <p className="text-sm text-slate-500 mt-0.5">{drafts.length} saved draft{drafts.length !== 1 ? 's' : ''}</p>
        </div>
        {!showNew && (
          <button
            onClick={() => { setShowNew(true); setEditing(null); setForm({ subject: '', body: '', recipients: '' }); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Draft
          </button>
        )}
      </div>

      {/* Draft Editor */}
      {showNew && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              {editing ? 'Edit Draft' : 'New Draft'}
            </h3>
            <button onClick={cancelEdit} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Subject</label>
            <input
              type="text"
              placeholder="Email subject line..."
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Recipients (comma-separated)</label>
            <input
              type="text"
              placeholder="user1@example.com, user2@example.com"
              value={form.recipients}
              onChange={(e) => setForm({ ...form, recipients: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Body</label>
            <textarea
              rows={5}
              placeholder="Write your email body here. Use {{name}} for personalization..."
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveDraft}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              {editing ? 'Update Draft' : 'Save Draft'}
            </button>
            <Link
              to="/compose"
              state={{ draft: form }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Send Now
            </Link>
          </div>
        </div>
      )}

      {/* Drafts List */}
      {drafts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="font-bold text-slate-700">No drafts yet</h4>
          <p className="text-xs text-slate-500 mt-1">Start writing and save emails here for later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 truncate">{draft.subject || 'Untitled Draft'}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{draft.body}</p>
                  {draft.recipients && (
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      To: {draft.recipients}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Saved {formatDate(draft.savedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => startEdit(draft)}
                  className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-all"
                  title="Edit draft"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <Link
                  to="/compose"
                  state={{ draft }}
                  className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all"
                  title="Send this draft"
                >
                  <Send className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => deleteDraft(draft.id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
                  title="Delete draft"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Drafts;
