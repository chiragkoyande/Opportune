import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Primary admin emails that always have admin access
const ADMIN_EMAILS = [
  'chiragkoyande4@gmail.com',
];

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
        // Check if user's email is in the primary admin list
        if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
          checkedUserId.current = user.id;
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        // Otherwise check the user_roles table
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) throw error;

        checkedUserId.current = user.id;
        setIsAdmin(!!data);
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

  return { isAdmin, loading };
};
