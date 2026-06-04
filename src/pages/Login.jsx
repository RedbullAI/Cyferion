import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Shield, Lock, Mail, User, Phone, AlertCircle, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

// Simple Google SVG icon
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Login() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const { error: loginErr } = await signIn(email, password);
      if (loginErr) {
        setError(loginErr.message || 'Incorrect email or password.');
      }
      setLoading(false);
    } else {
      if (!name.trim()) {
        setError('Name is required.');
        setLoading(false);
        return;
      }
      if (!phone.trim()) {
        setError('Phone number is required for guardian registration.');
        setLoading(false);
        return;
      }
      // Validate phone format: must be digits, optionally starting with +91
      const cleanedPhone = phone.replace(/[\s\-()]/g, '');
      if (!/^(\+91)?\d{10}$/.test(cleanedPhone)) {
        setError('Enter a valid 10-digit Indian mobile number (e.g. +91 98765 43210).');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      const result = await signUp(email, password, name, phone);

      if (result.error) {
        setError(result.error.message || 'Registration failed. Please try again.');
      } else if (result.needsConfirmation) {
        // Email confirmation is enabled in Supabase
        setConfirmationSent(true);
      }
      // If no error and no confirmation needed, the auth state listener
      // will automatically redirect to /dashboard
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    const { error: googleErr } = await signInWithGoogle();
    if (googleErr) {
      setError(googleErr.message || 'Google sign-in failed.');
      setGoogleLoading(false);
    }
    // If successful, the browser redirects to Google — no need to stop loading
  };

  // Show confirmation success screen
  if (confirmationSent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 30%, #f8fafc 60%, #eff6ff 80%, #dbeafe 100%)' }}
      >
        <div className="w-full max-w-md text-center">
          <div className="card p-10">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-800 mb-2">Check Your Email</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              We've sent a confirmation link to <strong className="text-slate-700">{email}</strong>. 
              Click the link in the email to activate your account.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setConfirmationSent(false);
                  setIsLogin(true);
                  setError('');
                }}
                className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                Go to Sign In
              </button>
              <p className="text-xs text-slate-400">
                Didn't receive it? Check your spam folder or{' '}
                <button
                  onClick={() => { setConfirmationSent(false); setError(''); }}
                  className="text-primary hover:underline font-medium"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 30%, #f8fafc 60%, #eff6ff 80%, #dbeafe 100%)' }}
    >
      {/* Back to Home link */}
      <Link
        to="/"
        className="fixed top-6 left-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-800">Cyferion</h1>
          <p className="text-xs text-slate-400 mt-1">Family SMS Scam Protection</p>
        </div>

        {/* Auth Card */}
        <div className="card p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold font-display text-slate-800">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">
              {isLogin ? 'Sign in to access your protection dashboard' : 'Set up a guardian profile for your family'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                !isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Register
            </button>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 mb-4"
          >
            {googleLoading ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div> Redirecting to Google...</>
            ) : (
              <><GoogleIcon /> Continue with Google</>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                    <User className="h-3.5 w-3.5" /> Full Name
                  </label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rajesh Kumar" className="form-input" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="form-input" required />
                  <p className="text-[10px] text-slate-400 mt-1">Required — used to link scam alerts to your account</p>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="guardian@example.com" className="form-input" required />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1.5">
                <Lock className="h-3.5 w-3.5" /> Password
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="form-input pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!isLogin && <p className="text-[11px] text-slate-400 mt-1">Minimum 6 characters</p>}
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs text-primary hover:text-primary-dark font-medium transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> Processing...</>
              ) : (
                <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-slate-100">
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-xs text-slate-400 hover:text-primary transition-colors font-medium">
              {isLogin ? "Don't have an account? Get started free" : "Already registered? Sign in"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-400 mt-6">&copy; 2026 Cyferion. Protecting Indian families from SMS fraud.</p>
      </div>
    </div>
  );
}
