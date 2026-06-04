import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useProtectedUsers(guardianId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!guardianId) {
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('protected_users')
        .select('*')
        .eq('guardian_id', guardianId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      setMembers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guardianId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = async (memberData) => {
    try {
      const { data, error } = await supabase
        .from('protected_users')
        .insert({ ...memberData, guardian_id: guardianId })
        .select()
        .single();
      
      if (error) throw error;
      setMembers(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  return { members, loading, error, refetch: fetchMembers, addMember };
}
