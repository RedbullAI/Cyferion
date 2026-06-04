import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertCircle, ChevronRight, ShieldCheck, Users, Zap, Lock, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Landing() {
  const { user, guardianProfile } = useAuth();

  const getInitials = () => {
    const name = guardianProfile?.name || user?.email?.split('@')[0] || 'G';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = guardianProfile?.name || user?.email?.split('@')[0] || 'Guardian';
  const stats = [
    { value: '50K+', label: 'Scams Blocked' },
    { value: '10K+', label: 'Families Protected' },
    { value: '99.3%', label: 'Detection Accuracy' },
  ];

  const features = [
    { title: 'Real-Time SMS Scanning', desc: 'Every incoming message is analyzed instantly using pattern-matching heuristics before it reaches the user.', icon: Zap, color: 'teal' },
    { title: 'Family Network Protection', desc: 'Link elderly parents and children under a single guardian dashboard with individual protection levels.', icon: Users, color: 'slate' },
    { title: 'Intelligent Quarantine', desc: 'Uncertain messages are held for review while obvious scams are blocked silently — zero interruption.', icon: Lock, color: 'amber' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 30%, #f8fafc 60%, #eff6ff 80%, #dbeafe 100%)' }}>
      {/* Top Navigation — fixed on scroll */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-slate-800">Cyferion</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">How It Works</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">About</a>
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                  <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials()}
                  </div>
                  <span>{displayName}</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                  Login
                </Link>
                <Link
                  to="/login"
                  className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
          {/* Mobile menu button */}
          {user ? (
            <Link to="/dashboard" className="md:hidden flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{getInitials()}</div>
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="md:hidden bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl">
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-8">
          <AlertCircle className="h-3.5 w-3.5" />
          Protecting Indian families from SMS scams
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-display leading-tight text-slate-800 max-w-4xl mx-auto">
          Clickbait?{' '}
          <span className="text-primary">We don't click that.</span>
        </h1>
        
        <p className="text-base md:text-lg text-slate-500 mt-6 max-w-2xl mx-auto leading-relaxed">
          Cyferion actively protects your elderly parents, children, and family members from SMS scams. One phone controls protection for everyone.
        </p>

        <div className="flex items-center justify-center gap-4 mt-10">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm"
            >
              Go to Dashboard <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm"
            >
              Get Started Free <ChevronRight className="h-4 w-4" />
            </Link>
          )}
          <a
            href="#features"
            className="bg-white text-slate-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200 text-sm"
          >
            See How It Works
          </a>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-3xl mx-auto px-6 py-8 border-t border-slate-200/50">
        <div className="grid grid-cols-3 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold font-display text-slate-800">{s.value}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold font-display text-slate-800 text-center mb-4">How Cyferion Protects Your Family</h2>
        <p className="text-slate-500 text-center max-w-2xl mx-auto mb-12">Silent, automatic, and intelligent — our engine runs in the background so your family stays safe without even knowing it.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="card p-6 text-left hover:shadow-lg transition-shadow">
                <div className={`metric-badge ${f.color} mb-4`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-800 font-display mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-200/30">
        <h2 className="text-3xl font-bold font-display text-slate-800 text-center mb-12">3 Simple Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Register as Guardian', desc: 'Create your account and set up your family protection dashboard in under 2 minutes.' },
            { step: '02', title: 'Add Family Members', desc: 'Link your elderly parents, children, or relatives with individual protection levels.' },
            { step: '03', title: 'Stay Protected', desc: 'Cyferion silently scans all incoming SMS and blocks scams before they cause harm.' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-4 font-display">
                {item.step}
              </div>
              <h3 className="text-base font-bold text-slate-800 font-display mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="p-10 text-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)' }}>
          <ShieldCheck className="h-12 w-12 text-white/90 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display text-white mb-3">Ready to Protect Your Family?</h2>
          <p className="text-sm text-blue-200 mb-8 max-w-md mx-auto">Join thousands of Indian families who trust Cyferion to keep their loved ones safe from SMS fraud.</p>
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              Get Started Free <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="max-w-7xl mx-auto px-6 py-8 text-center border-t border-slate-200/50">
        <p className="text-xs text-slate-400">&copy; 2026 Cyferion. Protecting Indian families from SMS fraud.</p>
      </footer>
    </div>
  );
}
