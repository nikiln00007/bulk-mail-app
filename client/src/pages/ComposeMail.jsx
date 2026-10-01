import React, { useState, useId, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Trash2,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmailPreview from '../components/EmailPreview';
import { mailService, authService } from '../services/api';

const ComposeMail = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    recipientsInput: '',
  });

  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const currentUser = authService.getCurrentUser() || { name: 'BulkMail Pro Admin' };

  // Parse emails helper to calculate counts and live stats
  const parseEmails = (text) => {
    if (!text || typeof text !== 'string') return { valid: [], invalid: [] };
    const tokens = text
      .split(/[\s,;]+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const uniqueTokens = [...new Set(tokens)];

    const valid = [];
    const invalid = [];

    uniqueTokens.forEach((item) => {
      if (emailRegex.test(item)) {
        valid.push(item);
      } else {
        invalid.push(item);
      }
    });

    return { valid, invalid };
  };

  const { valid: validEmails, invalid: invalidEmails } = parseEmails(formData.recipientsInput);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle CSV file selection and parsing
  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('Please upload a valid .csv file');
      return;
    }

    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        // Extract all email addresses found in the CSV text
        const emailMatches = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/gi) || [];
        if (emailMatches.length === 0) {
          toast.error('No email addresses detected in CSV file');
          return;
        }

        const uniqueExtracted = [...new Set(emailMatches.map((em) => em.toLowerCase()))];

        // Append to existing or replace
        setFormData((prev) => {
          const currentTokens = prev.recipientsInput
            ? prev.recipientsInput.split(/[\s,;]+/).map((t) => t.trim()).filter(Boolean)
            : [];
          const combined = [...new Set([...currentTokens, ...uniqueExtracted])];
          return {
            ...prev,
            recipientsInput: combined.join(',\n'),
          };
        });

        toast.success(`Imported ${uniqueExtracted.length} emails from ${file.name}`);
      } catch (err) {
        console.error('CSV parse error:', err);
        toast.error('Failed to parse CSV file content');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setFormData({
      subject: '',
      body: '',
      recipientsInput: '',
    });
    setErrors({});
    setUploadedFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast('Form cleared', { icon: '🧹' });
  };

  const handleInsertTemplate = () => {
    setFormData({
      subject: 'Special Announcement: Welcome to BulkMail Pro Platform',
      body: `Hello valued partner,

We are thrilled to bring you our latest updates. Our team has worked tirelessly to build an enterprise-grade mailing engine designed to scale with your business.

Key Highlights of this update:
- 99.9% inbox deliverability with dedicated SMTP pipelines
- Live email preview and instant status tracking
- Comprehensive campaign analytics and CSV batch imports

Feel free to reply directly to this email if you have any questions or feedback.

Warm regards,
BulkMail Pro Team`,
      recipientsInput: formData.recipientsInput || 'alex.sample@gmail.com, maria.partner@company.org, dev.lead@techcorp.io',
    });
    toast('Template inserted', { icon: '✨' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.subject.trim()) {
      errs.subject = 'Subject is required.';
    }
    if (!formData.body.trim()) {
      errs.body = 'Email body message is required.';
    }
    if (!formData.recipientsInput.trim()) {
      errs.recipientsInput = 'At least one recipient email address is required.';
    } else if (validEmails.length === 0) {
      errs.recipientsInput = 'Please enter at least one valid recipient email.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please resolve the form errors before sending.');
      return;
    }

    try {
      setSending(true);

      const payload = {
        subject: formData.subject.trim(),
        body: formData.body,
        recipients: validEmails,
      };

      const result = await mailService.sendMail(payload);

      if (result.status === 'Success') {
        toast.success(`All ${result.successCount} emails sent successfully!`);
      } else if (result.status === 'Partial') {
        toast('Campaign completed with partial deliveries', {
          icon: '⚠️',
          style: { background: '#FEF3C7', color: '#92400E' },
        });
      } else {
        toast.error(`Email dispatch failed for all ${result.failedCount} recipients.`);
      }

      // Redirect to history or detail page
      navigate(`/history/${result.mailId || ''}`);
    } catch (err) {
      console.error('Send mail error:', err);
      const msg = err.response?.data?.message || 'Failed to send bulk email campaign.';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Compose Bulk Campaign
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure recipients, craft your message, and preview live before dispatching
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInsertTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Template</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Form</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Compose Form (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Recipient Emails & CSV Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Recipients List</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {validEmails.length} Valid
                  </span>
                  {invalidEmails.length > 0 && (
                    <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {invalidEmails.length} Invalid
                    </span>
                  )}
                </div>
              </div>

              {/* Textarea for emails */}
              <div className="relative">
                <textarea
                  name="recipientsInput"
                  rows={4}
                  value={formData.recipientsInput}
                  onChange={handleChange}
                  placeholder="Enter emails separated by commas, spaces, or line breaks:
example1@gmail.com, example2@company.com, client3@domain.org"
                  className={`w-full p-3.5 text-xs sm:text-sm font-mono bg-slate-50 border rounded-2xl focus:bg-white focus:outline-none transition-all resize-y ${
                    errors.recipientsInput
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                      : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>

              {errors.recipientsInput && (
                <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.recipientsInput}</span>
                </p>
              )}

              {/* CSV Upload Section */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-dashed border-slate-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Upload Recipient CSV File
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {uploadedFileName ? (
                        <span className="text-blue-600 font-medium">{uploadedFileName}</span>
                      ) : (
                        'Extract emails automatically from any column in .csv'
                      )}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,text/csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label
                    htmlFor="csv-file-input"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Browse CSV</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Exclusive Launch Announcement & Quarterly Report"
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
                  errors.subject
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
              {errors.subject && (
                <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.subject}</span>
                </p>
              )}
            </div>

            {/* Email Body Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Message Body
              </label>
              <textarea
                name="body"
                rows={9}
                value={formData.body}
                onChange={handleChange}
                placeholder="Write your email body here. You can include paragraphs, greetings, and signature..."
                className={`w-full p-4 bg-slate-50 border rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white transition-all resize-y ${
                  errors.body
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
              {errors.body && (
                <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.body}</span>
                </p>
              )}
            </div>

            {/* Submit Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                {validEmails.length > 0 ? (
                  <span>
                    Ready to dispatch to <strong>{validEmails.length}</strong> recipient
                    {validEmails.length > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span>No recipients selected yet</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={sending}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={sending || validEmails.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Bulk Mail...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Mail Now ({validEmails.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side: Live Email Preview (5 cols on lg) */}
        <div className="lg:col-span-5 sticky top-24">
          <EmailPreview
            subject={formData.subject}
            body={formData.body}
            recipientCount={validEmails.length}
            senderName={currentUser.name}
          />
        </div>
      </div>
    </div>
  );
};

export default ComposeMail;
