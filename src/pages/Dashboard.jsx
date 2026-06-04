import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Shield, Users, AlertTriangle, AlertOctagon, ShieldCheck, Plus, MessageSquare, RefreshCw, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';
import { useProtectedUsers } from '../hooks/useProtectedUsers';
import { useMessages } from '../hooks/useMessages';

export default function Dashboard() {
  const { user, guardianProfile } = useAuth();
  
  const { members: familyMembers, loading: membersLoading, refetch: refetchMembers } = useProtectedUsers(user?.id);
  const { fetchRecentMessages, getMessageStats, loading: msgsLoading } = useMessages();

  const [recentMessages, setRecentMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, safe: 0, quarantine: 0, blocked: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      await refetchMembers();
    } finally {
      setRefreshing(false);
    }
  }, [user, refetchMembers]);

  // When family members change, fetch their messages and stats
  useEffect(() => {
    const loadMessagesAndStats = async () => {
      if (familyMembers && familyMembers.length > 0) {
        const memberIds = familyMembers.map(m => m.id);
        const [msgs, counts] = await Promise.all([
          fetchRecentMessages(memberIds, 10),
          getMessageStats(memberIds)
        ]);
        setRecentMessages(msgs);
        setStats(counts);
      } else {
        setRecentMessages([]);
        setStats({ total: 0, safe: 0, quarantine: 0, blocked: 0 });
      }
    };
    if (!membersLoading) {
      loadMessagesAndStats();
    }
  }, [familyMembers, fetchRecentMessages, getMessageStats, membersLoading]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('db-changes-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchDashboardData]);

  // Compute protection score
  const protectionScore = stats.total > 0 ? Math.round(((stats.safe + stats.blocked) / stats.total) * 100) : 100;

  // Relative time formatter
  const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const initialLoading = membersLoading && !refreshing;

  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Monitor your family's protection status</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchDashboardData} disabled={refreshing} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards Row — matching reference */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scams Blocked */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="metric-badge teal"><Shield className="h-5 w-5 text-white" /></div>
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> +12%</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 font-display">{stats.blocked}</p>
          <p className="text-xs text-slate-400 mt-1">Scams Blocked</p>
        </div>

        {/* Suspicious Detected */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="metric-badge amber"><AlertTriangle className="h-5 w-5 text-white" /></div>
            <span className="text-xs font-semibold text-amber-500 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> +5%</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 font-display">{stats.quarantine}</p>
          <p className="text-xs text-slate-400 mt-1">Suspicious Detected</p>
        </div>

        {/* Family Members */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="metric-badge slate"><Users className="h-5 w-5 text-white" /></div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 font-display">{familyMembers.length}</p>
          <p className="text-xs text-slate-400 mt-1">Family Members</p>
        </div>

        {/* Protection Score */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="metric-badge emerald"><ShieldCheck className="h-5 w-5 text-white" /></div>
            <span className="text-xs font-semibold text-emerald-500">Excellent</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 font-display">{protectionScore}%</p>
          <p className="text-xs text-slate-400 mt-1">Protection Score</p>
        </div>
      </div>

      {/* Two-Column: Family Members + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Family Members Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold font-display text-slate-800">Family Members</h2>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">All Protected</span>
          </div>

          {familyMembers.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-500">No family members linked yet.</p>
              <Link to="/add-family" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                <Plus className="h-3.5 w-3.5" /> Add Family Member
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                    {member.role === 'elderly' ? '👴' : member.role === 'adult' ? '👨' : '👧'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{member.name}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        member.role === 'elderly' 
                          ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                          : member.role === 'child'
                            ? 'bg-pink-50 text-pink-600 border border-pink-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {member.role === 'elderly' ? 'Elderly' : member.role === 'child' ? 'Child' : 'Adult'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" /> Protected
                    </p>
                  </div>
                  {/* Protection bar */}
                  <div className="w-24 text-right shrink-0">
                    <div className="protection-bar">
                      <div className="protection-bar-fill" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-[10px] text-emerald-500 font-semibold mt-1">100%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold font-display text-slate-800">Recent Activity</h2>
          </div>

          {recentMessages.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <MessageSquare className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-500">No SMS interceptions yet.</p>
              <p className="text-xs text-slate-400">Use the Simulator to test the system.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                  {/* Status Icon */}
                  <div className="mt-0.5">
                    {msg.status === 'blocked' && (
                      <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                        <AlertOctagon className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                    {msg.status === 'quarantine' && (
                      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </div>
                    )}
                    {msg.status === 'safe' && (
                      <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-700 capitalize">
                        {msg.status === 'blocked' ? 'Scam blocked' : msg.status === 'quarantine' ? 'Suspicious message quarantined' : 'Safe message delivered'}
                      </p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5 shrink-0">
                        <Clock className="h-3 w-3" /> {timeAgo(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {msg.protected_users?.name || 'Family Member'} • {msg.sender}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
