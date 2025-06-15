import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, UserPlus } from 'lucide-react';

interface ChatInterfaceProps {
  conversationId: string;
  otherUserId?: string;
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  otherUserId,
  onSendMessage,
  disabled = false
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [canSendMessages, setCanSendMessages] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<'accepted' | 'pending' | 'none'>('none');
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { sendFriendRequest } = useFriendRequests();
  const { toast } = useToast();

  useEffect(() => {
    if (otherUserId && user) {
      // Sprawdź status znajomości
      const contact = contacts.find(c => c.contact_user_id === otherUserId);

      if (contact) {
        if (contact.can_chat && contact.status === 'accepted') {
          setFriendshipStatus('accepted');
          setCanSendMessages(true);
        } else if(contact.friend_request_status === 'pending') {
          setFriendshipStatus('pending');
          setCanSendMessages(false);
        } else {
          setFriendshipStatus('none');
          setCanSendMessages(false);
        }
      } else {
        setFriendshipStatus('none');
        setCanSendMessages(false);
      }
    }
  }, [otherUserId, contacts, user]);

  const handleSendMessage = () => {
    if (!messageContent.trim() || !canSendMessages) return;
    
    onSendMessage(messageContent.trim());
    setMessageContent('');
  };

  const handleSendFriendRequest = async () => {
    if (!otherUserId) return;
    
    try {
      await sendFriendRequest(otherUserId);
      setFriendshipStatus('pending');
      toast({
        title: 'Zaproszenie wysłane',
        description: 'Zaproszenie do znajomych zostało wysłane'
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wysłać zaproszenia',
        variant: 'destructive'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!canSendMessages && otherUserId) {
    return (
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="text-center py-4">
          {friendshipStatus === 'pending' ? (
            <div className="space-y-2">
              <p className="text-gray-400">Oczekuje na zaakceptowanie zaproszenia do znajomych</p>
              <Button
                onClick={handleSendFriendRequest}
                className="bg-blue-500 hover:bg-blue-600"
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Wyślij ponownie zaproszenie
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-400">Aby wysyłać wiadomości, musisz być znajomym tej osoby</p>
              <Button
                onClick={handleSendFriendRequest}
                className="bg-blue-500 hover:bg-blue-600"
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Wyślij zaproszenie do znajomych
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-700 bg-gray-800">
      <div className="flex space-x-2">
        <Input
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Napisz wiadomość..."
          disabled={disabled || !canSendMessages}
          className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!messageContent.trim() || disabled || !canSendMessages}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
