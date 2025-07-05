
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { filterExistingContacts } from '@/utils/contactHelpers';
import type { SearchUser, Contact } from '@/hooks/useContacts';

export const useContactSearch = (contacts: Contact[]) => {
  const { user } = useAuth();

  const searchUsers = async (query: string): Promise<SearchUser[]> => {
    if (!query.trim()) return [];

    try {
      console.log('Searching for users with query:', query);
      
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

      console.log('Raw search results:', data);

      if (!data || data.length === 0) {
        console.log('No users found');
        return [];
      }

      // Filter out existing contacts
      const existingContactIds = new Set(contacts.map(c => c.contact_user_id));
      const filteredResults = data.filter(user => !existingContactIds.has(user.id));
      
      console.log('Filtered search results:', filteredResults);
      
      return filteredResults.map(user => ({
        id: user.id,
        username: user.username || 'unknown',
        display_name: user.display_name || user.username || 'Unknown User',
        avatar_url: user.avatar_url
      }));
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return [];
    }
  };

  return {
    searchUsers
  };
};
