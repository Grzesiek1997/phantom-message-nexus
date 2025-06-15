
import React, { useState, useEffect } from 'react';
import { MessageCircle, Bell } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import ContactSearch from './ContactSearch';
import AIAssistant from './AIAssistant';
import GroupManagement from './GroupManagement';
import MessageBubble from './MessageBubble';
import ConversationList from './ConversationList';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import NotificationPanel from './NotificationPanel';
import SearchOverlay from './search/SearchOverlay';
import { Button } from '@/components/ui/button';

const RealTimeChatInterface: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { user } = useAuth();
  const { messages, conversations, loading, sendMessage, createConversation } = useMessages(selectedConversationId || undefined);
  const { contacts } = useContacts();
  const { toast } = useToast();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowConversationList(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    // TODO: Implement message reactions
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

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return false;
    
    const query = searchQuery.toLowerCase();
    
    // Search by conversation name (for groups)
    if (conv.name && conv.name.toLowerCase().includes(query)) {
      return true;
    }
    
    // Search by participant names
    return conv.participants.some(p => 
      p.profiles.display_name.toLowerCase().includes(query) ||
      p.profiles.username.toLowerCase().includes(query)
    );
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const replyingToMessage = messages.find(m => m.id === replyingTo);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header with notifications - tylko gdy lista konwersacji jest widoczna */}
      {(isMobile ? showConversationList : true) && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(true)}
            className="text-white hover:bg-white/10 relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Conversations List */}
      <ConversationList
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        currentUserId={user?.id || ''}
        loading={loading}
        isVisible={isMobile ? showConversationList : true}
        onSelectConversation={handleSelectConversation}
        onShowContactSearch={() => setShowContactSearch(true)}
        onShowAIAssistant={() => setShowAIAssistant(true)}
        onShowGroupManagement={() => setShowGroupManagement(true)}
        onSearchChats={handleSearchChats}
      />

      {/* Chat Area */}
      <div className={`${
        isMobile ? (showConversationList ? 'hidden' : 'flex') : 'flex'
      } flex-1 flex-col`}>
        
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              conversation={selectedConversation}
              currentUserId={user?.id || ''}
              showBackButton={isMobile}
              onBack={handleBackToConversations}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  currentUserId={user?.id || ''}
                  onReply={handleReply}
                  onReact={handleReact}
                />
              ))}
            </div>

            {/* Message Input */}
            <MessageInput
              messageInput={messageInput}
              replyingTo={replyingTo}
              replyingToMessage={replyingToMessage}
              onMessageChange={setMessageInput}
              onSendMessage={handleSendMessage}
              onCancelReply={() => setReplyingTo(null)}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <h3 className="text-xl font-medium text-white mb-2">Wybierz czat</h3>
              <p className="text-gray-400">Wybierz konwersację z listy lub utwórz nową</p>
            </div>
          </div>
        )}
      </div>

      {/* Search Overlay */}
      <SearchOverlay
        isVisible={showSearchOverlay}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClose={handleCloseSearch}
        results={filteredConversations}
      />

      {/* Modals */}
      {showContactSearch && (
        <ContactSearch
          isOpen={showContactSearch}
          onClose={() => setShowContactSearch(false)}
          onSelectContact={handleCreateConversation}
        />
      )}

      {showAIAssistant && (
        <AIAssistant
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      {showGroupManagement && (
        <GroupManagement
          isOpen={showGroupManagement}
          onClose={() => setShowGroupManagement(false)}
          onCreateGroup={handleCreateGroup}
          contacts={contacts}
        />
      )}

      {showNotifications && (
        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default RealTimeChatInterface;
