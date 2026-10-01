import React from 'react';
import { Mail, Clock, Users, ArrowUpRight, ShieldCheck } from 'lucide-react';

const EmailPreview = ({ subject, body, recipientCount, senderName = 'BulkMail Pro Admin' }) => {
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Top Header of the email reading pane */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Live Email Preview
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs font-medium">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>{recipientCount} recipient{recipientCount === 1 ? '' : 's'}</span>
        </div>
      </div>

      {/* Email Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 break-words leading-snug">
          {subject.trim() || <span className="text-slate-300 italic">No subject specified</span>}
        </h3>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
              {senderName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{senderName}</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                  <ShieldCheck className="w-3 h-3 text-blue-600" /> Verified Sender
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <span>To:</span>
                <span className="text-slate-700 font-medium">
                  {recipientCount > 0 ? `${recipientCount} Selected Recipient(s)` : 'Undisclosed recipients'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Body Content */}
      <div className="p-5 sm:p-6 flex-1 overflow-y-auto bg-slate-50/30">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs min-h-[220px]">
          {body.trim() ? (
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
              {body}
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400">
              <Mail className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium">Start typing an email message to preview it here.</p>
              <p className="text-xs text-slate-400 mt-1">
                Recipients will receive this clean formatted message.
              </p>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Powered by BulkMail Pro</span>
            <span className="flex items-center gap-1">
              Unsubscribe Link included automatically
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;
