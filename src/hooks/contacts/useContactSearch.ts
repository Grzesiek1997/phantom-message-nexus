
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { filterExistingContacts } from '@/utils/contactHelpers';
import type { SearchUser, Contact } from '@/hooks/useContacts';

export const useContactSearch = (contacts: Contact[]) => {
  const { user } = useAuth();

  const searchUsers = async (query: string): Promise<SearchUser[]> => {
    if (!query.trim()) return [];
    if (!user) {
      console.log('No user authenticated for search');
      return [];
    }

    try {
      console.log('🔍 Wyszukiwanie użytkowników:', { query, currentUserId: user.id });
      
      // Build search query with proper escaping
      const searchTerm = query.trim().toLowerCase();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .neq('id', user.id)
        .order('username')
        .limit(10);

      if (error) {
        console.error('❌ Błąd wyszukiwania użytkowników:', error);
        return [];
      }

      console.log('✅ Wyniki wyszukiwania z bazy:', data);

      if (!data || data.length === 0) {
        console.log('ℹ️ Nie znaleziono użytkowników dla zapytania:', query);
        return [];
      }

      // Filter out existing contacts and friend requests
      const existingContactIds = new Set(contacts.map(c => c.contact_user_id));
      const filteredResults = data.filter(user => !existingContactIds.has(user.id));
      
      console.log('🔄 Przefiltrowane wyniki (bez istniejących kontaktów):', filteredResults);
      
      const searchResults = filteredResults.map(user => ({
        id: user.id,
        username: user.username || 'unknown',
        display_name: user.display_name || user.username || 'Unknown User',
        avatar_url: user.avatar_url
      }));

      console.log('📤 Zwracane wyniki wyszukiwania:', searchResults);
      return searchResults;

    } catch (error) {
      console.error('💥 Wyjątek w searchUsers:', error);
      return [];
    }
  };

  return {
    searchUsers
  };
};
