import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useMessages() {
  const [loading, setLoading] = useState(false);

  const fetchRecentMessages = useCallback(async (memberIds, limit = 15) => {
    if (!memberIds || memberIds.length === 0) return [];
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, protected_users(name)')
        .in('protected_user_id', memberIds)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching messages:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getMessageStats = useCallback(async (memberIds) => {
    if (!memberIds || memberIds.length === 0) {
      return { total: 0, safe: 0, quarantine: 0, blocked: 0 };
    }
    try {
      const { data: allMsgs, error } = await supabase
        .from('messages')
        .select('status')
        .in('protected_user_id', memberIds);

      if (error) throw error;
      
      const counts = { total: allMsgs?.length || 0, safe: 0, quarantine: 0, blocked: 0 };
      allMsgs?.forEach((m) => {
        if (m.status === 'safe') counts.safe++;
        else if (m.status === 'quarantine') counts.quarantine++;
        else if (m.status === 'blocked') counts.blocked++;
      });
      return counts;
    } catch (err) {
      console.error('Error fetching stats:', err);
      return { total: 0, safe: 0, quarantine: 0, blocked: 0 };
    }
  }, []);

  return { loading, fetchRecentMessages, getMessageStats };
}
