
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatContact, formatSentRequest } from '@/utils/contactHelpers';
import type { Contact } from '@/hooks/useContacts';

export const useContactsList = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching contacts for user:', user.id);
      
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        setContacts([]);
        return;
      }

      if (contactsData && contactsData.length > 0) {
        const contactUserIds = contactsData.map(c => c.contact_user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', contactUserIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        const formattedContacts = contactsData.map(contact => {
          const profile = profilesData?.find(p => p.id === contact.contact_user_id);
          return formatContact(contact, profile);
        });

        setContacts(formattedContacts);
      }

      // Fetch received requests and merge with contacts
      const { data: receivedRequests } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', user.id);

      setContacts(prevContacts => 
        prevContacts.map(contact => {
          const req = receivedRequests?.find(
            (fr: any) => fr.sender_id === contact.contact_user_id
          );
          return req ? formatContact(contact, contact.profile, req) : contact;
        })
      );

      // Fetch sent requests
      const { data: sentRequestsData } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', user.id)
        .in('status', ['pending', 'rejected']);

      if (sentRequestsData && sentRequestsData.length > 0) {
        const receiverIds = sentRequestsData.map(r => r.receiver_id);
        const { data: receiverProfiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', receiverIds);

        const formattedRequests = sentRequestsData
          .filter(request => !contactsData?.some(contact => contact.contact_user_id === request.receiver_id))
          .map(request => {
            const profile = receiverProfiles?.find(p => p.id === request.receiver_id);
            return formatSentRequest(request, profile);
          });

        setContacts(prev => [...prev, ...formattedRequests]);
      }
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

  return {
    contacts,
    loading,
    fetchContacts,
    setContacts
  };
};
