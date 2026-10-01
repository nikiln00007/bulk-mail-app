import React, { useState, useRef } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Upload,
  Download,
  Search,
  Tag,
  Mail,
  X,
  CheckCircle2,
  ChevronDown,
  UserPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';

const LABEL_COLORS = [
  { name: 'Personal', color: '#22c55e', bg: '#f0fdf4' },
  { name: 'School', color: '#3b82f6', bg: '#eff6ff' },
  { name: 'Social', color: '#a855f7', bg: '#faf5ff' },
  { name: 'Work', color: '#f59e0b', bg: '#fffbeb' },
  { name: 'VIP', color: '#ef4444', bg: '#fef2f2' },
];

const Contacts = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', label: 'Personal', starred: false },
    { id: 2, name: 'Bob Smith', email: 'bob@company.com', label: 'Work', starred: true },
    { id: 3, name: 'Carol White', email: 'carol@school.edu', label: 'School', starred: false },
    { id: 4, name: 'David Lee', email: 'david@social.io', label: 'Social', starred: false },
    { id: 5, name: 'Eva Brown', email: 'eva@vip.com', label: 'VIP', starred: true },
  ]);
  const [search, setSearch] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', label: 'Personal' });
  const [selected, setSelected] = useState([]);
  const fileRef = useRef();

  const labels = ['All', ...LABEL_COLORS.map((l) => l.name)];

  const filtered = contacts.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchLabel = selectedLabel === 'All' || c.label === selectedLabel;
    return matchSearch && matchLabel;
  });

  const getLabelStyle = (labelName) => {
    const found = LABEL_COLORS.find((l) => l.name === labelName);
    return found
      ? { color: found.color, backgroundColor: found.bg, border: `1px solid ${found.color}33` }
      : { color: '#64748b', backgroundColor: '#f1f5f9' };
  };

  const getLabelDot = (labelName) => {
    const found = LABEL_COLORS.find((l) => l.name === labelName);
    return found?.color || '#64748b';
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((c) => c.id));
  };

  const deleteSelected = () => {
    setContacts((prev) => prev.filter((c) => !selected.includes(c.id)));
    toast.success(`Deleted ${selected.length} contact(s)`);
    setSelected([]);
  };

  const addContact = () => {
    if (!newContact.name || !newContact.email) {
      toast.error('Name and email are required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newContact.email)) {
      toast.error('Enter a valid email address');
      return;
    }
    setContacts((prev) => [
      { id: Date.now(), ...newContact, starred: false },
      ...prev,
    ]);
    toast.success('Contact added!');
    setNewContact({ name: '', email: '', label: 'Personal' });
    setShowAddModal(false);
  };

  const toggleStar = (id) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c))
    );
  };

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Label'], ...contacts.map((c) => [c.name, c.email, c.label])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    toast.success('Contacts exported!');
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').slice(1);
      const imported = lines
        .filter(Boolean)
        .map((line, i) => {
          const [name, email, label] = line.split(',');
          return { id: Date.now() + i, name: name?.trim(), email: email?.trim(), label: label?.trim() || 'Personal', starred: false };
        })
        .filter((c) => c.name && c.email);
      setContacts((prev) => [...imported, ...prev]);
      toast.success(`Imported ${imported.length} contacts`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Contacts</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {contacts.length} contacts · {contacts.filter((c) => c.starred).length} starred
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => fileRef.current.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {labels.map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLabel(l)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedLabel === l
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {l !== 'All' && (
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: getLabelDot(l) }}
                />
              )}
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-2xl border border-blue-200">
          <span className="text-xs font-semibold text-blue-700">{selected.length} selected</span>
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Selected
          </button>
          <button
            onClick={() => setSelected([])}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Contacts Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={selectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600"
                  />
                </th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Label</th>
                <th className="py-3.5 px-4">Starred</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center text-slate-400">
                      <Users className="w-10 h-10 mb-3 text-slate-300" />
                      <p className="font-semibold text-slate-600">No contacts found</p>
                      <p className="text-xs mt-1">Add contacts or import a CSV file</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3.5 px-5">
                      <input
                        type="checkbox"
                        checked={selected.includes(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {contact.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{contact.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {contact.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={getLabelStyle(contact.label)}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getLabelDot(contact.label) }}
                        />
                        {contact.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button onClick={() => toggleStar(contact.id)} className="text-lg leading-none">
                        {contact.starred ? '⭐' : '☆'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setContacts((prev) => prev.filter((c) => c.id !== contact.id));
                          toast.success('Contact removed');
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Add Contact</h3>
                <p className="text-xs text-slate-500">Fill in the details below</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alice Johnson"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  placeholder="alice@example.com"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Label</label>
                <div className="relative">
                  <select
                    value={newContact.label}
                    onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 appearance-none"
                  >
                    {LABEL_COLORS.map((l) => (
                      <option key={l.name}>{l.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <button
                onClick={addContact}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
