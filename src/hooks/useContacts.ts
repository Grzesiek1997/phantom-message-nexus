
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

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!user) return;

    try {
      // First get contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        return;
      }

      if (!contactsData || contactsData.length === 0) {
        setContacts([]);
        setLoading(false);
        return;
      }

      // Then get profiles for those contacts
      const contactUserIds = contactsData.map(contact => contact.contact_user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', contactUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Combine contacts with profiles
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
    } catch (error) {
      console.error('Error in fetchContacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return [];
    }
  };

  const addContact = async (contactUserId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_user_id: contactUserId,
          status: 'pending'
        });

      if (error) {
        toast({
          title: 'Błąd dodawania kontaktu',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      toast({
        title: 'Zaproszenie wysłane',
        description: 'Zaproszenie do kontaktów zostało wysłane'
      });
    } catch (error) {
      console.error('Error in addContact:', error);
      throw error;
    }
  };

  const acceptContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'accepted' })
        .eq('id', contactId);

      if (error) {
        toast({
          title: 'Błąd akceptacji kontaktu',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      await fetchContacts();
      toast({
        title: 'Kontakt zaakceptowany',
        description: 'Kontakt został dodany do Twojej listy'
      });
    } catch (error) {
      console.error('Error in acceptContact:', error);
      throw error;
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
    addContact,
    acceptContact,
    fetchContacts
  };
};
