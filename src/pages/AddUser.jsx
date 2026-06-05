import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Users, User, Phone, ShieldAlert, ArrowLeft, Check, AlertCircle, KeyRound, Send, ShieldCheck } from 'lucide-react';
import { useProtectedUsers } from '../hooks/useProtectedUsers';
import { toast } from 'sonner';

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

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const otpRefs = useRef([]);

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOtp = () => {
    if (!phone.trim() || phone.trim().length < 10) {
      setOtpError('Please enter a valid phone number first.');
      return;
    }
    setOtpError('');
    setOtpLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      const otp = generateOtp();
      setGeneratedOtp(otp);
      setOtpSent(true);
      setOtpVerified(false);
      setOtpInput(['', '', '', '', '', '']);
      setOtpTimer(60);
      setOtpLoading(false);

      // Show the OTP in a toast (for demo purposes — in production this would be a real SMS)
      toast.success(`OTP sent to ${phone}`, {
        description: `Demo OTP: ${otp}`,
        icon: <Send className="h-5 w-5 text-primary" />,
        duration: 15000,
      });

      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 1200);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow single digit
    const newOtp = [...otpInput];
    newOtp[index] = value;
    setOtpInput(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    const fullOtp = newOtp.join('');
    if (fullOtp.length === 6) {
      if (fullOtp === generatedOtp) {
        setOtpVerified(true);
        setOtpError('');
        toast.success('Phone number verified!', {
          icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
          duration: 3000,
        });
      } else {
        setOtpError('Invalid OTP. Please try again.');
        setOtpVerified(false);
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split('');
      setOtpInput(newOtp);
      otpRefs.current[5]?.focus();

      if (pasted === generatedOtp) {
        setOtpVerified(true);
        setOtpError('');
        toast.success('Phone number verified!', {
          icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
          duration: 3000,
        });
      } else {
        setOtpError('Invalid OTP. Please try again.');
      }
    }
  };

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

    if (!otpVerified) {
      setError('Please verify the phone number with OTP before adding.');
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

  // Reset OTP when phone number changes
  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    if (otpSent) {
      setOtpSent(false);
      setOtpVerified(false);
      setGeneratedOtp('');
      setOtpInput(['', '', '', '', '', '']);
      setOtpTimer(0);
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

          {/* Phone + OTP */}
          <div>
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
              <Phone className="h-3.5 w-3.5" /> Mobile Number
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+91 98765 43212"
                className={`form-input flex-1 ${otpVerified ? 'border-emerald-300 bg-emerald-50/30' : ''}`}
                required
                disabled={loading || success || otpVerified}
              />
              {!otpVerified ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpLoading || (otpTimer > 0) || loading || success || !phone.trim()}
                  className="shrink-0 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {otpLoading ? (
                    <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div> Sending...</>
                  ) : otpTimer > 0 ? (
                    <><KeyRound className="h-3.5 w-3.5" /> Resend ({otpTimer}s)</>
                  ) : otpSent ? (
                    <><Send className="h-3.5 w-3.5" /> Resend OTP</>
                  ) : (
                    <><Send className="h-3.5 w-3.5" /> Send OTP</>
                  )}
                </button>
              ) : (
                <div className="shrink-0 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {otpVerified
                ? '✅ Phone number verified and consent confirmed.'
                : 'An OTP will be sent to verify the family member\'s consent.'}
            </p>
          </div>

          {/* OTP Input Section */}
          {otpSent && !otpVerified && (
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-slate-700">Enter 6-digit OTP</span>
                <span className="text-[10px] text-slate-400 ml-auto">
                  Sent to {phone}
                </span>
              </div>

              <div className="flex justify-center gap-2">
                {otpInput.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all ${
                      otpError
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : digit
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-slate-200 bg-white text-slate-800 focus:border-primary focus:bg-primary/5'
                    }`}
                    disabled={loading || success}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-[11px] text-red-500 text-center font-medium">{otpError}</p>
              )}

              <p className="text-[10px] text-slate-400 text-center">
                💡 For demo: Check the toast notification for the OTP code
              </p>
            </div>
          )}

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

          <button type="submit" disabled={loading || success || !otpVerified}
            className={`w-full rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              otpVerified
                ? 'bg-primary text-white hover:bg-primary-dark disabled:opacity-50'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}>
            {loading ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> Adding...</>
            ) : !otpVerified ? (
              <><KeyRound className="h-4 w-4" /> Verify Phone to Continue</>
            ) : (
              <><Users className="h-4 w-4" /> Add Family Member</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
