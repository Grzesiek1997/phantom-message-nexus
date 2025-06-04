
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

    const { data, error } = await supabase
      .from('contacts')
      .select(`
        id,
        user_id,
        contact_user_id,
        status,
        created_at,
        profiles!contacts_contact_user_id_fkey (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching contacts:', error);
      return;
    }

    const formattedContacts = data.map(contact => ({
      ...contact,
      profile: contact.profiles
    }));

    setContacts(formattedContacts);
    setLoading(false);
  };

  const searchUsers = async (query: string) => {
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
  };

  const addContact = async (contactUserId: string) => {
    if (!user) return;

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
  };

  const acceptContact = async (contactId: string) => {
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
