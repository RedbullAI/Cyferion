import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAlerts() {
  const [loading, setLoading] = useState(false);

  const fetchPendingAlerts = useCallback(async (guardianId) => {
    if (!guardianId) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*, messages(*, protected_users(name))')
        .eq('guardian_id', guardianId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error loading alerts:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveAlert = async (alertId, messageId, resolution) => {
    setLoading(true);
    try {
      await supabase.from('messages').update({ status: resolution }).eq('id', messageId);
      const alertStatus = resolution === 'safe' ? 'resolved_safe' : 'resolved_deleted';
      await supabase.from('alerts').update({ status: alertStatus }).eq('id', alertId);
      return { success: true };
    } catch (err) {
      console.error('Error resolving alert:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { loading, fetchPendingAlerts, resolveAlert };
}
