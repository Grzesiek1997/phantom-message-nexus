
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type: string;
  uploaded_at: string;
}

export const useMessageAttachments = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadAttachment = async (file: File, messageId: string): Promise<MessageAttachment | null> => {
    if (!user) {
      toast({
        title: 'Błąd',
        description: 'Musisz być zalogowany aby przesłać plik',
        variant: 'destructive'
      });
      return null;
    }

    setUploading(true);

    try {
      // For now, we'll create a simple file URL simulation since storage bucket isn't set up
      // In production, you would upload to Supabase Storage
      const fileUrl = `https://placeholder.com/${file.name}`;

      // Save attachment info to database
      const { data, error } = await supabase
        .from('message_attachments')
        .insert({
          message_id: messageId,
          file_name: file.name,
          file_url: fileUrl,
          file_size: file.size,
          file_type: file.type,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: 'Sukces',
        description: 'Plik został przesłany pomyślnie'
      });

      return data as MessageAttachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się przesłać pliku',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getAttachments = async (messageId: string): Promise<MessageAttachment[]> => {
    try {
      const { data, error } = await supabase
        .from('message_attachments')
        .select('*')
        .eq('message_id', messageId);

      if (error) {
        throw error;
      }

      return (data || []) as MessageAttachment[];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  };

  const deleteAttachment = async (attachmentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('message_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sukces',
        description: 'Załącznik został usunięty'
      });

      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć załącznika',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    uploading,
    uploadAttachment,
    getAttachments,
    deleteAttachment
  };
};
