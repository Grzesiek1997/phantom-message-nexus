
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { filterExistingContacts } from '@/utils/contactHelpers';
import type { SearchUser, Contact } from '@/hooks/useContacts';

export const useContactSearch = (contacts: Contact[]) => {
  const { user } = useAuth();

  const searchUsers = async (query: string): Promise<SearchUser[]> => {
    if (!query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      const existingContactIds = new Set(contacts.map(c => c.contact_user_id));
      return filterExistingContacts(data || [], existingContactIds);
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return [];
    }
  };

  return {
    searchUsers
  };
};
