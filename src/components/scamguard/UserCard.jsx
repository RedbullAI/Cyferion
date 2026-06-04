import React from 'react';
import { User, ShieldAlert } from 'lucide-react';

export default function UserCard({ name, phone, role, protectionLevel }) {
  return (
    <div className="glass-panel rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-white font-display">{name}</p>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase border ${
            role === 'elderly' 
              ? 'bg-accent/10 border-accent/20 text-accent' 
              : 'bg-primary/10 border-primary/20 text-primary'
          }`}>
            {role}
          </span>
        </div>
        <p className="text-xs text-gray-400">{phone}</p>
      </div>
      
      <div className="text-right">
        <span className="rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-[10px] font-bold text-success capitalize">
          Active: {protectionLevel}
        </span>
        <p className="text-[10px] text-gray-500 mt-1">Silent Protection</p>
      </div>
    </div>
  );
}
