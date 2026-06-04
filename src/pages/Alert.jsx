import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import { AlertTriangle, Check, Trash2, Eye, ShieldCheck, Clock, Users, Phone } from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';

export default function Alert() {
  const { user } = useAuth();
  
  const { fetchPendingAlerts, resolveAlert, loading: hooksLoading } = useAlerts();
  
  const [quarantinedAlerts, setQuarantinedAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQuarantineItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const alerts = await fetchPendingAlerts(user.id);
    setQuarantinedAlerts(alerts);
    setLoading(false);
  }, [user, fetchPendingAlerts]);

  useEffect(() => { 
    fetchQuarantineItems(); 
  }, [fetchQuarantineItems]);

  const handleMarkSafe = async (alertId, messageId) => {
    setActionLoading(true);
    await resolveAlert(alertId, messageId, 'safe');
    await fetchQuarantineItems();
    setActionLoading(false);
  };

  const handleBlockDelete = async (alertId, messageId) => {
    setActionLoading(true);
    await resolveAlert(alertId, messageId, 'blocked');
    await fetchQuarantineItems();
    setActionLoading(false);
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return 'Yesterday';
  };

  // Determine risk level from analysis
  const getRiskLevel = (msg) => {
    if (!msg) return 'Medium';
    const text = msg.message?.toLowerCase() || '';
    if (text.includes('otp') || text.includes('credit card') || text.includes('urgent')) return 'High';
    return 'Medium';
  };

  // Extract threat tags
  const getThreatTags = (msg) => {
    if (!msg) return [];
    const tags = [];
    const text = msg.message?.toLowerCase() || '';
    if (text.includes('credit') || text.includes('debit')) tags.push('Credit card fraud pattern');
    if (text.includes('1800') || text.includes('helpline') || text.includes('call')) tags.push('Fake helpline number');
    if (text.includes('http') || text.includes('.in') || text.includes('.com')) tags.push('Suspicious URL');
    if (text.includes('kyc') || text.includes('verify')) tags.push('Fake bank URL');
    if (text.includes('urgent') || text.includes('immediately')) tags.push('Urgency tactics');
    if (text.includes('sbi') || text.includes('icici') || text.includes('hdfc')) tags.push('Suspicious sender ID');
    if (tags.length === 0) tags.push('Suspicious content');
    return tags;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted">Loading quarantine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-800">Quarantine</h1>
        <p className="text-sm text-slate-400 mt-0.5">Review and manage flagged messages</p>
      </div>

      {quarantinedAlerts.length === 0 ? (
        <div className="card p-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-7 w-7 text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold font-display text-slate-800">All Clear</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">No suspicious messages require your review. Your family is protected.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {quarantinedAlerts.map((alert) => {
            const msg = alert.messages;
            const riskLevel = getRiskLevel(msg);
            const threatTags = getThreatTags(msg);

            return (
              <div key={alert.id} className="card p-6 space-y-4">
                {/* Top Row: Sender + Risk Badge */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {msg?.sender}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        riskLevel === 'High' ? 'status-blocked' : 'status-quarantine'
                      }`}>
                        {riskLevel} Risk
                      </span>
                    </div>

                    {/* Message Body */}
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{msg?.message}</p>

                    {/* Threat Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {threatTags.map((tag, i) => (
                        <span key={i} className="threat-tag">{tag}</span>
                      ))}
                    </div>

                    {/* Meta Row */}
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> To: {msg?.protected_users?.name || 'Family Member'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(alert.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons — matching reference */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <Eye className="h-3.5 w-3.5" /> View Full Message
                  </button>
                  <button
                    onClick={() => handleMarkSafe(alert.id, alert.message_id)}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> Mark as Safe
                  </button>
                  <button
                    onClick={() => handleBlockDelete(alert.id, alert.message_id)}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
