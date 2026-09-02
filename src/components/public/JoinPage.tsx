import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GUIMBA_BARANGAYS } from '../../data/mockData';
import { 
  Users, 
  Award, 
  QrCode, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Mail, 
  Phone, 
  ArrowRight,
  Send,
  Loader2,
  Clock,
  ShieldCheck,
  Info,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const JoinPage: React.FC = () => {
  const { 
    registerMemberRequest, 
    setIsAuthModalOpen, 
    setAuthModalMode, 
    setCurrentPage, 
    loginWithGoogle 
  } = useApp();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [barangay, setBarangay] = useState(GUIMBA_BARANGAYS[0]);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [submittedData, setSubmittedData] = useState<{
    memberId: string;
    email: string;
    fullName: string;
    barangay: string;
    isExisting?: boolean;
  } | null>(null);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const success = await loginWithGoogle();
      if (success) {
        // Logged in
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google authentication failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage('Please enter a valid Gmail / Email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await registerMemberRequest(
        trimmedEmail,
        fullName.trim() || undefined,
        contactNumber.trim() || undefined,
        barangay
      );

      if (res.success && res.member) {
        setSubmittedData({
          memberId: res.member.memberId,
          email: res.member.email,
          fullName: res.member.fullName,
          barangay: res.member.barangay,
          isExisting: false
        });
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch (_) {}
      } else if (res.isExisting && res.member) {
        setSubmittedData({
          memberId: res.member.memberId,
          email: res.member.email,
          fullName: res.member.fullName,
          barangay: res.member.barangay,
          isExisting: true
        });
      } else {
        setErrorMessage(res.message || 'Unable to submit registration request. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Member Portal Registration
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
          Join the Youth Movement of Guimba
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Open to all young residents and volunteers in Guimba. Enter your Gmail to request member credentials and access leadership programs, verified QR passes, and e-certificates.
        </p>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Col: Benefits & Instructions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 text-white p-8 rounded-3xl shadow-xl space-y-6">
            <h2 className="text-xl font-bold font-display text-white">How Membership Access Works</h2>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600/30 text-yellow-300 rounded-xl flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">1. Enter Your Gmail</h4>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    No need to create a password right now. Simply provide your active Gmail address to register.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600/30 text-yellow-300 rounded-xl flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">2. Administrator Credential Assignment</h4>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    An organization administrator will verify your record, assign an official username, and generate temporary login credentials.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600/30 text-yellow-300 rounded-xl flex-shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">3. Automated Email Delivery</h4>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    You will receive an official branded credentials email containing your Username, Temporary Password, and direct login instructions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600/30 text-yellow-300 rounded-xl flex-shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">4. Member Portal & QR Attendance</h4>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    Log in to unlock your personal Digital QR ID, register for municipal summits, and download official certificates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Eligibility Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs text-slate-600">
            <h3 className="font-bold text-slate-900 text-sm">Eligibility Criteria</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Resident or student of the Municipality of Guimba, Nueva Ecija</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Aged 15 to 30 years old / Youth Volunteer</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Willing to participate in community & civic youth initiatives</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Col: Registration Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm">
            {submittedData ? (
              <div className="text-center space-y-5 py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 font-display">
                    {submittedData.isExisting ? 'Member Record Found' : 'Registration Request Submitted!'}
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    {submittedData.isExisting 
                      ? `Your Gmail address (${submittedData.email}) is already registered with PAGASA Guimba.`
                      : `Mabuhay, ${submittedData.fullName}! Your registration has been received and queued for administrative credential assignment.`}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl inline-block font-mono font-bold text-blue-900 text-lg">
                  {submittedData.memberId}
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 text-left max-w-md mx-auto space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Status: Pending Credentials Assignment</span>
                  </div>
                  <p className="leading-relaxed">
                    An administrator has been notified. They will assign your <strong>Username</strong> and <strong>Temporary Password</strong> in the Member Directory, which will be dispatched to <strong>{submittedData.email}</strong>.
                  </p>
                </div>

                <div className="pt-3 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => {
                      setSubmittedData(null);
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    Open Member Login
                  </button>
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">
                    New Member Registration
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your email to request member credentials. Password creation is not required.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 1-Click Google Sign In */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{isGoogleLoading ? 'Connecting...' : 'Register / Sign In with Google Account'}</span>
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                        Or enter your Gmail address
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Field: Gmail Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Gmail / Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Your assigned portal username & password will be emailed to this address.
                  </p>
                </div>

                {/* Optional Profile Accordion */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showOptionalFields ? '– Hide optional profile fields' : '+ Add optional profile details (Full Name, Contact, Barangay)'}</span>
                  </button>

                  {showOptionalFields && (
                    <div className="space-y-4 pt-4 mt-2 border-t border-slate-100 animate-fadeIn">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name (Optional)
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Juan P. Dela Cruz"
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Contact / Mobile Number (Optional)
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              value={contactNumber}
                              onChange={(e) => setContactNumber(e.target.value)}
                              placeholder="+63 917 000 0000"
                              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Guimba Barangay
                          </label>
                          <select
                            value={barangay}
                            onChange={(e) => setBarangay(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                          >
                            {GUIMBA_BARANGAYS.map((b) => (
                              <option key={b} value={b}>Brgy. {b}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex items-start gap-2.5 text-xs text-sky-900 leading-relaxed">
                  <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Upon clicking submit, your member record will be created with status <strong>Pending Credentials</strong>. The administrator will assign your username and password, which will be emailed to your inbox.
                  </span>
                </div>

                {/* Submit Member Registration Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Member Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="text-xs text-slate-500 hover:text-blue-600 font-medium cursor-pointer"
                  >
                    Already have assigned credentials? <span className="font-bold text-blue-600 underline">Sign In here</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
