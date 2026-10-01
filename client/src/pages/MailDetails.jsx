import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  User,
  Users,
  Copy,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { mailService } from '../services/api';
import toast from 'react-hot-toast';

const MailDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mail, setMail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'success', 'failed'

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await mailService.getMailById(id);
        setMail(data);
      } catch (err) {
        console.error('Fetch mail details error:', err);
        toast.error('Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this campaign record?')) {
      return;
    }

    try {
      await mailService.deleteMail(id);
      toast.success('Campaign record deleted');
      navigate('/history');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete campaign');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            All Delivered
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Failed
          </span>
        );
      case 'Partial':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Partial Delivery
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-slate-400">
        <div className="w-9 h-9 border-3 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mb-3" />
        <span className="text-xs font-medium">Loading campaign details...</span>
      </div>
    );
  }

  if (!mail) {
    return (
      <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
        <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Email Campaign Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          The requested email campaign record may have been deleted or does not exist.
        </p>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to History</span>
        </Link>
      </div>
    );
  }

  const successList = mail.successEmails || [];
  const failedList = mail.failedEmails || [];
  const allRecipients = mail.recipients || [];

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition-colors shadow-2xs"
            title="Back to History"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Campaign Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              ID: <span className="font-mono">{mail._id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge(mail.status)}

          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Record</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Target
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {mail.totalRecipients || allRecipients.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Delivered Successfully
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {mail.successCount || successList.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Delivery Failures
            </p>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {mail.failedCount || failedList.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Mail Reader Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Email Header Info */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {mail.subject}
              </h3>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Sent by: {mail.sentBy?.name || 'Administrator'}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(mail.sentAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(mail.body)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium transition-colors shadow-2xs self-start"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Body</span>
            </button>
          </div>
        </div>

        {/* Email Content Body */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Message Body
          </div>
          <div className="p-5 bg-slate-50/70 border border-slate-200/70 rounded-2xl text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
            {mail.body}
          </div>
        </div>

        {/* Recipients Breakdown Section */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h4 className="text-sm font-bold text-slate-900">
              Recipient Audit Log ({allRecipients.length})
            </h4>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({allRecipients.length})
              </button>
              <button
                onClick={() => setActiveTab('success')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'success'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Delivered ({successList.length})
              </button>
              <button
                onClick={() => setActiveTab('failed')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'failed'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Failed ({failedList.length})
              </button>
            </div>
          </div>

          {/* Recipient list display */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {activeTab === 'all' && (
              <>
                {allRecipients.map((email, idx) => {
                  const isDelivered = successList.includes(email);
                  const failRecord = failedList.find((f) => f.email === email);
                  return (
                    <div
                      key={idx}
                      className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-xs"
                    >
                      <span className="font-mono text-slate-700">{email}</span>
                      {isDelivered ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Delivered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3" /> {failRecord?.error || 'Failed'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {activeTab === 'success' && (
              <>
                {successList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No successful deliveries in this batch.
                  </div>
                ) : (
                  successList.map((email, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-xs"
                    >
                      <span className="font-mono text-slate-700">{email}</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                      </span>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'failed' && (
              <>
                {failedList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-emerald-600 font-medium">
                    Zero failures! All emails reached their destination.
                  </div>
                ) : (
                  failedList.map((fail, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-mono text-slate-800 font-medium">{fail.email}</span>
                        <span className="text-[11px] text-rose-500 mt-0.5">
                          Reason: {fail.error || 'SMTP rejection / unreachable'}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded shrink-0">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailDetails;
