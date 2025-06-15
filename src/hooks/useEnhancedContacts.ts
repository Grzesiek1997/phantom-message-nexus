import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface EnhancedContact {
  id: string;
  user_id: string;
  contact_user_id: string;
  nickname?: string;
  is_blocked: boolean;
  is_favorite: boolean;
  verified_safety_number?: string;
  status: string;
  added_at: string;
  created_at: string;
  contact_profile?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
    is_online: boolean;
    last_seen: string;
    status: string;
    is_verified: boolean;
  };
}

export interface ContactVerification {
  id: string;
  user1_id: string;
  user2_id: string;
  safety_number: string;
  is_verified: boolean;
  verified_at?: string;
  created_at: string;
}

export const useEnhancedContacts = () => {
  const [contacts, setContacts] = useState<EnhancedContact[]>([]);
  const [blockedContacts, setBlockedContacts] = useState<EnhancedContact[]>([]);
  const [favoriteContacts, setFavoriteContacts] = useState<EnhancedContact[]>([]);
  const [verifications, setVerifications] = useState<ContactVerification[]>([]);
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
        .eq('status', 'accepted');

      if (error) throw error;

      // Filter and process contacts with valid profile data
      const processedContacts = (data || [])
        .filter(contact => contact.contact_profile && typeof contact.contact_profile === 'object')
        .map(contact => ({
          ...contact,
          contact_profile: contact.contact_profile && typeof contact.contact_profile === 'object' && !('error' in contact.contact_profile)
            ? contact.contact_profile as EnhancedContact['contact_profile']
            : {
                username: 'Unknown',
                display_name: 'Unknown User',
                avatar_url: '',
                is_online: false,
                last_seen: new Date().toISOString(),
                status: 'offline',
                is_verified: false
              }
        })) as EnhancedContact[];

      setContacts(processedContacts.filter(c => !c.is_blocked));
      setBlockedContacts(processedContacts.filter(c => c.is_blocked));
      setFavoriteContacts(processedContacts.filter(c => c.is_favorite && !c.is_blocked));
    } catch (error) {
      console.error('Error fetching enhanced contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contact_verifications')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    }
  };

  const blockContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_blocked: true })
        .eq('id', contactId);

      if (error) throw error;

      await fetchContacts();
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
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_blocked: false })
        .eq('id', contactId);

      if (error) throw error;

      await fetchContacts();
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

  const toggleFavorite = async (contactId: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ is_favorite: isFavorite })
        .eq('id', contactId);

      if (error) throw error;

      await fetchContacts();
      toast({
        title: 'Sukces',
        description: isFavorite ? 'Dodano do ulubionych' : 'Usunięto z ulubionych'
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować ulubionego',
        variant: 'destructive'
      });
    }
  };

  const setNickname = async (contactId: string, nickname: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ nickname: nickname || null })
        .eq('id', contactId);

      if (error) throw error;

      await fetchContacts();
      toast({
        title: 'Sukces',
        description: 'Pseudonim został zaktualizowany'
      });
    } catch (error) {
      console.error('Error setting nickname:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować pseudonimu',
        variant: 'destructive'
      });
    }
  };

  const generateSafetyNumber = async (contactUserId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('generate_safety_number', {
        user1_uuid: user.id,
        user2_uuid: contactUserId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating safety number:', error);
      return null;
    }
  };

  const verifyContact = async (contactUserId: string, userEnteredNumber: string) => {
    if (!user) return;

    try {
      const actualSafetyNumber = await generateSafetyNumber(contactUserId);
      
      if (!actualSafetyNumber) {
        throw new Error('Could not generate safety number');
      }

      const isValid = actualSafetyNumber === userEnteredNumber;

      if (isValid) {
        const { error } = await supabase
          .from('contact_verifications')
          .upsert({
            user1_id: user.id < contactUserId ? user.id : contactUserId,
            user2_id: user.id < contactUserId ? contactUserId : user.id,
            safety_number: actualSafetyNumber,
            is_verified: true,
            verified_at: new Date().toISOString()
          });

        if (error) throw error;

        await fetchVerifications();
        toast({
          title: 'Sukces',
          description: 'Kontakt został zweryfikowany'
        });
      } else {
        toast({
          title: 'Błąd weryfikacji',
          description: 'Podany numer bezpieczeństwa jest nieprawidłowy',
          variant: 'destructive'
        });
      }

      return isValid;
    } catch (error) {
      console.error('Error verifying contact:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zweryfikować kontaktu',
        variant: 'destructive'
      });
      return false;
    }
  };

  const getVerificationStatus = (contactUserId: string): ContactVerification | null => {
    if (!user) return null;

    return verifications.find(v => 
      (v.user1_id === user.id && v.user2_id === contactUserId) ||
      (v.user1_id === contactUserId && v.user2_id === user.id)
    ) || null;
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchContacts(), fetchVerifications()]);
    };
    fetchData();
  }, [user]);

  return {
    contacts,
    blockedContacts,
    favoriteContacts,
    verifications,
    loading,
    blockContact,
    unblockContact,
    toggleFavorite,
    setNickname,
    generateSafetyNumber,
    verifyContact,
    getVerificationStatus,
    refetch: () => Promise.all([fetchContacts(), fetchVerifications()])
  };
};
