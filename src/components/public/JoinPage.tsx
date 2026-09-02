import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GUIMBA_BARANGAYS } from '../../data/mockData';
import { 
  Users, 
  ShieldCheck, 
  Award, 
  QrCode, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const JoinPage: React.FC = () => {
  const { addMember, setIsAuthModalOpen, setAuthModalMode, setCurrentPage } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [birthdate, setBirthdate] = useState('2004-01-01');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Prefer not to say' | 'Other'>('Male');
  const [address, setAddress] = useState('');
  const [barangay, setBarangay] = useState(GUIMBA_BARANGAYS[0]);
  const [education, setEducation] = useState<'High School' | 'Senior High' | 'College / University' | 'Vocational / TVET' | 'Out of School Youth' | 'Employed Professional' | 'Other'>('College / University');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('Parent');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !contactNumber) return;

    const birthYear = new Date(birthdate).getFullYear();
    const calculatedAge = Math.max(15, 2026 - birthYear);

    const created = addMember({
      fullName,
      email,
      contactNumber,
      birthdate,
      age: calculatedAge,
      gender,
      address: address || `Purok 1, Brgy. ${barangay}`,
      barangay,
      educationalStatus: education,
      occupation: 'Student / Youth Member',
      profilePicture: gender === 'Female' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      membershipStatus: 'Pending',
      organizationPosition: 'Youth Member',
      committee: 'General Youth Volunteer',
      emergencyContact: {
        name: emergencyName || 'Family Contact',
        relationship: emergencyRel || 'Parent',
        contactNumber: emergencyPhone || contactNumber
      }
    });

    setSubmittedId(created.memberId);
    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch (_) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Official Membership Application
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900 tracking-tight">
          Join the Youth Movement of Guimba
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Open to all young residents of Guimba aged 15 to 30. Gain access to leadership seminars, barangay youth initiatives, and official volunteer certifications.
        </p>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Col: Benefits & Eligibility */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 text-white p-8 rounded-3xl shadow-xl space-y-6">
            <h2 className="text-xl font-bold font-display text-white">Why Join PAGASA Guimba?</h2>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600/30 text-yellow-300 rounded-xl flex-shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Personal Digital QR Pass</h4>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    Instant check-in at municipal youth summits and activities with verified attendance records.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600/30 text-yellow-300 rounded-xl flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Official E-Certificates</h4>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    Earn digitally signed and QR-verifiable certificates of participation and leadership for your portfolio.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600/30 text-yellow-300 rounded-xl flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Skills & Leadership Workshops</h4>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    Access free workshops on digital skills, public speaking, project management, and governance.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600/30 text-yellow-300 rounded-xl flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Barangay Representation</h4>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    Be the official youth voice of your barangay and participate in municipal policy consultations.
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
                <span>Resident or student of the Municipality of Guimba</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Aged 15 to 30 years old</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Willing to participate in civic & volunteer activities</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Col: Application Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm">
            {submittedId ? (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 font-display">
                  Application Submitted Successfully!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Mabuhay! Your youth membership registration has been recorded and assigned official Member ID:
                </p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl inline-block font-mono font-bold text-blue-800 text-xl">
                  {submittedId}
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left max-w-md mx-auto">
                  <p className="font-bold mb-0.5">Status: Pending Admin Review</p>
                  You can now log in using your registered email and access the Member Portal once activated.
                </div>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSubmittedId(null);
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Log In to Member Portal
                  </button>
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-bold text-slate-900 font-display">
                  Youth Membership Registration Form
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Juan P. Dela Cruz"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="juan.delacruz@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile / Contact No. *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="0917-000-0000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Guimba Barangay *
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Birthdate *
                    </label>
                    <input
                      type="date"
                      required
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Educational / Sectoral Status
                  </label>
                  <select
                    value={education}
                    onChange={(e) => setEducation(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="College / University">College / University Student</option>
                    <option value="Senior High">Senior High School</option>
                    <option value="High School">Junior High School</option>
                    <option value="Vocational / TVET">Vocational / Technical TVET</option>
                    <option value="Employed Professional">Employed Professional</option>
                    <option value="Out of School Youth">Out of School Youth (OSY)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address / Purok / Zone
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Purok / Zone, Sitio, Landmark"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Emergency Contact Person
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Contact Name"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      value={emergencyRel}
                      onChange={(e) => setEmergencyRel(e.target.value)}
                      placeholder="Relationship (Parent/Guardian)"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="Emergency Phone No."
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  By submitting this form, you certify that all information provided is true and accurate.
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Submit Membership Application</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
