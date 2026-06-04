import React from 'react';

export default function StatsCard({ title, value, subtitle, icon: Icon, colorClass = "text-primary bg-primary/10 border-primary/20" }) {
  return (
    <div className="glass-panel rounded-xl p-5 border border-white/5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-display">{title}</span>
        {Icon && (
          <div className={`p-1.5 rounded-lg border ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-white">{value}</p>
      <p className="text-[10px] text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
