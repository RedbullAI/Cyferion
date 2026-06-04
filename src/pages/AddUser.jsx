import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Users, User, Phone, ShieldAlert, ArrowLeft, Check, AlertCircle, PenLine, Trash2 } from 'lucide-react';
import { useProtectedUsers } from '../hooks/useProtectedUsers';

export default function AddUser() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addMember } = useProtectedUsers(user?.id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('elderly');
  const [protectionLevel, setProtectionLevel] = useState('medium');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Session expired. Please log in again.');
      setLoading(false);
      return;
    }

    if (!name.trim() || !phone.trim()) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const { error: insertErr } = await addMember({
        name,
        phone,
        role,
        protection_level: protectionLevel,
      });

      if (insertErr) {
        if (insertErr.includes('duplicate')) throw new Error('This phone number is already registered.');
        throw new Error(insertErr);
      }

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to add family member.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-primary transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold font-display text-slate-800">Family Members</h1>
        <p className="text-sm text-slate-400 mt-0.5">Add and manage protected family members</p>
      </div>

      {/* Add New Member Form Card */}
      <div className="card p-6">
        <h2 className="text-base font-bold font-display text-slate-800 mb-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          Add New Family Member
        </h2>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600 mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-600 mb-4">
            <Check className="h-4 w-4 shrink-0" />
            <span>Family member added! Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
              <User className="h-3.5 w-3.5" /> Full Name
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunita Kumar" className="form-input" required disabled={loading || success} />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
              <Phone className="h-3.5 w-3.5" /> Mobile Number
            </label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43212" className="form-input" required disabled={loading || success} />
            <p className="text-[10px] text-slate-400 mt-1">Include country code for accurate matching</p>
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-2">
              <Users className="h-3.5 w-3.5" /> Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'elderly', label: 'Elderly', emoji: '👴' },
                { id: 'adult', label: 'Adult', emoji: '👨' },
                { id: 'child', label: 'Child', emoji: '👧' },
              ].map((r) => (
                <button key={r.id} type="button" onClick={() => setRole(r.id)} disabled={loading || success}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                    role === r.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}>
                  <span className="text-lg">{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Protection Level */}
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-2">
              <ShieldAlert className="h-3.5 w-3.5" /> Protection Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'low', label: 'Standard', color: 'emerald' },
                { id: 'medium', label: 'Enhanced', color: 'amber' },
                { id: 'high', label: 'Maximum', color: 'red' },
              ].map((lvl) => (
                <button key={lvl.id} type="button" onClick={() => setProtectionLevel(lvl.id)} disabled={loading || success}
                  className={`py-3 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                    protectionLevel === lvl.id
                      ? lvl.id === 'high' ? 'border-red-200 bg-red-50 text-red-600'
                        : lvl.id === 'medium' ? 'border-amber-200 bg-amber-50 text-amber-600'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                      : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                  }`}>
                  {lvl.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {protectionLevel === 'low' && 'Standard: Basic heuristic scanning and known scam pattern detection.'}
              {protectionLevel === 'medium' && 'Enhanced: Automated blocks on confirmed scams + quarantine on moderate risks.'}
              {protectionLevel === 'high' && 'Maximum: Blocks all messages from unknown numbers, quarantines everything.'}
            </p>
          </div>

          <button type="submit" disabled={loading || success}
            className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> Adding...</>
            ) : (
              <><Users className="h-4 w-4" /> Add Family Member</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
