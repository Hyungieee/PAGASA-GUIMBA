import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GUIMBA_BARANGAYS } from '../../data/mockData';
import { PagasaLogo } from './PagasaLogo';
import { X, Lock, Mail, User, Phone, Shield, ArrowRight, CheckCircle2, Loader2, Sparkles, KeyRound, Eye, EyeOff, Send, Clock, Info } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginWithSupabase,
    registerMemberRequest,
    resetUserPassword,
    loginWithGoogle,
    members
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // New Member Registration form state (Email only required as per spec)
  const [regEmail, setRegEmail] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regBarangay, setRegBarangay] = useState(GUIMBA_BARANGAYS[0]);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [regSuccessData, setRegSuccessData] = useState<{ memberId: string; email: string; name: string } | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        setIsAuthModalOpen(false);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = loginIdentifier.trim();
    const password = loginPassword.trim();

    if (!identifier) return;

    setIsSubmitting(true);
    try {
      const targetRole = authModalMode === 'admin-login' ? 'SUPER_ADMIN' : 'MEMBER';
      const res = await loginWithSupabase(identifier, password, targetRole);
      if (res.success) {
        setIsAuthModalOpen(false);
        setLoginPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = regEmail.trim();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const res = await registerMemberRequest(
        email,
        regFullName.trim() || undefined,
        regContact.trim() || undefined,
        regBarangay
      );

      if (res.success && res.member) {
        setRegSuccessData({
          memberId: res.member.memberId,
          email: res.member.email,
          name: res.member.fullName
        });

        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (_) {}
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotStatus('loading');
    try {
      await resetUserPassword(forgotEmail);
      setForgotStatus('success');
    } catch {
      setForgotStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto no-print">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 p-6 text-white relative">
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setRegSuccessData(null);
              setShowForgotModal(false);
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <PagasaLogo size={44} showText={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                  PAGASA Guimba MIS
                </span>
                <span className="text-[10px] bg-sky-400/20 text-sky-200 border border-sky-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Official Portal
                </span>
              </div>
              <h2 className="text-xl font-display font-bold">
                {showForgotModal ? 'Reset Portal Password' :
                  regSuccessData ? 'Request Submitted!' : 
                  authModalMode === 'admin-login' ? 'Administrator Sign In' :
                  authModalMode === 'login' ? 'Member Portal Sign In' : 'Join PAGASA Youth Organization'}
              </h2>
            </div>
          </div>
        </div>

        {/* Forgot Password View */}
        {showForgotModal ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <span>Password Recovery & Assistance</span>
            </div>
            {forgotStatus === 'success' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Reset Link Sent</h4>
                <p className="text-xs text-slate-600">
                  We've sent password reset instructions to <strong>{forgotEmail}</strong>. If you cannot remember your temporary password, please contact an administrator to resend your credentials.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStatus('idle');
                  }}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered Gmail address. We will verify your account and send password recovery instructions.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Registered Gmail Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={forgotStatus === 'loading'}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Send Reset Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : regSuccessData ? (
          /* Success Screen after registration */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Registration Received!</h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Status: Pending Credentials
            </div>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Mabuhay, <strong>{regSuccessData.name}</strong>! Your registration has been submitted. The organization administrator has been notified.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex items-start gap-2">
                <Send className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">
                  Your assigned <strong>Username</strong> and <strong>Temporary Password</strong> will be generated by the administrator and sent directly to: <strong className="text-blue-700">{regSuccessData.email}</strong>.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-500 font-mono text-[11px]">
                <span>Temporary Ref ID:</span>
                <span className="font-bold text-slate-800">{regSuccessData.memberId}</span>
              </div>
            </div>
            <div className="pt-2 flex gap-3 justify-center">
              <button
                onClick={() => {
                  setRegSuccessData(null);
                  setAuthModalMode('login');
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md cursor-pointer"
              >
                Go to Sign In
              </button>
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setRegSuccessData(null);
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Mode Switch Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
              <button
                onClick={() => setAuthModalMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authModalMode === 'login'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Member Portal
              </button>
              <button
                onClick={() => setAuthModalMode('admin-login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authModalMode === 'admin-login'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin Portal
              </button>
              <button
                onClick={() => setAuthModalMode('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authModalMode === 'register'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Join Organization
              </button>
            </div>

            {/* Login Form (Member or Admin) */}
            {(authModalMode === 'login' || authModalMode === 'admin-login') && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Admin Master Credentials Banner */}
                {authModalMode === 'admin-login' ? (
                  <div className="p-3.5 bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-800/60 rounded-2xl text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        <span className="text-xs font-bold text-sky-200">Admin Master Credentials</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('PAGASA_ADMIN');
                          setLoginPassword('TayoAngPagasa2026');
                        }}
                        className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-extrabold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Autofill Admin</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Username:</span>
                        <strong className="text-sky-300 select-all">PAGASA_ADMIN</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Password:</span>
                        <strong className="text-emerald-300 select-all">TayoAngPagasa2026</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-blue-50/90 border border-blue-200/90 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-blue-950 font-bold text-xs">
                        <Lock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Member Portal Authentication</span>
                      </div>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Username + Assigned Password
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Sign in using your assigned <strong>Username</strong> or <strong>Gmail</strong> and your administrator-provided temporary password.
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-semibold">Demo Members:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('juandelacruz');
                          setLoginPassword('PagasaMember2026');
                        }}
                        className="text-[10px] px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-800 font-semibold rounded-md border border-blue-200 transition-colors cursor-pointer"
                      >
                        Juan (juandelacruz)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('mariasantos');
                          setLoginPassword('PagasaMember2026');
                        }}
                        className="text-[10px] px-2 py-0.5 bg-white hover:bg-blue-100 text-blue-800 font-semibold rounded-md border border-blue-200 transition-colors cursor-pointer"
                      >
                        Maria (mariasantos)
                      </button>
                    </div>
                  </div>
                )}

                {/* 1-Click Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isGoogleLoading ? 'Verifying...' : authModalMode === 'admin-login' ? 'Admin Sign In with Google' : 'Continue with Google Account'}</span>
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase">
                    <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                      {authModalMode === 'admin-login' ? 'Or enter Admin Credentials' : 'Or enter Portal Credentials'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {authModalMode === 'admin-login' ? 'Admin Username or Email' : 'Assigned Username or Gmail'}
                  </label>
                  <div className="relative">
                    {authModalMode === 'admin-login' ? (
                      <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    ) : (
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={authModalMode === 'admin-login' ? 'PAGASA_ADMIN' : 'Username (e.g. juandelacruz) or Gmail'}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {authModalMode === 'admin-login' ? 'Admin Master Password' : 'Password / Temporary Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={authModalMode === 'admin-login' ? 'TayoAngPagasa2026' : 'Enter assigned password'}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginIdentifier);
                      setShowForgotModal(true);
                    }}
                    className="text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{authModalMode === 'admin-login' ? 'Sign In to Admin MIS Portal' : 'Sign In to Member Portal'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Streamlined Registration Form: Email Only Required */}
            {authModalMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-sky-950 font-bold text-xs">
                    <Info className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>No Password Required to Register</span>
                  </div>
                  <p className="text-xs text-sky-900 leading-relaxed">
                    Simply enter your <strong>Gmail / Email address</strong>. An administrator will review your registration, assign an official <strong>Username</strong> and <strong>Temporary Password</strong>, and email your credentials to you.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Gmail / Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your login credentials will be delivered to this email address.
                  </p>
                </div>

                {/* Optional Details Accordion */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showOptionalFields ? '– Hide optional profile details' : '+ Add optional profile details (Name, Contact, Barangay)'}</span>
                  </button>

                  {showOptionalFields && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-3 mt-2 border-t border-slate-100"
                    >
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name (Optional)
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={regFullName}
                            onChange={(e) => setRegFullName(e.target.value)}
                            placeholder="e.g. Juan Santos Dela Cruz"
                            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Contact Number (Optional)
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              value={regContact}
                              onChange={(e) => setRegContact(e.target.value)}
                              placeholder="+63 917 000 0000"
                              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Barangay (Guimba)
                          </label>
                          <select
                            value={regBarangay}
                            onChange={(e) => setRegBarangay(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            {GUIMBA_BARANGAYS.map((b) => (
                              <option key={b} value={b}>Brgy. {b}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !regEmail.trim()}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Membership Registration</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};


