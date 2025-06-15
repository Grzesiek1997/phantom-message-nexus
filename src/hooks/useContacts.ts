
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  profile: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface SearchUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching contacts for user:', user.id);
      
      // Pobierz zaakceptowane kontakty
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        return;
      }

      // Pobierz profile kontaktów
      if (contactsData && contactsData.length > 0) {
        const contactUserIds = contactsData.map(contact => contact.contact_user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', contactUserIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return;
        }

        const formattedContacts = contactsData.map(contact => {
          const profile = profilesData?.find(p => p.id === contact.contact_user_id);
          return {
            ...contact,
            status: contact.status as 'pending' | 'accepted' | 'blocked',
            profile: profile ? {
              username: profile.username,
              display_name: profile.display_name || profile.username,
              avatar_url: profile.avatar_url
            } : {
              username: 'Unknown',
              display_name: 'Unknown User'
            }
          };
        });

        setContacts(formattedContacts);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error('Error in fetchContacts:', error);
    } finally {
      setLoading(false);
    }
  };

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

      // Filtruj użytkowników którzy już są kontaktami
      const existingContactIds = new Set(contacts.map(c => c.contact_user_id));
      const filteredResults = data?.filter(searchUser => !existingContactIds.has(searchUser.id)) || [];
      
      return filteredResults;
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return [];
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase.rpc('delete_contact', {
        contact_id: contactId
      });

      if (error) {
        console.error('Error deleting contact:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się usunąć kontaktu',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Kontakt usunięty',
        description: 'Kontakt został usunięty z listy znajomych'
      });

      await fetchContacts();
    } catch (error) {
      console.error('Error in deleteContact:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  return {
    contacts,
    loading,
    searchUsers,
    deleteContact,
    fetchContacts
  };
};
