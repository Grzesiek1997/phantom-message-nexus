
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface AdminTestContact {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  is_test_user: boolean;
  created_at: string;
}

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [testContacts, setTestContacts] = useState<AdminTestContact[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        return;
      }

      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
    }
  };

  const createTestContact = async (username: string, displayName: string) => {
    if (!isAdmin) return;

    try {
      // Najpierw sprawdź czy użytkownik już istnieje
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (existingProfile) {
        toast({
          title: 'Błąd',
          description: 'Użytkownik testowy już istnieje',
          variant: 'destructive'
        });
        return;
      }

      // Stwórz profil testowy
      const testUserId = crypto.randomUUID();
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          username,
          display_name: displayName,
          status: 'available',
          is_online: true
        });

      if (profileError) throw profileError;

      // Dodaj rolę użytkownika
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: testUserId,
          role: 'user'
        });

      if (roleError) throw roleError;

      // Automatycznie dodaj jako kontakt dla admina
      await addTestContactToAdmin(testUserId);

      toast({
        title: 'Sukces',
        description: 'Kontakt testowy został utworzony'
      });

      await fetchTestContacts();
    } catch (error) {
      console.error('Error creating test contact:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się utworzyć kontaktu testowego',
        variant: 'destructive'
      });
    }
  };

  const addTestContactToAdmin = async (testUserId: string) => {
    if (!user || !isAdmin) return;

    try {
      // Dodaj kontakt w obu kierunkach
      await supabase
        .from('contacts')
        .insert([
          {
            user_id: user.id,
            contact_user_id: testUserId,
            status: 'accepted'
          },
          {
            user_id: testUserId,
            contact_user_id: user.id,
            status: 'accepted'
          }
        ]);
    } catch (error) {
      console.error('Error adding test contact to admin:', error);
    }
  };

  const fetchTestContacts = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .like('username', 'test_%')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedContacts = (data || []).map(contact => ({
        ...contact,
        is_test_user: true
      })) as AdminTestContact[];

      setTestContacts(processedContacts);
    } catch (error) {
      console.error('Error fetching test contacts:', error);
    }
  };

  const deleteTestContact = async (contactId: string) => {
    if (!isAdmin) return;

    try {
      // Usuń wszystkie powiązane dane
      await supabase.from('contacts').delete().eq('contact_user_id', contactId);
      await supabase.from('contacts').delete().eq('user_id', contactId);
      await supabase.from('user_roles').delete().eq('user_id', contactId);
      await supabase.from('profiles').delete().eq('id', contactId);

      toast({
        title: 'Sukces',
        description: 'Kontakt testowy został usunięty'
      });

      await fetchTestContacts();
    } catch (error) {
      console.error('Error deleting test contact:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć kontaktu testowego',
        variant: 'destructive'
      });
    }
  };

  const sendTestMessage = async (contactId: string, content: string) => {
    if (!user || !isAdmin) return;

    try {
      // Znajdź lub stwórz konwersację
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select(`
          id,
          conversation_participants!inner (user_id)
        `)
        .eq('type', 'direct')
        .eq('conversation_participants.user_id', user.id);

      let conversationId = null;

      if (existingConversation) {
        // Znajdź konwersację z tym konkretnym użytkownikiem
        for (const conv of existingConversation) {
          const participants = conv.conversation_participants?.map((p: any) => p.user_id) || [];
          if (participants.includes(contactId) && participants.length === 2) {
            conversationId = conv.id;
            break;
          }
        }
      }

      if (!conversationId) {
        // Stwórz nową konwersację
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            type: 'direct',
            created_by: user.id
          })
          .select()
          .single();

        if (convError) throw convError;

        conversationId = newConversation.id;

        // Dodaj uczestników
        await supabase
          .from('conversation_participants')
          .insert([
            { conversation_id: conversationId, user_id: user.id, role: 'admin' },
            { conversation_id: conversationId, user_id: contactId, role: 'member' }
          ]);
      }

      // Wyślij wiadomość testową
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: 'text'
        });

      if (messageError) throw messageError;

      toast({
        title: 'Sukces',
        description: 'Wiadomość testowa została wysłana'
      });
    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wysłać wiadomości testowej',
        variant: 'destructive'
      });
    }
  };

  const createDefaultTestContacts = async () => {
    if (!isAdmin) return;

    const defaultContacts = [
      { username: 'test_user_1', displayName: 'Użytkownik Testowy 1' },
      { username: 'test_user_2', displayName: 'Użytkownik Testowy 2' },
      { username: 'test_user_3', displayName: 'Użytkownik Testowy 3' }
    ];

    for (const contact of defaultContacts) {
      await createTestContact(contact.username, contact.displayName);
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchTestContacts();
    }
  }, [isAdmin]);

  return {
    isAdmin,
    testContacts,
    loading,
    createTestContact,
    deleteTestContact,
    sendTestMessage,
    createDefaultTestContacts,
    fetchTestContacts
  };
};
