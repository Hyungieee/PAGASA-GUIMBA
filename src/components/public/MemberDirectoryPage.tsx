import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Filter, Users, UserPlus, LogIn, Calendar, MapPin, Mail, Phone, Clock, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

export const MemberDirectoryPage: React.FC = () => {
  const { members, setCurrentPage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Pending' | 'Inactive'>('ALL');

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Filter by status
      if (statusFilter === 'Active' && m.membershipStatus !== 'Active') return false;
      if (statusFilter === 'Pending' && m.membershipStatus !== 'Pending') return false;
      if (statusFilter === 'Inactive' && m.membershipStatus !== 'Inactive' && !m.isAccessDisabled) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.contactNumber && m.contactNumber.toLowerCase().includes(q)) ||
        (m.address && m.address.toLowerCase().includes(q)) ||
        (m.barangay && m.barangay.toLowerCase().includes(q)) ||
        m.memberId.toLowerCase().includes(q)
      );
    });
  }, [members, searchQuery, statusFilter]);

  const getStatusBadge = (status?: string, isAccessDisabled?: boolean) => {
    if (isAccessDisabled || status === 'Inactive') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Inactive
        </span>
      );
    }
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        Pending Activation
      </span>
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-sky-200 border border-white/20">
            <Users className="w-3.5 h-3.5" />
            <span>Guimba Youth Organization</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight">
            Member Directory
          </h1>
          <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed">
            Public directory of registered youth members in Pag-asa, Guimba, Nueva Ecija. Newly registered members appear automatically upon form submission.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentPage('join')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Member</span>
            </button>
            <button
              onClick={() => setCurrentPage('login')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/30 backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Member Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats and Search Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Search bar */}
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, address, Gmail, or cellphone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>

          {/* Status Filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline flex-shrink-0">
              Filter Status:
            </span>
            {(['ALL', 'Active', 'Pending', 'Inactive'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {st === 'ALL' ? 'All Members' : st === 'Pending' ? 'Pending Activation' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong>{filteredMembers.length}</strong> of <strong>{members.length}</strong> registered members
          </span>
          <span className="text-[11px] text-slate-400 italic">
            * Passwords are encrypted and strictly hidden from directory view.
          </span>
        </div>
      </div>

      {/* Members Directory - Table (Desktop) */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Complete Address</th>
                <th className="py-3.5 px-3">Birthday</th>
                <th className="py-3.5 px-3 text-center">Age</th>
                <th className="py-3.5 px-4">Gmail Account</th>
                <th className="py-3.5 px-4">Cellphone Number</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                    No registered members matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id || member.memberId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{member.fullName}</div>
                      <div className="text-[11px] text-blue-600 font-mono font-medium">{member.memberId}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={member.address}>
                      {member.address || `Brgy. ${member.barangay}, Guimba`}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                      {formatDate(member.birthdate)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                      {member.age || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {member.email}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {member.contactNumber || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(member.membershipStatus, member.isAccessDisabled)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(member.joinDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Members Directory - Mobile Cards */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
            No registered members matched your search criteria.
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.id || member.memberId}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{member.fullName}</h3>
                  <span className="text-xs text-blue-600 font-mono font-medium">{member.memberId}</span>
                </div>
                <div>{getStatusBadge(member.membershipStatus, member.isAccessDisabled)}</div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="leading-tight">{member.address || `Brgy. ${member.barangay}, Guimba`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Birthday: {formatDate(member.birthdate)} (Age: {member.age || '—'})</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-800">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{member.contactNumber || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span>Registered: {formatDate(member.joinDate)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
