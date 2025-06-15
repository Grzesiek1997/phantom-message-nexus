
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useContactsList } from './contacts/useContactsList';
import { useContactSearch } from './contacts/useContactSearch';
import { useContactActions } from './contacts/useContactActions';

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
  friend_request_id?: string;
}

export interface SearchUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

export const useContacts = () => {
  const { user } = useAuth();
  const { contacts, loading, fetchContacts } = useContactsList();
  const { searchUsers } = useContactSearch(contacts);
  const { deleteContact } = useContactActions(fetchContacts);

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
  }, [user, fetchContacts]);

  return {
    contacts,
    loading,
    searchUsers,
    deleteContact,
    fetchContacts
  };
};
