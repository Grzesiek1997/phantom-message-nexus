
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminData {
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
}

export const useAdminCheck = (): AdminData => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState<AdminData>({
    isAdmin: false,
    isModerator: false,
    loading: true
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setAdminData({ isAdmin: false, isModerator: false, loading: false });
        return;
      }

      try {
        // Check if user has admin or moderator role
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error checking admin status:', error);
          setAdminData({ isAdmin: false, isModerator: false, loading: false });
          return;
        }

        const userRoles = roles?.map(r => r.role) || [];
        const isAdmin = userRoles.includes('admin') || user.email === '97gibek@gmail.com';
        const isModerator = userRoles.includes('moderator');

        console.log('🔐 Admin check:', { userEmail: user.email, roles: userRoles, isAdmin, isModerator });

        setAdminData({
          isAdmin,
          isModerator,
          loading: false
        });
      } catch (error) {
        console.error('Admin check error:', error);
        setAdminData({ isAdmin: false, isModerator: false, loading: false });
      }
    };

    checkAdminStatus();
  }, [user]);

  return adminData;
};
