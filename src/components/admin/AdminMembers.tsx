import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member, User } from '../../types';
import { GUIMBA_BARANGAYS } from '../../data/mockData';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  QrCode, 
  Filter, 
  X, 
  Check, 
  Eye,
  EyeOff,
  Shield,
  FileSpreadsheet,
  Camera,
  Mail,
  Copy,
  LogIn,
  Sparkles,
  UserCheck,
  ExternalLink,
  Lock,
  KeyRound,
  Send,
  RefreshCw,
  AlertTriangle,
  UserX,
  Clock,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ChangeProfilePictureModal } from '../common/ChangeProfilePictureModal';
import { generateTemporaryPassword, generateUsername, validatePasswordStrength } from '../../utils/security';

export const AdminMembers: React.FC = () => {
  const { 
    members, 
    refreshMembers,
    isSyncingMembers,
    addMember, 
    updateMember, 
    deleteMember, 
    clearAllMembers,
    selectedMemberId, 
    setSelectedMemberId,
    switchRole,
    setCurrentPage,
    addToast,
    confirmAction,
    assignMemberCredentials,
    assignMemberPassword,
    toggleMemberActivation,
    resendCredentialEmail,
    toggleMemberAccess,
    openEmailPreview
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCredentialFilter, setSelectedCredentialFilter] = useState('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [photoTargetMember, setPhotoTargetMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(
    selectedMemberId ? members.find(m => m.id === selectedMemberId) || null : null
  );

  // Credential / Password Assignment Modal State
  const [credentialModalMember, setCredentialModalMember] = useState<Member | null>(null);
  const [assignUsername, setAssignUsername] = useState('');
  const [assignPassword, setAssignPassword] = useState('');
  const [showAssignPassword, setShowAssignPassword] = useState(false);
  const [activateAccountOnAssign, setActivateAccountOnAssign] = useState(true);
  const [sendEmailImmediately, setSendEmailImmediately] = useState(true);
  const [requirePasswordChange, setRequirePasswordChange] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formBarangay, setFormBarangay] = useState(GUIMBA_BARANGAYS[0]);
  const [formBirthdate, setFormBirthdate] = useState('2004-01-01');
  const [formAge, setFormAge] = useState<number>(22);
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Prefer not to say' | 'Other'>('Male');
  const [formEducation, setFormEducation] = useState<any>('College / University');
  const [formStatus, setFormStatus] = useState<'Active' | 'Pending' | 'Inactive'>('Active');
  const [formPosition, setFormPosition] = useState('Youth Member');
  const [formCommittee, setFormCommittee] = useState('General Youth Volunteer');
  const [formAddress, setFormAddress] = useState('');

  // Direct Credential assignment in registration modal
  const [assignCredentialsNow, setAssignCredentialsNow] = useState(true);
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('PagasaMember2026');
  const [formShowPassword, setFormShowPassword] = useState(false);
  const [formSendEmail, setFormSendEmail] = useState(true);

  const filteredMembers = members.filter(m => {
    const matchesBarangay = selectedBarangay === 'ALL' || m.barangay === selectedBarangay;
    const matchesStatus = selectedStatus === 'ALL' || m.membershipStatus === selectedStatus;
    
    let matchesCred = true;
    if (selectedCredentialFilter === 'PENDING') {
      matchesCred = !m.username || m.credentialStatus === 'Pending Credentials' || m.credentialStatus === 'Credentials Not Assigned';
    } else if (selectedCredentialFilter === 'ASSIGNED') {
      matchesCred = m.credentialStatus === 'Credentials Sent' || m.emailDeliveryStatus === 'Delivered';
    } else if (selectedCredentialFilter === 'ACTIVE') {
      matchesCred = m.credentialStatus === 'Active' && !m.mustChangePassword;
    } else if (selectedCredentialFilter === 'EMAIL_FAILED') {
      matchesCred = m.emailDeliveryStatus === 'Failed' || m.credentialStatus === 'Email Delivery Failed';
    }

    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return matchesBarangay && matchesStatus && matchesCred;
    const matchesSearch = (m.fullName || '').toLowerCase().includes(q) ||
                          (m.memberId || '').toLowerCase().includes(q) ||
                          (m.email || '').toLowerCase().includes(q) ||
                          (m.username || '').toLowerCase().includes(q) ||
                          (m.barangay || '').toLowerCase().includes(q);
    return matchesBarangay && matchesStatus && matchesCred && matchesSearch;
  });

  const pendingCredentialsCount = members.filter(m => !m.username || m.credentialStatus === 'Pending Credentials' || m.credentialStatus === 'Credentials Not Assigned').length;
  const emailSentCount = members.filter(m => m.credentialStatus === 'Credentials Sent' || m.emailDeliveryStatus === 'Delivered').length;
  const activePasswordChangedCount = members.filter(m => m.credentialStatus === 'Active').length;

  const handleOpenAssignModal = (m: Member) => {
    setCredentialModalMember(m);
    const initialUsername = m.username || generateUsername(m.fullName, members.map(x => x.username).filter(Boolean) as string[]);
    // Use the member's current assigned password if present, or default PagasaMember2026
    const initialPassword = m.portalPassword || 'PagasaMember2026';
    setAssignUsername(initialUsername);
    setAssignPassword(initialPassword);
    setShowAssignPassword(true);
    setActivateAccountOnAssign(true);
    setSendEmailImmediately(true);
    setRequirePasswordChange(false);
  };

  const handleAutoGenerateCredentials = () => {
    if (!credentialModalMember) return;
    const existing = members.filter(x => x.id !== credentialModalMember.id).map(x => x.username).filter(Boolean) as string[];
    setAssignUsername(generateUsername(credentialModalMember.fullName, existing));
    addToast('Generated clean username handle.', 'info');
  };

  const handleSuggestPassword = () => {
    setAssignPassword(generateTemporaryPassword());
    addToast('Suggested new secure password.', 'info');
  };

  const handleCopyCredentials = (m: Member) => {
    const pwd = m.portalPassword || 'PagasaMember2026';
    const text = `PAGASA Guimba Member Portal Credentials\nName: ${m.fullName}\nMember ID: ${m.memberId}\nGmail: ${m.email}\nUsername: ${m.username || m.email}\nPassword: ${pwd}\nStatus: ${m.membershipStatus}\nPortal URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    addToast(`Credentials for ${m.fullName} copied to clipboard!`, 'success');
  };

  const handleCopyModalCredentials = () => {
    if (!credentialModalMember) return;
    const text = `PAGASA Guimba Member Portal Credentials\nName: ${credentialModalMember.fullName}\nMember ID: ${credentialModalMember.memberId}\nGmail: ${credentialModalMember.email}\nPassword: ${assignPassword}\nStatus: ${activateAccountOnAssign ? 'Active' : 'Pending Activation'}\nPortal URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    addToast('Credentials copied to clipboard!', 'success');
  };

  const handleSaveAssignedCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialModalMember || !assignPassword.trim()) return;

    setIsAssigning(true);
    try {
      const res = await assignMemberPassword(
        credentialModalMember.id,
        assignPassword.trim(),
        activateAccountOnAssign
      );

      if (assignUsername.trim()) {
        await assignMemberCredentials(
          credentialModalMember.id,
          assignUsername.trim(),
          assignPassword.trim(),
          sendEmailImmediately,
          false
        );
      }

      if (res.success) {
        setCredentialModalMember(null);
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAutoGenerateFormUsername = () => {
    if (!formName.trim()) {
      addToast('info', 'Name Required', 'Please enter the member full name first.');
      return;
    }
    const existing = members.map(x => x.username).filter(Boolean) as string[];
    const generated = generateUsername(formName.trim(), existing);
    setFormUsername(generated);
    addToast('info', 'Username Generated', `Username set to "${generated}"`);
  };

  const handleSuggestFormPassword = () => {
    const suggested = generateTemporaryPassword();
    setFormPassword(suggested);
    addToast('info', 'Password Generated', 'Suggested a secure alphanumeric password.');
  };

  const handleBirthdateChange = (newDate: string) => {
    setFormBirthdate(newDate);
    if (newDate) {
      const birthYear = new Date(newDate).getFullYear();
      if (!isNaN(birthYear)) {
        const computedAge = Math.max(12, Math.min(45, 2026 - birthYear));
        setFormAge(computedAge);
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormName('');
    setFormEmail('');
    setFormContact('+63 9');
    setFormBarangay(GUIMBA_BARANGAYS[0]);
    setFormBirthdate('2004-01-01');
    setFormAge(22);
    setFormGender('Male');
    setFormEducation('College / University');
    setFormStatus('Active');
    setFormPosition('Youth Member');
    setFormCommittee('General Youth Volunteer');
    setFormAddress('');
    setAssignCredentialsNow(true);
    setFormUsername('');
    setFormPassword('PagasaMember2026');
    setFormShowPassword(false);
    setFormSendEmail(true);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setFormName(m.fullName);
    setFormEmail(m.email);
    setFormContact(m.contactNumber);
    setFormBarangay(m.barangay);
    setFormBirthdate(m.birthdate);
    setFormAge(m.age || 20);
    setFormGender(m.gender);
    setFormEducation(m.educationalStatus);
    setFormStatus(m.membershipStatus);
    setFormPosition(m.organizationPosition || 'Youth Member');
    setFormCommittee(m.committee || 'General Youth Volunteer');
    setFormAddress(m.address);
    setAssignCredentialsNow(false);
    setIsCreateModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const cleanedEmail = formEmail.trim().toLowerCase();
    const finalAge = Number(formAge) || 20;

    if (editingMember) {
      updateMember(editingMember.id, {
        fullName: formName.trim(),
        email: cleanedEmail,
        contactNumber: formContact,
        barangay: formBarangay,
        birthdate: formBirthdate,
        age: finalAge,
        gender: formGender,
        educationalStatus: formEducation,
        membershipStatus: formStatus,
        organizationPosition: formPosition,
        committee: formCommittee,
        address: formAddress
      });
      addToast('success', 'Member Updated', `Member record for ${formName} updated.`);
    } else {
      const hasDirectCredentials = assignCredentialsNow && formUsername.trim() && formPassword.trim();
      const newMember = addMember({
        fullName: formName.trim(),
        email: cleanedEmail,
        contactNumber: formContact,
        birthdate: formBirthdate,
        age: finalAge,
        gender: formGender,
        address: formAddress || `Purok 1, Brgy. ${formBarangay}, Guimba`,
        barangay: formBarangay,
        educationalStatus: formEducation,
        occupation: 'Youth Member / Student',
        membershipStatus: formStatus,
        organizationPosition: formPosition,
        committee: formCommittee,
        username: hasDirectCredentials ? formUsername.trim().toLowerCase() : undefined,
        portalPassword: hasDirectCredentials ? formPassword.trim() : undefined,
        credentialStatus: hasDirectCredentials ? 'Active' : 'Pending Credentials',
        credentialsAssignedAt: hasDirectCredentials ? new Date().toISOString() : undefined,
        emailDeliveryStatus: hasDirectCredentials ? (formSendEmail ? 'Delivered' : 'Pending') : 'Pending',
        emailDeliveryDate: hasDirectCredentials && formSendEmail ? new Date().toISOString() : undefined,
        mustChangePassword: false,
        emergencyContact: {
          name: 'Family Contact',
          relationship: 'Parent / Guardian',
          contactNumber: formContact
        }
      });

      if (hasDirectCredentials) {
        addToast('success', 'Member Created & Credentials Set', `Member ${formName} created with Username "${formUsername.trim().toLowerCase()}". Credentials ready!`);
      } else {
        addToast('success', 'Member Created', `New member ${formName} registered. You can now assign credentials.`);
        // Prompt credential assignment
        setTimeout(() => {
          handleOpenAssignModal(newMember);
        }, 500);
      }
    }
    setIsCreateModalOpen(false);
  };

  const handleTestLoginAsMember = (m: Member) => {
    const userPayload: User = {
      id: m.id,
      name: m.fullName,
      email: m.email,
      role: 'MEMBER',
      avatar: m.profilePicture,
      memberId: m.memberId
    };
    switchRole('MEMBER', userPayload);
  };

  const handleExportCSV = () => {
    const headers = ['Member ID', 'Full Name', 'Gmail / Email', 'Username', 'Credential Status', 'Email Sent', 'Credentials Assigned Date', 'Barangay', 'Account Status', 'Date Joined'];
    const rows = filteredMembers.map(m => [
      `"${m.memberId}"`,
      `"${m.fullName}"`,
      `"${m.email}"`,
      `"${m.username || 'Unassigned'}"`,
      `"${m.credentialStatus || 'PENDING_ASSIGNMENT'}"`,
      `"${m.emailDeliveryStatus || 'NOT_SENT'}"`,
      `"${m.credentialsAssignedAt ? new Date(m.credentialsAssignedAt).toLocaleDateString() : 'N/A'}"`,
      `"${m.barangay}"`,
      `"${m.membershipStatus}"`,
      `"${m.dateJoined || m.membershipDate || '2026-01-01'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PAGASA_Guimba_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Member directory exported to CSV.', 'info');
  };

  const renderCredentialBadge = (m: Member) => {
    if (m.isAccessDisabled) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
          <UserX className="w-3 h-3 text-red-600" />
          Access Disabled
        </span>
      );
    }

    if (!m.username || m.credentialStatus === 'Pending Credentials' || m.credentialStatus === 'Credentials Not Assigned') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          Pending Credentials
        </span>
      );
    }

    if (m.credentialStatus === 'Active' && !m.mustChangePassword) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Password Active
        </span>
      );
    }

    if (m.emailDeliveryStatus === 'Failed' || m.credentialStatus === 'Email Delivery Failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200" title={m.emailDeliveryError || 'Failed to deliver'}>
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Email Failed
        </span>
      );
    }

    if (m.emailDeliveryStatus === 'Delivered' || m.credentialStatus === 'Credentials Sent') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Send className="w-3 h-3 text-blue-600" />
          Email Delivered
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
        <KeyRound className="w-3 h-3 text-indigo-600" />
        Credentials Assigned
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-slate-900">
              Member Directory & Credential Management
            </h1>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              Admin Control
            </span>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Synced ({members.length})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign usernames, generate temporary passwords, and automatically deliver credentials to member Gmail addresses ({filteredMembers.length} records).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshMembers()}
            disabled={isSyncingMembers}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            title="Fetch and synchronize registered members from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncingMembers ? 'animate-spin' : ''}`} />
            <span>{isSyncingMembers ? 'Fetching...' : 'Fetch & Sync'}</span>
          </button>

          {members.length > 0 && (
            <button
              onClick={() => {
                confirmAction({
                  title: 'Clear All Members from Directory',
                  message: 'Are you sure you want to remove ALL existing member records? This will delete all member accounts and credentials so you can start completely fresh with manual registrations.',
                  confirmText: 'Yes, Clear All Members',
                  cancelText: 'Cancel',
                  variant: 'danger',
                  itemDetails: {
                    label: 'Current Total Records',
                    value: `${members.length} Member Accounts`,
                    subValue: 'All existing member data in registry and storage will be erased.'
                  },
                  onConfirm: () => {
                    clearAllMembers();
                  }
                });
              }}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Remove all member records from the portal"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear All Members</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New Member</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Members</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-display">{members.length}</p>
          <span className="text-[10px] text-slate-400">All registered youth</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Assignment</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-800 font-display">{pendingCredentialsCount}</p>
          <span className="text-[10px] text-amber-700 font-medium">Needs username & password</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/30 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Credentials Sent</span>
            <Send className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-800 font-display">{emailSentCount}</p>
          <span className="text-[10px] text-blue-700 font-medium">Emails dispatched to Gmail</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Active & Logged In</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-800 font-display">{activePasswordChangedCount}</p>
          <span className="text-[10px] text-emerald-700 font-medium">Permanent password set</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, Gmail, Username, Member ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Credential Filter Dropdown */}
          <select
            value={selectedCredentialFilter}
            onChange={(e) => setSelectedCredentialFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none font-semibold"
          >
            <option value="ALL">All Credential Statuses</option>
            <option value="PENDING">Pending Assignment ({pendingCredentialsCount})</option>
            <option value="ASSIGNED">Credentials Dispatched ({emailSentCount})</option>
            <option value="ACTIVE">Permanent Password Active ({activePasswordChangedCount})</option>
            <option value="EMAIL_FAILED">Email Failed</option>
          </select>

          {/* Barangay Dropdown */}
          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Barangays</option>
            {GUIMBA_BARANGAYS.map((b) => (
              <option key={b} value={b}>Brgy. {b}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
                <th className="py-3.5 px-4">Member & Gmail</th>
                <th className="py-3.5 px-4">Assigned Username</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Credential Status</th>
                <th className="py-3.5 px-4">Date Assigned / Joined</th>
                <th className="py-3.5 px-4">Last Login</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14 px-4">
                    <div className="max-w-md mx-auto space-y-3 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-xs">
                        <Users className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm font-display">
                          {members.length === 0 ? 'Member Directory is Empty' : 'No members match the filter'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {members.length === 0 
                            ? 'All existing data has been removed. You can now add youth members manually with complete credentials (Name, Gmail, Birthday, Age, Address), or youth can apply via Join Organization.'
                            : 'Try adjusting your search criteria or register a new member manually.'}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => refreshMembers()}
                          disabled={isSyncingMembers}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                          title="Fetch any newly submitted youth registrations"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncingMembers ? 'animate-spin' : ''}`} />
                          <span>{isSyncingMembers ? 'Fetching...' : 'Fetch Registered Members'}</span>
                        </button>
                        <button
                          onClick={handleOpenCreate}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{members.length === 0 ? 'Add First Member Manually' : 'Register New Member'}</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className={`hover:bg-slate-50/80 transition-colors ${m.isAccessDisabled ? 'bg-red-50/20' : ''}`}>
                    {/* Member Name & Gmail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="relative group cursor-pointer flex-shrink-0"
                          onClick={() => setPhotoTargetMember(m)}
                          title="Click to change member photo"
                        >
                          <img
                            src={m.profilePicture}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:brightness-90 transition-all"
                          />
                          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p 
                              className="font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => setViewingMember(m)}
                              title="Click to view complete member profile"
                            >
                              {m.fullName}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400">({m.memberId})</span>
                            {m.gender && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                {m.gender}
                              </span>
                            )}
                            {m.age && (
                              <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                                {m.age} y/o
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 font-mono">
                            <Mail className="w-3 h-3 text-red-500 flex-shrink-0" />
                            <span className="text-blue-700 font-semibold">{m.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                            <span>Brgy. {m.barangay}</span>
                            {m.address && <span title={m.address}>• 📍 {m.address}</span>}
                            {m.birthdate && <span>• 🎂 {m.birthdate}</span>}
                            {m.contactNumber && <span>• 📞 {m.contactNumber}</span>}
                            {m.committee && (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-medium">
                                {m.committee}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Username & Password */}
                    <td className="py-3 px-4">
                      {m.username ? (
                        <div className="space-y-1 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-900 rounded font-bold border border-blue-200 text-[11px]">
                              {m.username}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(m.username || '');
                                addToast('Username copied to clipboard', 'info');
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Copy username"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <span className="text-slate-400 font-sans">PW:</span>
                            <span className="text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {m.portalPassword || 'PagasaMember2026'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(m.portalPassword || 'PagasaMember2026');
                                addToast('Password copied to clipboard', 'info');
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Copy password"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.membershipStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        m.membershipStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {m.membershipStatus}
                      </span>
                    </td>

                    {/* Credential Status */}
                    <td className="py-3 px-4">
                      {renderCredentialBadge(m)}
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-4 text-slate-600">
                      {m.credentialsAssignedAt ? (
                        <div>
                          <p className="font-semibold text-slate-800 text-[11px]">
                            {new Date(m.credentialsAssignedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <span className="text-[10px] text-slate-400">Assigned</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-600 text-[11px]">
                            {m.dateJoined || m.membershipDate || '2026-01-01'}
                          </p>
                          <span className="text-[10px] text-slate-400">Joined</span>
                        </div>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {m.lastLoginAt ? (
                        <span className="text-slate-700 font-medium">
                          {new Date(m.lastLoginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-slate-400">Never</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Assign / Reset Credentials Button */}
                        <button
                          onClick={() => handleOpenAssignModal(m)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            !m.username 
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs font-bold' 
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          title={m.username ? "Reset / Re-assign Username & Password" : "Assign Username & Password Now"}
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Resend Email Button */}
                        {m.username && (
                          <button
                            onClick={() => resendCredentialEmail(m.id)}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="Resend Credentials Email to Member"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {/* Preview Email Template */}
                        {m.username && (
                          <button
                            onClick={() => openEmailPreview(m)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Preview Credential Welcome Email"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {/* Copy details */}
                        <button
                          onClick={() => handleCopyCredentials(m)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Copy Portal Invitation Message"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Test login as member */}
                        <button
                          onClick={() => handleTestLoginAsMember(m)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Log In As This Member (Preview Portal)"
                        >
                          <LogIn className="w-4 h-4" />
                        </button>

                        {/* Digital QR */}
                        <button
                          onClick={() => setViewingMember(m)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View Complete Member Profile & QR Pass"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Direct Activate / Deactivate Account */}
                        <button
                          onClick={() => {
                            if (m.membershipStatus === 'Active' && !m.isAccessDisabled) {
                              confirmAction({
                                title: 'Deactivate Member Account',
                                message: `Are you sure you want to deactivate ${m.fullName}'s account? The member will not be able to log in until an Administrator reactivates their account.`,
                                confirmText: 'Deactivate Account',
                                cancelText: 'Cancel',
                                variant: 'warning',
                                onConfirm: () => toggleMemberActivation(m.id, false)
                              });
                            } else {
                              if (!m.portalPassword) {
                                addToast('warning', 'Password Needed', 'Please assign a password first before activating.');
                                handleOpenAssignModal(m);
                              } else {
                                toggleMemberActivation(m.id, true);
                              }
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            m.membershipStatus === 'Active' && !m.isAccessDisabled 
                              ? 'text-emerald-600 hover:bg-emerald-50' 
                              : 'text-amber-700 hover:bg-amber-100 bg-amber-50 border border-amber-200'
                          }`}
                          title={
                            m.membershipStatus === 'Active' && !m.isAccessDisabled 
                              ? "Account Active (Click to Deactivate)" 
                              : "Account Inactive / Pending (Click to Activate)"
                          }
                        >
                          {m.membershipStatus === 'Active' && !m.isAccessDisabled ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>

                        {/* Edit Member Info */}
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Member Profile"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Member */}
                        <button
                          type="button"
                          onClick={() => {
                            confirmAction({
                              title: 'Remove Member Record',
                              message: `Are you sure you want to remove ${m.fullName}? This will revoke their portal access and delete their registration pass.`,
                              confirmText: 'Delete Member',
                              cancelText: 'Keep Member',
                              variant: 'danger',
                              itemDetails: {
                                label: 'Youth Member Details',
                                value: `${m.fullName} (${m.memberId})`,
                                subValue: m.email ? `Email: ${m.email} • Brgy. ${m.barangay}` : `Barangay: ${m.barangay}`
                              },
                              onConfirm: () => {
                                deleteMember(m.id);
                                addToast(`Member ${m.fullName} deleted successfully.`, 'info');
                              }
                            });
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credential Assignment Modal */}
      {credentialModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {credentialModalMember.username ? 'Reset Member Credentials' : 'Assign Official Credentials'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    For <strong>{credentialModalMember.fullName}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCredentialModalMember(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Member Info Card */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Member ID:</span>
                <strong className="text-slate-800">{credentialModalMember.memberId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Gmail:</span>
                <strong className="text-blue-700">{credentialModalMember.email}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Barangay:</span>
                <strong className="text-slate-800">Brgy. {credentialModalMember.barangay}</strong>
              </div>
            </div>

            <form onSubmit={handleSaveAssignedCredentials} className="space-y-4">
              {/* Username Input with Auto-Generate */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Assigned Username <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateCredentials}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={assignUsername}
                  onChange={(e) => setAssignUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                  placeholder="e.g. juandelacruz"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Unique handle the member will use to sign in to the portal.
                </p>
              </div>

              {/* Assigned Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Assigned Account Password <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSuggestPassword}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Suggest New</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyModalCredentials}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type={showAssignPassword ? "text" : "password"}
                    required
                    value={assignPassword}
                    onChange={(e) => setAssignPassword(e.target.value)}
                    placeholder="Enter official portal password"
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAssignPassword(!showAssignPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showAssignPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength indicator & Admin notice */}
                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Member will use this password directly to log in.</span>
                  {assignPassword && (
                    <span className={`font-bold ${
                      validatePasswordStrength(assignPassword).score >= 3 ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {validatePasswordStrength(assignPassword).score >= 3 ? '✓ Strong' : 'Moderate'}
                    </span>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {/* Activate Account Checkbox */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs">
                  <label className="flex items-start gap-2.5 text-emerald-950 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activateAccountOnAssign}
                      onChange={(e) => setActivateAccountOnAssign(e.target.checked)}
                      className="rounded text-emerald-600 mt-0.5"
                    />
                    <div>
                      <strong className="block text-emerald-900">Activate Member Account Now</strong>
                      <span className="text-[11px] text-emerald-700 block mt-0.5">
                        Immediately enables member login with their Gmail ({credentialModalMember.email}) and this assigned password.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2 text-xs">
                  <label className="flex items-start gap-2 text-blue-950 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmailImmediately}
                      onChange={(e) => setSendEmailImmediately(e.target.checked)}
                      className="rounded text-blue-600 mt-0.5"
                    />
                    <span>
                      <strong>Send credentials notification</strong> to <span className="underline">{credentialModalMember.email}</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isAssigning || !assignPassword.trim()}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAssigning ? (
                    <span>Saving & Assigning...</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>{activateAccountOnAssign ? 'Save Password & Activate Account' : 'Save Password (Keep Inactive)'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setCredentialModalMember(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member QR / Detail Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 text-left relative my-6">
            <button
              onClick={() => setViewingMember(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <img
                src={viewingMember.profilePicture}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-600 shadow-md flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {viewingMember.memberId}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    viewingMember.membershipStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {viewingMember.membershipStatus} Member
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display mt-1 truncate">
                  {viewingMember.fullName}
                </h3>
                <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span className="truncate">{viewingMember.email}</span>
                </p>
              </div>
            </div>

            {/* Profile Grid Details with 8 Required Attributes */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                <span className="font-bold text-slate-900">{viewingMember.fullName}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Gmail Account</span>
                <span className="font-semibold text-blue-700 font-mono">{viewingMember.email}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Complete Address</span>
                <span className="font-semibold text-slate-800">
                  {viewingMember.address 
                    ? `${viewingMember.address}, Brgy. ${viewingMember.barangay}, Guimba, Nueva Ecija` 
                    : `Brgy. ${viewingMember.barangay}, Guimba, Nueva Ecija`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Birthday</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {viewingMember.birthdate || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Age</span>
                <span className="font-semibold text-slate-800">
                  {viewingMember.age ? `${viewingMember.age} years old` : 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cellphone Number</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {viewingMember.contactNumber || 'None provided'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration Date</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {viewingMember.joinDate || 'Recent'}
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Status</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold mt-0.5 ${
                    viewingMember.membershipStatus === 'Active' && !viewingMember.isAccessDisabled
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {viewingMember.membershipStatus === 'Active' && !viewingMember.isAccessDisabled
                      ? 'Active (Login Enabled)'
                      : 'Pending Activation (Login Disabled)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Password</span>
                  <span className="font-mono font-bold text-xs text-slate-800">
                    {viewingMember.portalPassword ? viewingMember.portalPassword : 'None (Unassigned)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Admin Actions in Modal */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const target = viewingMember;
                  setViewingMember(null);
                  handleOpenAssignModal(target);
                }}
                className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <KeyRound className="w-4 h-4" />
                <span>Assign / Change Password</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (viewingMember.membershipStatus === 'Active' && !viewingMember.isAccessDisabled) {
                    await toggleMemberActivation(viewingMember.id, false);
                  } else {
                    if (!viewingMember.portalPassword) {
                      addToast('warning', 'Password Required', 'Please assign a password first before activating.');
                      const target = viewingMember;
                      setViewingMember(null);
                      handleOpenAssignModal(target);
                      return;
                    }
                    await toggleMemberActivation(viewingMember.id, true);
                  }
                  setViewingMember(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                  viewingMember.membershipStatus === 'Active' && !viewingMember.isAccessDisabled
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {viewingMember.membershipStatus === 'Active' && !viewingMember.isAccessDisabled
                    ? 'Deactivate Account'
                    : 'Activate Account'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const target = viewingMember;
                  setViewingMember(null);
                  confirmAction({
                    title: 'Delete Member Account',
                    message: `Are you sure you want to permanently delete the account of ${target.fullName}?`,
                    confirmText: 'Delete Member',
                    cancelText: 'Cancel',
                    variant: 'danger',
                    onConfirm: () => {
                      deleteMember(target.id);
                      addToast(`Member ${target.fullName} has been deleted.`, 'info');
                    }
                  });
                }}
                className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Member</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingMember(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Member Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  {editingMember ? 'Edit Youth Member Profile' : 'Register New Youth Member Manually'}
                </h3>
                <p className="text-xs text-slate-500">
                  Enter complete credentials (Name, Gmail, Birthday, Age, Address) for the member registry.
                </p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* Member Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Clara Santos"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Gmail / Official Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Gmail Address (Credentials & Notifications) *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maria.santos@gmail.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>

              {/* Birthday & Age */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Birthday *</label>
                  <input
                    type="date"
                    required
                    value={formBirthdate}
                    onChange={(e) => handleBirthdateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-700">Age (Years Old)</label>
                    <span className="text-[10px] text-blue-600 font-medium">Auto-calculated</span>
                  </div>
                  <input
                    type="number"
                    min={12}
                    max={60}
                    value={formAge}
                    onChange={(e) => setFormAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* Address and Barangay */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Address / Street / Purok *</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. Purok 3, Sitio Riverside"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Barangay (Guimba) *</label>
                  <select
                    value={formBarangay}
                    onChange={(e) => setFormBarangay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  >
                    {GUIMBA_BARANGAYS.map((b) => (
                      <option key={b} value={b}>Brgy. {b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact, Gender & Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="tel"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="+63 917 000 0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Membership Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Position / Role</label>
                  <input
                    type="text"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    placeholder="Youth Member / Coordinator"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Committee</label>
                  <input
                    type="text"
                    value={formCommittee}
                    onChange={(e) => setFormCommittee(e.target.value)}
                    placeholder="General Youth Volunteer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Direct Credential Assignment Section for New Members */}
              {!editingMember && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={assignCredentialsNow}
                        onChange={(e) => setAssignCredentialsNow(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                        Assign Portal Login Credentials Immediately
                      </span>
                    </label>
                    <span className="text-[10px] text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full font-semibold">
                      Recommended
                    </span>
                  </div>

                  {assignCredentialsNow && (
                    <div className="space-y-2.5 pt-1 border-t border-blue-100/80">
                      {/* Username */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700">Assigned Username</label>
                          <button
                            type="button"
                            onClick={handleAutoGenerateFormUsername}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3" />
                            Auto-Generate
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. maria.santos"
                          value={formUsername}
                          onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-700">Initial Password</label>
                          <button
                            type="button"
                            onClick={handleSuggestFormPassword}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Suggest Password
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={formShowPassword ? 'text' : 'password'}
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                            placeholder="Set initial password"
                            className="w-full px-3 py-2 pr-10 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setFormShowPassword(!formShowPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {formShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Send Email Notice */}
                      <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                        <input
                          type="checkbox"
                          checked={formSendEmail}
                          onChange={(e) => setFormSendEmail(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-600">
                          Send credentials notice directly to member's Gmail upon registration
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors mt-2 shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {editingMember 
                    ? 'Save Member Updates' 
                    : (assignCredentialsNow && formUsername.trim() 
                        ? 'Register Member & Save Credentials' 
                        : 'Register Member Manually')}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Member Profile Picture Modal */}
      {photoTargetMember && (
        <ChangeProfilePictureModal
          isOpen={!!photoTargetMember}
          onClose={() => setPhotoTargetMember(null)}
          userType="member"
          targetMemberId={photoTargetMember.id}
          initialAvatar={photoTargetMember.profilePicture}
          title={`Change ${photoTargetMember.fullName}'s Profile Picture`}
        />
      )}
    </div>
  );
};
