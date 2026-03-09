import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ExternalLink, MessageSquare, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ScamAlertCard({ alert, delay = 0 }) {
  const riskColors = {
    HIGH: 'bg-destructive/10 text-destructive border-destructive/30',
    MEDIUM: 'bg-warning/10 text-warning border-warning/30',
    LOW: 'bg-primary/10 text-primary border-primary/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-xl border border-destructive/20 bg-card overflow-hidden glow-red"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Suspicious SMS Detected</p>
            <p className="font-mono text-sm mt-0.5">{alert.sender}</p>
          </div>
        </div>
        <Badge className={`${riskColors[alert.riskLevel]} border font-bold text-xs px-3 py-1`}>
          {alert.riskLevel} RISK
        </Badge>
      </div>

      {/* SMS Content */}
      <div className="px-6 py-5">
        <div className="flex items-start gap-3 mb-5">
          <MessageSquare className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
          <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-4 flex-1">
            <p className="text-sm leading-relaxed font-mono">{alert.content}</p>
          </div>
        </div>

        {/* Detection Reasons */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Detection Reasons</p>
          {alert.reasons.map((reason, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
              <span className="text-muted-foreground">{reason}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}