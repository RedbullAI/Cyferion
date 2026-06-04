import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// This hook subscribes to the 'alerts' table to notify the guardian of new quarantine alerts
export function useRealtimeAlerts(guardianId, onNewAlert) {
  useEffect(() => {
    if (!guardianId) return;

    const channel = supabase
      .channel('public:alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `guardian_id=eq.${guardianId}`,
        },
        (payload) => {
          if (payload.new && payload.new.status === 'pending') {
            onNewAlert(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guardianId, onNewAlert]);
}
