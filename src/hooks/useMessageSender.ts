
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export const useMessageSender = (setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessage = async (content: string, conversationId: string, expiresInHours?: number) => {
    if (!user) {
      toast({
        title: 'Błąd',
        description: 'Musisz być zalogowany aby wysłać wiadomość',
        variant: 'destructive'
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: 'Błąd',
        description: 'Wiadomość nie może być pusta',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Sending message:', { content, conversationId, userId: user.id });

      const expiresAt = expiresInHours 
        ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          conversation_id: conversationId,
          sender_id: user.id,
          expires_at: expiresAt,
          message_type: 'text'
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Błąd wysyłania wiadomości',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      console.log('Message sent successfully:', data);
      
      // Optionally add the message to local state immediately for better UX
      if (data) {
        const newMessage = {
          ...data,
          message_type: data.message_type as 'text' | 'file' | 'image',
          sender: {
            username: user.user_metadata?.username || 'You',
            display_name: user.user_metadata?.display_name || user.user_metadata?.username || 'You'
          }
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  };

  return { sendMessage };
};
