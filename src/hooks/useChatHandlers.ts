
import { useMessages } from './useMessages';
import { useToast } from './use-toast';

interface UseChatHandlersProps {
  selectedConversationId: string | null;
  messageInput: string;
  replyingTo: string | null;
  messages: any[];
  isMobile: boolean;
  setSelectedConversationId: (id: string | null) => void;
  setMessageInput: (input: string) => void;
  setReplyingTo: (id: string | null) => void;
  setShowConversationList: (show: boolean) => void;
  setShowContactSearch: (show: boolean) => void;
  setShowGroupManagement: (show: boolean) => void;
  setShowSearchOverlay: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useChatHandlers = ({
  selectedConversationId,
  messageInput,
  replyingTo,
  messages,
  isMobile,
  setSelectedConversationId,
  setMessageInput,
  setReplyingTo,
  setShowConversationList,
  setShowContactSearch,
  setShowGroupManagement,
  setShowSearchOverlay,
  setSearchQuery
}: UseChatHandlersProps) => {
  const { sendMessage, createConversation } = useMessages(selectedConversationId || undefined);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId) return;

    try {
      let finalMessage = messageInput;
      if (replyingTo) {
        const repliedMessage = messages.find(m => m.id === replyingTo);
        if (repliedMessage) {
          finalMessage = `↩️ Odpowiedź na: "${repliedMessage.content.substring(0, 50)}..."\n\n${messageInput}`;
        }
        setReplyingTo(null);
      }

      await sendMessage(finalMessage, selectedConversationId, 24);
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Błąd wysyłania',
        description: 'Nie udało się wysłać wiadomości',
        variant: 'destructive'
      });
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleBackToConversations = () => {
    if (isMobile) {
      setShowConversationList(true);
      setSelectedConversationId(null);
    }
  };

  const handleCreateConversation = async (contactId: string) => {
    try {
      const conversationId = await createConversation([contactId]);
      if (conversationId) {
        setSelectedConversationId(conversationId);
        setShowContactSearch(false);
        if (isMobile) {
          setShowConversationList(false);
        }
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleCreateGroup = async (groupName: string, participantIds: string[]) => {
    try {
      const conversationId = await createConversation(participantIds, 'group', groupName);
      if (conversationId) {
        setSelectedConversationId(conversationId);
        setShowGroupManagement(false);
        if (isMobile) {
          setShowConversationList(false);
        }
        toast({
          title: 'Grupa utworzona',
          description: `Grupa "${groupName}" została pomyślnie utworzona`,
        });
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
  };

  const handleReact = (messageId: string, emoji: string) => {
    toast({
      title: 'Reakcja dodana',
      description: `Dodano reakcję ${emoji}`,
    });
  };

  const handleSearchChats = () => {
    setShowSearchOverlay(true);
    setSearchQuery('');
  };

  const handleCloseSearch = () => {
    setShowSearchOverlay(false);
    setSearchQuery('');
  };

  return {
    handleSendMessage,
    handleSelectConversation,
    handleBackToConversations,
    handleCreateConversation,
    handleCreateGroup,
    handleReply,
    handleReact,
    handleSearchChats,
    handleCloseSearch
  };
};
