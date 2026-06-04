import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#090d16] p-6 text-[#f3f4f6]">
      <div className="glass-panel rounded-2xl p-8 max-w-md w-full border border-white/10 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-xl rounded-full pointer-events-none" />
        
        <div className="p-4 rounded-full bg-danger/10 border border-danger/20 text-danger inline-block glow-red">
          <ShieldAlert className="h-10 w-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold font-display text-white">404 - Page Missing</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            The security module or resource node you are trying to access does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Core Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
