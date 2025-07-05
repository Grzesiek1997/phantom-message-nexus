
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Contact } from '@/hooks/useContacts';

export const useContactsList = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchContacts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching contacts for user:', user.id);

      // Pobierz kontakty użytkownika z profilami i statusami friend_requests
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          *,
          profile:profiles!contacts_contact_user_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id);

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        return;
      }

      // Pobierz status friend_requests dla każdego kontaktu
      const contactUserIds = contactsData?.map(c => c.contact_user_id) || [];
      let friendRequestsData: any[] = [];
      
      if (contactUserIds.length > 0) {
        const { data: frData, error: frError } = await supabase
          .from('friend_requests')
          .select('*')
          .or(
            `and(sender_id.eq.${user.id},receiver_id.in.(${contactUserIds.join(',')})),` +
            `and(receiver_id.eq.${user.id},sender_id.in.(${contactUserIds.join(',')}))`
          )
          .order('created_at', { ascending: false });

        if (frError) {
          console.error('Error fetching friend requests:', frError);
        } else {
          friendRequestsData = frData || [];
        }
      }

      // Sformatuj kontakty z dodatkowymi danymi
      const formattedContacts: Contact[] = (contactsData || []).map(contact => {
        const friendRequest = friendRequestsData.find(fr => 
          (fr.sender_id === user.id && fr.receiver_id === contact.contact_user_id) ||
          (fr.receiver_id === user.id && fr.sender_id === contact.contact_user_id)
        );

        return {
          id: contact.id,
          user_id: contact.user_id,
          contact_user_id: contact.contact_user_id,
          status: contact.status,
          created_at: contact.created_at,
          profile: contact.profile ? {
            username: contact.profile.username,
            display_name: contact.profile.display_name,
            avatar_url: contact.profile.avatar_url
          } : {
            username: 'Nieznany użytkownik',
            display_name: 'Nieznany użytkownik',
            avatar_url: null
          },
          friend_request_status: friendRequest?.status || null,
          can_chat: contact.status === 'accepted' && friendRequest?.status === 'accepted',
          friend_request_id: friendRequest?.id
        };
      });

      setContacts(formattedContacts);
      console.log('Formatted contacts:', formattedContacts);
    } catch (error) {
      console.error('Error in fetchContacts:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    contacts,
    loading,
    fetchContacts
  };
};
