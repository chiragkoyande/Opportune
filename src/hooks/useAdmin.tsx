import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const checkedUserId = useRef<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking admin status
    if (authLoading) {
      return;
    }

    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        checkedUserId.current = null;
        return;
      }

      // Avoid duplicate checks for the same user
      if (checkedUserId.current === user.id) {
        return;
      }

      try {
        console.log('Checking admin status for user:', user.id);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        console.log('Admin check result:', { data, error });
        if (error) throw error;
        
        checkedUserId.current = user.id;
        const adminStatus = !!data;
        console.log('Setting isAdmin to:', adminStatus);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

  return { isAdmin, loading };
};
