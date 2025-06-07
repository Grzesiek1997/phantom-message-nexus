
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
        // Sprawdzenie czy użytkownik jest adminem przez funkcję is_admin
        const { data: isAdminResult, error: adminError } = await supabase
          .rpc('is_admin', { check_user_id: user.id });

        if (adminError) {
          console.error('Error checking admin status:', adminError);
          // Fallback - sprawdź po emailu
          const isAdmin = user.email === '97gibek@gmail.com';
          setAdminData({ isAdmin, isModerator: false, loading: false });
          return;
        }

        const isAdmin = isAdminResult || user.email === '97gibek@gmail.com';
        
        // Sprawdzenie roli moderatora
        const { data: userRole, error: roleError } = await supabase
          .rpc('get_user_role', { check_user_id: user.id });

        const isModerator = !roleError && userRole === 'moderator';

        console.log('🔐 Admin check:', { 
          userEmail: user.email, 
          isAdmin, 
          isModerator,
          userRole 
        });

        setAdminData({
          isAdmin,
          isModerator,
          loading: false
        });
      } catch (error) {
        console.error('Admin check error:', error);
        // Fallback dla błędów
        const isAdmin = user.email === '97gibek@gmail.com';
        setAdminData({ isAdmin, isModerator: false, loading: false });
      }
    };

    checkAdminStatus();
  }, [user]);

  return adminData;
};
