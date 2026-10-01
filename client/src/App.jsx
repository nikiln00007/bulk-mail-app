import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ComposeMail from './pages/ComposeMail';
import EmailHistory from './pages/EmailHistory';
import MailDetails from './pages/MailDetails';
import Settings from './pages/Settings';
import Contacts from './pages/Contacts';
import Drafts from './pages/Drafts';
import Favourites from './pages/Favourites';
import Spam from './pages/Spam';
import Trash from './pages/Trash';

// Main Layout Wrapper for Authenticated Pages
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all duration-300">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="py-4 px-6 border-t border-slate-200/70 text-center text-xs text-slate-400">
          BulkMail Pro &bull; Enterprise Bulk Email Dispatch System
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1E293B',
            color: '#FFFFFF',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#FFFFFF' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/compose"     element={<ComposeMail />} />
            <Route path="/history"     element={<EmailHistory />} />
            <Route path="/history/:id" element={<MailDetails />} />
            <Route path="/settings"    element={<Settings />} />
            {/* New Pages */}
            <Route path="/contacts"    element={<Contacts />} />
            <Route path="/drafts"      element={<Drafts />} />
            <Route path="/favourites"  element={<Favourites />} />
            <Route path="/spam"        element={<Spam />} />
            <Route path="/trash"       element={<Trash />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
