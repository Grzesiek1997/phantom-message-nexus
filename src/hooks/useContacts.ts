
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
  const [pendingRequests, setPendingRequests] = useState<Contact[]>([]);
  const [sentRequests, setSentRequests] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching contacts for user:', user.id);
      
      // Get accepted contacts where current user is the requester
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        return;
      }

      // Get pending requests received by current user
      const { data: receivedPendingData, error: receivedPendingError } = await supabase
        .from('contacts')
        .select('*')
        .eq('contact_user_id', user.id)
        .eq('status', 'pending');

      if (receivedPendingError) {
        console.error('Error fetching received pending requests:', receivedPendingError);
        return;
      }

      // Get pending requests sent by current user
      const { data: sentPendingData, error: sentPendingError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (sentPendingError) {
        console.error('Error fetching sent pending requests:', sentPendingError);
        return;
      }

      // Get all unique user IDs we need profiles for
      const contactUserIds = contactsData?.map(contact => contact.contact_user_id) || [];
      const receivedPendingUserIds = receivedPendingData?.map(request => request.user_id) || [];
      const sentPendingUserIds = sentPendingData?.map(request => request.contact_user_id) || [];
      
      const allUserIds = [...new Set([...contactUserIds, ...receivedPendingUserIds, ...sentPendingUserIds])];

      if (allUserIds.length === 0) {
        setContacts([]);
        setPendingRequests([]);
        setSentRequests([]);
        setLoading(false);
        return;
      }

      // Get profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', allUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Format contacts
      const formattedContacts = contactsData?.map(contact => {
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
      }) || [];

      // Format received pending requests
      const formattedReceivedPending = receivedPendingData?.map(request => {
        const profile = profilesData?.find(p => p.id === request.user_id);
        return {
          ...request,
          status: request.status as 'pending' | 'accepted' | 'blocked',
          profile: profile ? {
            username: profile.username,
            display_name: profile.display_name || profile.username,
            avatar_url: profile.avatar_url
          } : {
            username: 'Unknown',
            display_name: 'Unknown User'
          }
        };
      }) || [];

      // Format sent pending requests
      const formattedSentPending = sentPendingData?.map(request => {
        const profile = profilesData?.find(p => p.id === request.contact_user_id);
        return {
          ...request,
          status: request.status as 'pending' | 'accepted' | 'blocked',
          profile: profile ? {
            username: profile.username,
            display_name: profile.display_name || profile.username,
            avatar_url: profile.avatar_url
          } : {
            username: 'Unknown',
            display_name: 'Unknown User'
          }
        };
      }) || [];

      console.log('Formatted contacts:', formattedContacts);
      console.log('Received pending requests:', formattedReceivedPending);
      console.log('Sent pending requests:', formattedSentPending);

      setContacts(formattedContacts);
      setPendingRequests(formattedReceivedPending);
      setSentRequests(formattedSentPending);
    } catch (error) {
      console.error('Error in fetchContacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string): Promise<SearchUser[]> => {
    if (!query.trim()) return [];

    try {
      console.log('Searching users with query:', query);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('id', user?.id) // Exclude current user
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      // Filter out users who are already contacts or have pending requests
      const existingContactIds = new Set([
        ...contacts.map(c => c.contact_user_id),
        ...pendingRequests.map(p => p.user_id),
        ...sentRequests.map(s => s.contact_user_id)
      ]);

      const filteredResults = data?.filter(searchUser => !existingContactIds.has(searchUser.id)) || [];
      console.log('Filtered search results:', filteredResults);
      
      return filteredResults;
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return [];
    }
  };

  const addContact = async (contactUserId: string) => {
    if (!user) return;

    try {
      console.log('Adding contact:', contactUserId);

      // Check if contact relationship already exists
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('*')
        .or(`and(user_id.eq.${user.id},contact_user_id.eq.${contactUserId}),and(user_id.eq.${contactUserId},contact_user_id.eq.${user.id})`)
        .maybeSingle();

      if (existingContact) {
        toast({
          title: 'Kontakt już istnieje',
          description: 'Ten użytkownik jest już w Twojej liście kontaktów lub zaproszenie zostało już wysłane',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_user_id: contactUserId,
          status: 'pending'
        });

      if (error) {
        console.error('Error adding contact:', error);
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

      await fetchContacts();
    } catch (error) {
      console.error('Error in addContact:', error);
      throw error;
    }
  };

  const acceptContact = async (contactId: string) => {
    if (!user) return;

    try {
      console.log('Accepting contact:', contactId);

      // Update the contact status to accepted
      const { error } = await supabase
        .from('contacts')
        .update({ status: 'accepted' })
        .eq('id', contactId);

      if (error) {
        console.error('Error accepting contact:', error);
        toast({
          title: 'Błąd akceptacji kontaktu',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      // Create reciprocal contact entry
      const pendingRequest = pendingRequests.find(p => p.id === contactId);
      if (pendingRequest) {
        const { error: reciprocalError } = await supabase
          .from('contacts')
          .insert({
            user_id: user.id,
            contact_user_id: pendingRequest.user_id,
            status: 'accepted'
          });

        if (reciprocalError) {
          console.error('Error creating reciprocal contact:', reciprocalError);
        }
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

  const rejectContact = async (contactId: string) => {
    try {
      console.log('Rejecting contact:', contactId);

      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        console.error('Error rejecting contact:', error);
        toast({
          title: 'Błąd odrzucenia kontaktu',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      await fetchContacts();
      toast({
        title: 'Zaproszenie odrzucone',
        description: 'Zaproszenie zostało odrzucone'
      });
    } catch (error) {
      console.error('Error in rejectContact:', error);
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
    pendingRequests,
    sentRequests,
    loading,
    searchUsers,
    addContact,
    acceptContact,
    rejectContact,
    fetchContacts
  };
};
