import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Shield } from 'lucide-react';
import { PagasaLogo } from '../common/PagasaLogo';

export const LoginPage: React.FC = () => {
  const { loginWithSupabase, setCurrentPage, setAuthModalMode, setIsAuthModalOpen } = useApp();

  const [gmailAccount, setGmailAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailInput = gmailAccount.trim();
    const passwordInput = password.trim();

    if (!emailInput || !passwordInput) {
      setErrorMessage('Please enter your Gmail Account and Password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithSupabase(emailInput, passwordInput, 'MEMBER');
      if (res.success) {
        setSuccessMessage('Login successful! Redirecting to your Member Portal...');
      } else {
        // Display exact error message from authentication logic
        setErrorMessage(res.message || 'Invalid Gmail Account or Password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid Gmail Account or Password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 p-8 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
            <PagasaLogo size={42} showText={false} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-sky-300 bg-sky-950/60 border border-sky-800 px-3 py-1 rounded-full">
            Member Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-2">
            Member Login
          </h1>
          <p className="text-xs text-sky-200/80 mt-1 max-w-xs mx-auto">
            Log in using your registered Gmail Account and the password assigned by the Administrator.
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8 sm:p-10 space-y-6">
          {/* Error Message Box */}
          {errorMessage && (
            <div
              id="login-error-alert"
              className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-sm text-red-800 flex items-start gap-3 shadow-xs"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Authentication Notice</span>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Success Message Box */}
          {successMessage && (
            <div
              id="login-success-alert"
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-800 flex items-start gap-3 shadow-xs"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Welcome back</span>
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Gmail Account Field */}
            <div>
              <label
                htmlFor="login-gmail"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Gmail Account
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-gmail"
                  type="email"
                  required
                  value={gmailAccount}
                  onChange={(e) => setGmailAccount(e.target.value)}
                  placeholder="e.g. member@gmail.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter the valid Gmail address used during registration.
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter assigned password"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-mono placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Password assigned and activated by the Administrator.
              </p>
            </div>

            {/* Login Button */}
            <button
              id="submit-member-login-btn"
              type="submit"
              disabled={isSubmitting || !gmailAccount.trim() || !password.trim()}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Links & Information */}
          <div className="pt-4 border-t border-slate-100 space-y-3 text-center text-xs">
            <p className="text-slate-600">
              Not yet registered?{' '}
              <button
                type="button"
                onClick={() => setCurrentPage('join')}
                className="font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Submit Registration
              </button>
            </p>

            <div className="flex items-center justify-center gap-4 text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => setCurrentPage('directory')}
                className="hover:text-blue-600 cursor-pointer"
              >
                View Member Directory
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('admin-login');
                  setIsAuthModalOpen(true);
                }}
                className="hover:text-blue-600 cursor-pointer flex items-center gap-1 font-medium"
              >
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Admin Login</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentPage('home')}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
