import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { useRealtimeAlerts } from '../../hooks/useRealtimeAlerts';
import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';

export default function RealtimeAlertManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleNewAlert = useCallback((newAlert) => {
    toast.error('Suspicious Message Detected!', {
      description: 'A message has been quarantined. Review it now.',
      icon: <ShieldAlert className="h-5 w-5 text-red-500" />,
      duration: 6000,
      action: {
        label: 'View',
        onClick: () => navigate('/quarantine')
      }
    });
  }, [navigate]);

  useRealtimeAlerts(user?.id, handleNewAlert);

  return null;
}
