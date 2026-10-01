import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Mail, Send, ArrowRight, ChevronRight } from 'lucide-react';
import { mailService } from '../services/api';
import toast from 'react-hot-toast';

const Favourites = () => {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const FAV_KEY = 'bulkmail_favourites';

  const [favIds, setFavIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    mailService.getHistory()
      .then((data) => setAll(data))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const toggleFav = (id) => {
    setFavIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  };

  const favourited = all.filter((m) => favIds.includes(m._id));

  const getStatusBadge = (status) => {
    const map = {
      Success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Failed:  'bg-rose-50 text-rose-700 border-rose-200',
      Partial: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return map[status] || map.Partial;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          Favourites
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {favourited.length} starred campaign{favourited.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
          <p className="text-xs">Loading campaigns...</p>
        </div>
      ) : all.length > 0 && favourited.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-amber-400" />
          </div>
          <h4 className="font-bold text-slate-700">No favourites yet</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Star campaigns from your Email History to pin them here.
          </p>
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all"
          >
            Go to History <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : all.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-sm">
          <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700">No campaigns sent yet</h4>
          <Link to="/compose" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">
            <Send className="w-3.5 h-3.5" /> Compose Mail
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5 w-10">⭐</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Recipients</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {favourited.map((mail) => (
                  <tr key={mail._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <button onClick={() => toggleFav(mail._id)} className="text-lg">⭐</button>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">{mail.subject}</td>
                    <td className="py-3.5 px-4 text-slate-600">{mail.totalRecipients || mail.recipients?.length || 0}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(mail.status)}`}>
                        {mail.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(mail.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/history/${mail._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Star unfavourited from the full list */}
      {all.filter((m) => !favIds.includes(m._id)).length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">All Campaigns — click ☆ to favourite</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {all.filter((m) => !favIds.includes(m._id)).map((mail) => (
              <div key={mail._id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => toggleFav(mail._id)} className="text-lg shrink-0">☆</button>
                  <p className="font-semibold text-slate-800 truncate text-sm">{mail.subject}</p>
                </div>
                <Link
                  to={`/history/${mail._id}`}
                  className="text-xs text-blue-600 font-semibold hover:underline shrink-0 ml-4"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Favourites;
