import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/api';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '894962009364-92tjhfc6f6simb8raf88ftggbjht3v34.apps.googleusercontent.com';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Use a ref to store the latest callback — avoids stale closure bug with GIS
  const googleCallbackRef = useRef(null);

  // Handle Google OAuth Credential response
  const handleGoogleCallback = useCallback(
    async (response) => {
      console.log('[Google Auth] Callback received', response);
      if (!response?.credential) {
        console.error('[Google Auth] No credential in response');
        toast.error('Google did not return a valid credential');
        return;
      }

      try {
        setGoogleLoading(true);
        setErrorMsg('');
        console.log('[Google Auth] Sending credential to backend...');
        const data = await authService.googleLogin(response.credential);
        console.log('[Google Auth] Success:', data);
        toast.success(`Welcome, ${data.name || 'Admin'}! Google login successful.`);
        navigate('/dashboard');
      } catch (err) {
        console.error('[Google Auth] Error:', err);
        const backendMsg = err?.response?.data?.message;
        console.error('[Google Auth] Backend message:', backendMsg);
        const message = backendMsg
          ? backendMsg
          : 'Google Sign-In failed. Please use email + password login below.';
        setErrorMsg(message);
        toast.error('Google Sign-In failed. Try email/password.');
      } finally {
        setGoogleLoading(false);
      }
    },
    [navigate]
  );

  // Always keep the ref in sync with latest callback
  useEffect(() => {
    googleCallbackRef.current = handleGoogleCallback;
  }, [handleGoogleCallback]);

  // Stable wrapper that delegates to the ref — passed to Google GIS once
  const stableGoogleCallback = useRef((response) => {
    if (googleCallbackRef.current) {
      googleCallbackRef.current(response);
    }
  });

  // Initialize Google Identity Services
  const initGoogleSignIn = useCallback(() => {
    if (!window.google?.accounts?.id) return;

    try {
      console.log('[Google Auth] Initializing GIS with client_id:', GOOGLE_CLIENT_ID);
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: stableGoogleCallback.current,
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: 'popup',
      });

      const btnContainer = document.getElementById('google-btn-container');
      if (btnContainer) {
        btnContainer.innerHTML = '';
        window.google.accounts.id.renderButton(btnContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: Math.min(btnContainer.offsetWidth || 340, 400),
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
        });
        console.log('[Google Auth] Button rendered successfully');
      }
    } catch (e) {
      console.error('[Google Auth] Initialization error:', e);
    }
  }, []);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      initGoogleSignIn();
      return;
    }

    // Poll until Google script loads
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);
        initGoogleSignIn();
      }
    }, 200);

    // Also listen for script onload in case it fires after we start polling
    const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (script) {
      const onLoad = () => {
        clearInterval(timer);
        initGoogleSignIn();
      };
      script.addEventListener('load', onLoad);
      return () => {
        clearInterval(timer);
        script.removeEventListener('load', onLoad);
      };
    }

    return () => clearInterval(timer);
  }, [initGoogleSignIn]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleFillDemo = () => {
    setFormData({ email: 'admin@bulkmailpro.com', password: 'admin123' });
    toast('Demo credentials auto-filled', { icon: '✨' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.email || !formData.password) {
      setErrorMsg('Please enter both email and password.');
      toast.error('Please enter all required fields.');
      return;
    }

    try {
      setLoading(true);
      await authService.login(formData);
      toast.success('Welcome back! Login successful.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const message =
        err?.response?.data?.message || 'Invalid email or password. Please try again.';
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white">
      {/* Background accents */}
      <div className="absolute top-12 left-12 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-300/40 overflow-hidden relative z-10">
        {/* Card Header */}
        <div className="p-8 sm:p-10 text-center pb-6 border-b border-slate-100 bg-gradient-to-b from-blue-50/50 to-transparent">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-4">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            BulkMail <span className="text-blue-600">Pro</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            High-Performance Bulk Email Dispatcher &amp; Management
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 sm:p-10 pt-6">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign In Section */}
          <div className="space-y-3 mb-5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              Quick Sign In with Google
            </label>

            {/* Official Google GIS Button Container */}
            <div className="flex justify-center min-h-[44px]">
              <div id="google-btn-container" className="w-full flex justify-center" />
            </div>

            {googleLoading && (
              <p className="text-center text-xs text-blue-600 font-medium animate-pulse flex items-center justify-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                <span>Authenticating with Google...</span>
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or Continue With Email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="login-email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@bulkmailpro.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  id="login-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In with Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center">
            <button
              type="button"
              id="fill-demo-btn"
              onClick={handleFillDemo}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3.5 py-1.5 rounded-lg border border-blue-200/60 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Fill Default Admin Credentials</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              admin@bulkmailpro.com &bull; admin123
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        BulkMail Pro &bull; Secure Enterprise Mail Sender &bull; v1.0
      </div>
    </div>
  );
};

export default Login;
