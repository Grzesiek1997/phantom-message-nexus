
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
  friend_request_status?: 'pending' | 'accepted' | 'rejected' | null;
  can_chat: boolean;
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
      
      // Pobierz wszystkie kontakty bezpośrednio z joinami
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          *,
          profiles!contacts_contact_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id);

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        setContacts([]);
        return;
      }

      // Pobierz wysłane zaproszenia
      const { data: sentRequestsData, error: sentRequestsError } = await supabase
        .from('friend_requests')
        .select(`
          *,
          profiles!friend_requests_receiver_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('sender_id', user.id)
        .in('status', ['pending', 'rejected']);

      if (sentRequestsError) {
        console.error('Error fetching sent requests:', sentRequestsError);
      }

      // Formatuj kontakty
      const formattedContacts = (contactsData || []).map(contact => {
        const profile = contact.profiles;
        const isAccepted = contact.status === 'accepted';
        
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
          },
          friend_request_status: isAccepted ? 'accepted' as const : contact.status as 'pending' | 'accepted' | 'rejected',
          can_chat: isAccepted
        };
      });

      // Formatuj wysłane zaproszenia (pending/rejected)
      const formattedRequests = (sentRequestsData || [])
        .filter(request => !contactsData?.some(contact => contact.contact_user_id === request.receiver_id))
        .map(request => {
          const profile = request.profiles;
          return {
            id: request.id,
            user_id: user.id,
            contact_user_id: request.receiver_id,
            status: 'pending' as const,
            created_at: request.created_at || new Date().toISOString(),
            profile: profile ? {
              username: profile.username,
              display_name: profile.display_name || profile.username,
              avatar_url: profile.avatar_url
            } : {
              username: 'Unknown',
              display_name: 'Unknown User'
            },
            friend_request_status: request.status as 'pending' | 'accepted' | 'rejected',
            can_chat: false
          };
        });

      setContacts([...formattedContacts, ...formattedRequests]);
    } catch (error) {
      console.error('Error in fetchContacts:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać listy kontaktów',
        variant: 'destructive'
      });
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

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const contactsChannel = supabase
      .channel('contacts-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Contacts table updated, refreshing...');
          fetchContacts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `sender_id=eq.${user.id}`
        },
        () => {
          console.log('Friend requests table updated, refreshing...');
          fetchContacts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          console.log('Received friend requests updated, refreshing...');
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contactsChannel);
    };
  }, [user]);

  return {
    contacts,
    loading,
    searchUsers,
    deleteContact,
    fetchContacts
  };
};
