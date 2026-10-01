import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  CheckCircle2,
  XCircle,
  Layers,
  Calendar,
  ArrowRight,
  RefreshCw,
  Mail,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { mailService } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmails: 0,
    successEmails: 0,
    failedEmails: 0,
    totalCampaigns: 0,
    todayEmails: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [statsData, historyData] = await Promise.all([
        mailService.getStats(),
        mailService.getHistory(),
      ]);

      setStats(statsData);
      setRecentCampaigns(historyData.slice(0, 5));
      if (isManualRefresh) {
        toast.success('Dashboard metrics refreshed');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Success
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Failed
          </span>
        );
      case 'Partial':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Partial
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-blue-200" />
            <span>High Deliverability SMTP Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bulk Email Campaign Central
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Send high-volume personalized emails, monitor real-time delivery status, and analyze performance effortlessly.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/compose"
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Bulk Mail</span>
          </Link>
        </div>

        {/* Decorative background circles */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <StatCard
          title="Total Emails Sent"
          value={loading ? '...' : stats.totalEmails}
          icon={Mail}
          color="blue"
          subtitle="All-time dispatches"
        />
        <StatCard
          title="Successful Deliveries"
          value={loading ? '...' : stats.successEmails}
          icon={CheckCircle2}
          color="green"
          subtitle="Delivered to recipients"
        />
        <StatCard
          title="Failed Emails"
          value={loading ? '...' : stats.failedEmails}
          icon={XCircle}
          color="red"
          subtitle="Bounced or rejected"
        />
        <StatCard
          title="Total Campaigns"
          value={loading ? '...' : stats.totalCampaigns}
          icon={Layers}
          color="purple"
          subtitle="Completed batches"
        />
        <StatCard
          title="Today's Emails"
          value={loading ? '...' : stats.todayEmails}
          icon={Calendar}
          color="orange"
          subtitle="Processed today"
        />
      </div>

      {/* Recent Campaigns Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Campaigns</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your most recent bulk dispatches and performance
            </p>
          </div>
          <Link
            to="/history"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>View All History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mb-3" />
            <span className="text-xs font-medium">Loading campaign records...</span>
          </div>
        ) : recentCampaigns.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No email campaigns sent yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Start dispatching bulk messages to your contacts. Your campaign statistics will appear right here.
            </p>
            <Link
              to="/compose"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Create First Campaign</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Recipients</th>
                  <th className="py-3.5 px-6">Success</th>
                  <th className="py-3.5 px-6">Failed</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Sent Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentCampaigns.map((mail) => (
                  <tr key={mail._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 max-w-xs truncate">
                      {mail.subject}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {mail.totalRecipients || mail.recipients?.length || 0}
                    </td>
                    <td className="py-4 px-6 text-emerald-600 font-semibold">
                      {mail.successCount || 0}
                    </td>
                    <td className="py-4 px-6 text-rose-600 font-semibold">
                      {mail.failedCount || 0}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(mail.status)}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(mail.sentAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/history/${mail._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
