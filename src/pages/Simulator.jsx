import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Play, Terminal, Users, Check, AlertCircle, AlertTriangle, ShieldCheck, AlertOctagon, Phone, Clock, MessageSquare } from 'lucide-react';
import { useProtectedUsers } from '../hooks/useProtectedUsers';
import { useMessages } from '../hooks/useMessages';

export default function Simulator() {
  const { user } = useAuth();
  
  const { members: familyMembers, loading: membersLoading } = useProtectedUsers(user?.id);
  const { fetchRecentMessages, loading: msgsLoading } = useMessages();
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [smsText, setSmsText] = useState('');
  const [senderHandle, setSenderHandle] = useState('CP-SBIINF');

  const [simulationRun, setSimulationRun] = useState(false);
  const [result, setResult] = useState(null);

  // Recent messages from the Threat Monitor table
  const [recentMessages, setRecentMessages] = useState([]);

  const selectedMember = familyMembers.find(m => m.id === selectedMemberId);
  const memberMessages = [...recentMessages]
    .filter(msg => msg.protected_user_id === selectedMemberId)
    .reverse();

  useEffect(() => {
    if (familyMembers.length > 0 && !selectedMemberId) {
      setSelectedMemberId(familyMembers[0].id);
    }
  }, [familyMembers, selectedMemberId]);

  const loadMessages = useCallback(async () => {
    if (familyMembers && familyMembers.length > 0) {
      const msgs = await fetchRecentMessages(familyMembers.map(m => m.id), 15);
      setRecentMessages(msgs);
    }
    setLoading(membersLoading);
  }, [familyMembers, fetchRecentMessages, membersLoading]);

  useEffect(() => {
    if (!membersLoading) {
      loadMessages();
    }
  }, [membersLoading, loadMessages]);

  const analyzeMessage = (text, sender) => {
    let urgencyScore = 0, linkScore = 0, impersonationScore = 0;
    const flaggedKeywords = [], flaggedLinks = [];
    const normalizedText = text.toLowerCase();

    const urgencyWords = ['urgent', 'blocked', 'suspended', 'immediately', 'verify', 'freeze', 'disconnected', 'action required', 'expires'];
    urgencyWords.forEach((word) => {
      if (normalizedText.includes(word)) { urgencyScore += 3.5; flaggedKeywords.push(word); }
    });
    urgencyScore = Math.min(Math.round(urgencyScore), 10);

    const linkPatterns = [/https?:\/\/[^\s]+/g, /bit\.ly/g, /tinyurl\.com/g, /t\.co/g, /goo\.gl/g];
    let hasLinks = false;
    linkPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) { hasLinks = true; matches.forEach(m => { if (!flaggedLinks.includes(m)) flaggedLinks.push(m); }); }
    });
    if (hasLinks) { linkScore += 5; if (text.includes('http://')) { linkScore += 5; flaggedKeywords.push('unsecure link'); } }
    linkScore = Math.min(Math.round(linkScore), 10);

    const brands = ['sbi', 'hdfc', 'icici', 'paytm', 'netflix', 'post', 'electricity', 'kyc'];
    brands.forEach((brand) => {
      if (normalizedText.includes(brand)) {
        const isWhitelisted = sender.toUpperCase().includes(brand.toUpperCase());
        if (!isWhitelisted) { impersonationScore += 5; flaggedKeywords.push(`Unverified brand (${brand})`); }
      }
    });
    impersonationScore = Math.min(Math.round(impersonationScore), 10);

    const totalScore = Math.min(Math.round((urgencyScore * 0.3) + (linkScore * 0.4) + (impersonationScore * 0.3)), 10);
    let riskVerdict = 'safe';
    if (totalScore >= 7) riskVerdict = 'blocked';
    else if (totalScore >= 4) riskVerdict = 'quarantine';

    return { urgencyScore, linkScore, impersonationScore, totalScore, riskVerdict, flaggedKeywords, flaggedLinks };
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setSimulationRun(false);
    setActionLoading(true);

    if (!selectedMemberId) { alert('Add a family member first.'); setActionLoading(false); return; }
    if (!smsText.trim()) { alert('Enter mock SMS text.'); setActionLoading(false); return; }

    const analysis = analyzeMessage(smsText, senderHandle);

    try {
      const { data: msgData, error: msgErr } = await supabase
        .from('messages')
        .insert({ sender: senderHandle, message: smsText, status: analysis.riskVerdict, protected_user_id: selectedMemberId })
        .select().single();
      if (msgErr) throw msgErr;

      await supabase.from('scam_analysis').insert({
        message_id: msgData.id, urgency_score: analysis.urgencyScore, link_score: analysis.linkScore,
        impersonation_score: analysis.impersonationScore, total_score: analysis.totalScore,
        risk_verdict: analysis.riskVerdict, flagged_keywords: analysis.flaggedKeywords, flagged_links: analysis.flaggedLinks,
      });

      if (analysis.riskVerdict === 'quarantine') {
        await supabase.from('alerts').insert({ message_id: msgData.id, guardian_id: user.id, status: 'pending' });
      }

      // Refresh messages list
      const memberIds = familyMembers.map(m => m.id);
      const { data: updatedMsgs } = await supabase
        .from('messages')
        .select('*, protected_users(name)')
        .in('protected_user_id', memberIds)
        .order('timestamp', { ascending: false })
        .limit(15);
      setRecentMessages(updatedMsgs || []);

      setResult(analysis);
      setSimulationRun(true);
      setSuccessMsg('SMS logged to database! Check your Dashboard.');
    } catch (err) {
      console.error('Simulation failed:', err.message);
      alert('Failed: ' + err.message);
    } finally { setActionLoading(false); }
  };

  const loadPreset = (type) => {
    if (type === 'scam_bank') {
      setSenderHandle('CP-SBIINF');
      setSmsText('URGENT: Your SBI bank account will be blocked today due to outdated KYC. Update immediately at http://bit.ly/sbi-verify-kyc.');
    } else if (type === 'scam_electricity') {
      setSenderHandle('9876543210');
      setSmsText('Dear Consumer, your electricity connection will be suspended tonight at 9:30 PM. Call electricity officer at 9876543211.');
    } else if (type === 'quarantine_otp') {
      setSenderHandle('UNKNOWN');
      setSmsText('Verify your Netflix account details immediately to avoid service interruption.');
    } else {
      setSenderHandle('HDFC-ALERT');
      setSmsText('Your HDFC bank account ending 5432 has been credited with INR 45,000 via NEFT on 28-05-2026. If not you, contact branch.');
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return 'Yesterday';
  };

  const getRiskLabel = (status) => {
    if (status === 'blocked') return 'High';
    if (status === 'quarantine') return 'Medium';
    return 'Low';
  };

  // Safety: timeout loading state after 5 seconds
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoadingTimedOut(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (loading && !loadingTimedOut) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-800">Threat Monitor</h1>
        <p className="text-sm text-slate-400 mt-0.5">Monitor all intercepted messages and simulate new threats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form, Results, and Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Simulate SMS Card */}
          <div className="card p-6">
            <h2 className="text-base font-bold font-display text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Terminal className="h-4 w-4 text-primary" />
              </div>
              Simulate SMS Ingestion
            </h2>

            {familyMembers.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Add a family member first to run simulations.</p>
                <Link to="/add-family" className="text-xs font-semibold text-primary hover:underline mt-2 inline-block">Add Family Member</Link>
              </div>
            ) : (
              <form onSubmit={handleSimulate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Target Family Member</label>
                    <select value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)} className="form-input" required>
                      {familyMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Sender ID / Number</label>
                    <input type="text" value={senderHandle} onChange={(e) => setSenderHandle(e.target.value)} className="form-input" required />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">SMS Message Body</label>
                    <textarea value={smsText} onChange={(e) => setSmsText(e.target.value)} rows={3} className="form-input resize-none" required placeholder="Type or load a preset..." />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => loadPreset('scam_bank')} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-colors">KYC Phishing</button>
                    <button type="button" onClick={() => loadPreset('scam_electricity')} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 hover:bg-amber-100 transition-colors">Electricity Scam</button>
                    <button type="button" onClick={() => loadPreset('quarantine_otp')} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-600 hover:bg-yellow-100 transition-colors">⚠️ Suspicious OTP</button>
                    <button type="button" onClick={() => loadPreset('safe_msg')} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-colors">Safe Message</button>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center gap-3">
                  <button type="submit" disabled={actionLoading} className="bg-primary text-white rounded-xl px-6 py-2.5 text-xs font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-1.5">
                    {actionLoading ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div> Processing...</> : <><Play className="h-3.5 w-3.5" /> Run Simulation</>}
                  </button>

                  {successMsg && (
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> {successMsg}</span>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Simulation Result */}
          {simulationRun && result && (
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-display text-slate-800">Analysis Result</h3>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                  result.riskVerdict === 'safe' ? 'status-safe' : result.riskVerdict === 'quarantine' ? 'status-quarantine' : 'status-blocked'
                }`}>
                  {result.riskVerdict === 'safe' ? 'Safe — Delivered' : result.riskVerdict === 'quarantine' ? 'Quarantined' : 'Blocked'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-3 text-center"><p className="text-[10px] text-slate-400">Urgency</p><p className="text-lg font-extrabold text-slate-800">{result.urgencyScore}/10</p></div>
                <div className="bg-slate-50 rounded-xl p-3 text-center"><p className="text-[10px] text-slate-400">Links</p><p className="text-lg font-extrabold text-slate-800">{result.linkScore}/10</p></div>
                <div className="bg-slate-50 rounded-xl p-3 text-center"><p className="text-[10px] text-slate-400">Spoofing</p><p className="text-lg font-extrabold text-slate-800">{result.impersonationScore}/10</p></div>
              </div>

              {result.flaggedKeywords?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.flaggedKeywords.map((kw, i) => <span key={i} className="threat-tag">{kw}</span>)}
                </div>
              )}
            </div>
          )}

          {/* Threat Monitor Table — matching reference design */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold font-display text-slate-800">All Intercepted Messages</h2>
            </div>

            {recentMessages.length === 0 ? (
              <div className="text-center py-12"><p className="text-sm text-slate-400">No messages intercepted yet.</p></div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {msg.status === 'safe' && <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center"><ShieldCheck className="h-4 w-4 text-emerald-500" /></div>}
                      {msg.status === 'blocked' && <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center"><AlertOctagon className="h-4 w-4 text-red-500" /></div>}
                      {msg.status === 'quarantine' && <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center"><AlertTriangle className="h-4 w-4 text-amber-500" /></div>}
                    </div>

                    {/* Status Text */}
                    <span className={`text-[11px] font-semibold w-24 shrink-0 ${
                      msg.status === 'safe' ? 'text-emerald-600' : msg.status === 'blocked' ? 'text-red-500' : 'text-amber-600'
                    } capitalize`}>
                      {msg.status === 'quarantine' ? 'Quarantine' : msg.status === 'blocked' ? 'Blocked' : 'Safe'}
                    </span>

                    {/* Sender */}
                    <div className="w-32 shrink-0">
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                        <Phone className="h-3 w-3 text-slate-400" /> {msg.sender}
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                        <Clock className="h-3 w-3" /> {timeAgo(msg.timestamp)}
                      </p>
                    </div>

                    {/* Message preview */}
                    <p className="flex-1 text-xs text-slate-500 truncate min-w-0">{msg.message}</p>

                    {/* Risk badge */}
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      msg.status === 'blocked' ? 'risk-high' : msg.status === 'quarantine' ? 'risk-medium' : 'risk-low'
                    }`}>
                      {getRiskLabel(msg.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Smartphone Simulator */}
        <div className="lg:col-span-1">
          <div className="card p-6 flex flex-col items-center">
            <h2 className="text-base font-bold font-display text-slate-800 mb-4 w-full flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              Device Simulator
            </h2>

            {selectedMember ? (
              <div className="relative mx-auto border-slate-800 bg-slate-800 border-[10px] rounded-[2rem] h-[520px] w-[260px] shadow-lg overflow-hidden flex flex-col">
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-3.5 bg-slate-800 rounded-b-xl mx-auto w-28 z-20"></div>
                
                {/* Screen */}
                <div className="h-full w-full bg-[#f8fafc] flex flex-col pt-4 relative overflow-hidden">
                  {/* Status Bar */}
                  <div className="px-4 py-1 flex justify-between items-center text-[8px] font-semibold text-slate-400 select-none">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1">
                      <span>5G</span>
                      <div className="w-4 h-2 border border-slate-400 rounded-sm p-0.5 flex items-center"><div className="bg-slate-400 w-full h-full rounded-2xs"></div></div>
                    </div>
                  </div>

                  {/* Messaging Header */}
                  <div className="bg-white border-b border-slate-100 p-3 flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                      {selectedMember.role === 'elderly' ? '👴' : selectedMember.role === 'child' ? '👧' : '👨'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{selectedMember.name}</p>
                      <p className="text-[9px] text-emerald-500 font-semibold flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Protection
                      </p>
                    </div>
                  </div>

                  {/* Message Bubble Container */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar flex flex-col">
                    {memberMessages.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <MessageSquare className="h-8 w-8 text-slate-300 mb-1" />
                        <p className="text-[10px] text-slate-400">No messages received on this device yet.</p>
                      </div>
                    ) : (
                      memberMessages.map((msg) => (
                        <div key={msg.id} className="space-y-1">
                          {/* Sender Tag */}
                          <span className="text-[9px] font-bold text-slate-400 px-1">{msg.sender}</span>
                          
                          {/* Bubble styling based on status */}
                          {msg.status === 'safe' ? (
                            <div className="bg-white border border-slate-100 text-slate-700 text-[11px] p-2.5 rounded-2xl rounded-tl-none shadow-2xs max-w-[90%] break-words">
                              {msg.message}
                            </div>
                          ) : msg.status === 'quarantine' ? (
                            <div className="bg-amber-50/80 border border-amber-200 text-amber-900 text-[10px] p-2.5 rounded-2xl rounded-tl-none max-w-[90%] space-y-1">
                              <p className="font-bold flex items-center gap-1 text-[10px] text-amber-700">
                                <AlertTriangle className="h-3 w-3 shrink-0" /> SMS Quarantined
                              </p>
                              <p className="text-slate-400 italic line-through select-none opacity-40 blur-[1px]">
                                {msg.message.substring(0, 15)}...
                              </p>
                              <p className="text-[9px] text-amber-600 bg-amber-100/50 p-1 rounded-md font-medium">
                                Hidden by Cyferion. Guardian is reviewing this message.
                              </p>
                            </div>
                          ) : (
                            <div className="bg-red-50/80 border border-red-200 text-red-900 text-[10px] p-2.5 rounded-2xl rounded-tl-none max-w-[90%] space-y-1">
                              <p className="font-bold flex items-center gap-1 text-[10px] text-red-700">
                                <AlertOctagon className="h-3 w-3 shrink-0" /> Scam Blocked
                              </p>
                              <p className="text-[9px] text-red-600 bg-red-100/50 p-1.5 rounded-md font-medium">
                                This message was automatically blocked to protect your account.
                              </p>
                            </div>
                          )}
                          
                          {/* Time */}
                          <p className="text-[8px] text-slate-400 px-1 text-right">
                            {timeAgo(msg.timestamp)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-slate-400">Select a family member to view their device preview.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
