import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext.jsx';
import { Shield, LogOut, Home, AlertTriangle, Users, Terminal, BookOpen, Settings, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const { user, signOut, guardianProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Threat Monitor', path: '/simulator', icon: AlertTriangle },
    { name: 'Family Members', path: '/add-family', icon: Users },
    { name: 'Quarantine', path: '/quarantine', icon: Terminal },
    { name: 'Awareness', path: '/awareness', icon: BookOpen },
  ];

  // Get initials for avatar
  const getInitials = () => {
    const name = guardianProfile?.name || user?.email?.split('@')[0] || 'G';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="sidebar w-[260px] shrink-0 flex flex-col justify-between py-6 px-4 rounded-l-[24px] h-full sticky top-0 self-start overflow-y-auto">
      {/* Logo */}
      <div>
        <Link to="/" className="flex items-center gap-2.5 px-3 mb-8 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-200 transition-shadow">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold font-display text-slate-800 tracking-tight group-hover:text-primary transition-colors">Cyferion</span>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`sidebar-link ${active ? 'active' : ''}`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{link.name}</span>
                {active && <ChevronRight className="h-4 w-4 text-primary" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile + Logout */}
      <div className="space-y-3 mt-8">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {guardianProfile?.name || user?.email?.split('@')[0] || 'Guardian'}
            </p>
            <p className="text-[11px] text-slate-400">Admin</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-slate-400 hover:text-red-500 hover:bg-red-50"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
