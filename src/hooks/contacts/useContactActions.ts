
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useContactActions = (refreshContacts: () => void) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const deleteContact = async (contactId: string) => {
    if (!user) return;

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
        description: 'Kontakt został pomyślnie usunięty'
      });

      refreshContacts();
    } catch (error) {
      console.error('Error in deleteContact:', error);
    }
  };

  return {
    deleteContact
  };
};
