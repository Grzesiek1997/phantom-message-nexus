
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface EnhancedContact {
  id: string;
  user_id: string;
  contact_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  nickname?: string;
  is_favorite: boolean;
  is_blocked: boolean;
  added_at: string;
  profile: {
    username: string;
    display_name?: string;
    avatar_url?: string;
    is_online: boolean;
    last_seen: string;
    status: string;
    is_verified: boolean;
  };
  mutual_contacts_count?: number;
  last_conversation_at?: string;
  unread_messages_count?: number;
}

export const useEnhancedContacts = () => {
  const [contacts, setContacts] = useState<EnhancedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          contact_profile:profiles!contacts_contact_user_id_fkey(
            username,
            display_name,
            avatar_url,
            is_online,
            last_seen,
            status,
            is_verified
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;

      const processedContacts = (data || []).map(contact => {
        // Handle the case where contact_profile might be an error object
        let profile;
        if (contact.contact_profile && typeof contact.contact_profile === 'object' && !Array.isArray(contact.contact_profile)) {
          // Check if it's an error object
          if ('error' in contact.contact_profile) {
            profile = {
              username: 'Unknown',
              display_name: 'Unknown User',
              avatar_url: '',
              is_online: false,
              last_seen: new Date().toISOString(),
              status: 'offline',
              is_verified: false
            };
          } else {
            profile = contact.contact_profile as EnhancedContact['profile'];
          }
        } else {
          profile = {
            username: 'Unknown',
            display_name: 'Unknown User',
            avatar_url: '',
            is_online: false,
            last_seen: new Date().toISOString(),
            status: 'offline',
            is_verified: false
          };
        }

        return {
          ...contact,
          profile
        };
      }) as EnhancedContact[];

      setContacts(processedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (username: string, message?: string) => {
    if (!user) return;

    try {
      // First find the user by username
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('username', username)
        .single();

      if (userError || !targetUser) {
        toast({
          title: 'Błąd',
          description: 'Nie znaleziono użytkownika o tej nazwie',
          variant: 'destructive'
        });
        return;
      }

      // Check if contact already exists
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', user.id)
        .eq('contact_user_id', targetUser.id)
        .single();

      if (existingContact) {
        toast({
          title: 'Informacja',
          description: 'Ten kontakt już istnieje',
          variant: 'default'
        });
        return;
      }

      // Create friend request
      const { error: requestError } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: targetUser.id,
          status: 'pending',
          message: message || 'Chcę dodać Cię do znajomych'
        });

      if (requestError) throw requestError;

      toast({
        title: 'Sukces',
        description: 'Zaproszenie zostało wysłane'
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wysłać zaproszenia',
        variant: 'destructive'
      });
    }
  };

  const removeContact = async (contactId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev => prev.filter(contact => contact.id !== contactId));

      toast({
        title: 'Sukces',
        description: 'Kontakt został usunięty'
      });
    } catch (error) {
      console.error('Error removing contact:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć kontaktu',
        variant: 'destructive'
      });
    }
  };

  const blockContact = async (contactId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_blocked: true, status: 'blocked' })
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, is_blocked: true, status: 'blocked' }
          : contact
      ));

      toast({
        title: 'Sukces',
        description: 'Kontakt został zablokowany'
      });
    } catch (error) {
      console.error('Error blocking contact:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zablokować kontaktu',
        variant: 'destructive'
      });
    }
  };

  const unblockContact = async (contactId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_blocked: false, status: 'accepted' })
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, is_blocked: false, status: 'accepted' }
          : contact
      ));

      toast({
        title: 'Sukces',
        description: 'Kontakt został odblokowany'
      });
    } catch (error) {
      console.error('Error unblocking contact:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się odblokować kontaktu',
        variant: 'destructive'
      });
    }
  };

  const toggleFavorite = async (contactId: string) => {
    if (!user) return;

    try {
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) return;

      const { error } = await supabase
        .from('contacts')
        .update({ is_favorite: !contact.is_favorite })
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev => prev.map(c => 
        c.id === contactId 
          ? { ...c, is_favorite: !c.is_favorite }
          : c
      ));

      toast({
        title: 'Sukces',
        description: contact.is_favorite ? 'Usunięto z ulubionych' : 'Dodano do ulubionych'
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zmienić statusu ulubionego',
        variant: 'destructive'
      });
    }
  };

  const updateNickname = async (contactId: string, nickname: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({ nickname: nickname || null })
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, nickname }
          : contact
      ));

      toast({
        title: 'Sukces',
        description: 'Pseudonim został zaktualizowany'
      });
    } catch (error) {
      console.error('Error updating nickname:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować pseudonimu',
        variant: 'destructive'
      });
    }
  };

  const searchContacts = (query: string) => {
    return contacts.filter(contact => 
      contact.profile.username.toLowerCase().includes(query.toLowerCase()) ||
      contact.profile.display_name?.toLowerCase().includes(query.toLowerCase()) ||
      contact.nickname?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getContactsByStatus = (status: 'pending' | 'accepted' | 'blocked') => {
    return contacts.filter(contact => contact.status === status);
  };

  const getFavoriteContacts = () => {
    return contacts.filter(contact => contact.is_favorite && contact.status === 'accepted');
  };

  const getOnlineContacts = () => {
    return contacts.filter(contact => 
      contact.profile.is_online && 
      contact.status === 'accepted' && 
      !contact.is_blocked
    );
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  return {
    contacts,
    loading,
    addContact,
    removeContact,
    blockContact,
    unblockContact,
    toggleFavorite,
    updateNickname,
    searchContacts,
    getContactsByStatus,
    getFavoriteContacts,
    getOnlineContacts,
    refetch: fetchContacts
  };
};
