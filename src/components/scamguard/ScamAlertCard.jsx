import React from 'react';
import { AlertTriangle, ShieldCheck, AlertOctagon } from 'lucide-react';

export default function ScamAlertCard({ sender, message, timestamp, status, targetName }) {
  return (
    <div className="p-4 hover:bg-white/[0.01] transition-colors flex items-start gap-4 text-left">
      <div className="mt-0.5 shrink-0">
        {status === 'safe' && (
          <div className="p-2 rounded-lg bg-success/10 border border-success/20 text-success">
            <ShieldCheck className="h-4 w-4" />
          </div>
        )}
        {status === 'quarantine' && (
          <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent">
            <AlertTriangle className="h-4 w-4 animate-pulse" />
          </div>
        )}
        {status === 'blocked' && (
          <div className="p-2 rounded-lg bg-danger/10 border border-danger/20 text-danger">
            <AlertOctagon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold text-white tracking-wide truncate">{sender}</p>
          <p className="text-[10px] text-gray-500 font-medium shrink-0">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <p className="text-xs text-gray-300 break-words line-clamp-2 leading-relaxed">"{message}"</p>

        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-[10px] text-gray-500 font-semibold">
            Target: <span className="text-gray-300">{targetName}</span>
          </p>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
            status === 'safe' ? 'bg-success/10 text-success' :
            status === 'quarantine' ? 'bg-accent/10 text-accent' :
            'bg-danger/10 text-danger'
          }`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}