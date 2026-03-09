import React from 'react';
import { motion } from 'framer-motion';

export default function AwarenessCard({ icon: Icon, title, description, color, delay = 0 }) {
  const colorMap = {
    red: 'text-destructive bg-destructive/10 border-destructive/20',
    blue: 'text-primary bg-primary/10 border-primary/20',
    yellow: 'text-warning bg-warning/10 border-warning/20',
    green: 'text-success bg-success/10 border-success/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group rounded-xl border border-border/50 bg-card p-6 hover:border-border transition-all duration-300"
    >
      <div className={`inline-flex p-3 rounded-xl border mb-4 ${colorMap[color] || colorMap.blue}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );