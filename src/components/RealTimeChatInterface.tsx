
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ContactSearch from './ContactSearch';
import AIAssistant from './AIAssistant';
import GroupManagement from './GroupManagement';
import MessageBubble from './MessageBubble';
import ConversationList from './ConversationList';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import SearchOverlay from './search/SearchOverlay';

const RealTimeChatInterface: React.FC = () => {
  const location = useLocation();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { user } = useAuth();
  const { messages, conversations, loading, sendMessage, createConversation, fetchConversations } = useMessages(selectedConversationId || undefined);
  const { contacts } = useContacts();
  const { toast } = useToast();

  // Handle initial conversation selection from navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state?.selectedConversationId) {
      console.log('Setting initial conversation from navigation:', state.selectedConversationId);
      setSelectedConversationId(state.selectedConversationId);
      if (window.innerWidth < 768) {
        setShowConversationList(false);
      }
      
      // Clear the navigation state to prevent issues on refresh
      if (state.fromContacts) {
        window.history.replaceState({}, document.title);
        
        // Pokazuj powiadomienie o powodzeniu
        toast({
          title: 'Czat otwarty',
          description: 'Możesz teraz wysyłać wiadomości',
        });
      }
    }
  }, [location.state, toast]);

  // Monitor conversations to ensure selected conversation exists
  useEffect(() => {
    if (selectedConversationId && conversations.length > 0) {
      const conversationExists = conversations.find(c => c.id === selectedConversationId);
      if (!conversationExists) {
        console.log('Selected conversation no longer exists, clearing selection');
        setSelectedConversationId(null);
        if (window.innerWidth < 768) {
          setShowConversationList(true);
        }
      }
    }
  }, [conversations, selectedConversationId]);

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
    console.log('Selecting conversation:', conversationId);
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
      console.log('Creating conversation with contact:', contactId);
      
      // Sprawdź czy kontakt istnieje i jest zaakceptowany
      const contact = contacts.find(c => c.contact_user_id === contactId);
      if (!contact || !contact.can_chat) {
        toast({
          title: 'Nie można utworzyć czatu',
          description: 'Ten kontakt nie zaakceptował jeszcze zaproszenia do znajomych',
          variant: 'destructive'
        });
        return;
      }
      
      const conversationId = await createConversation([contactId]);
      if (conversationId) {
        console.log('Conversation created, selecting:', conversationId);
        setSelectedConversationId(conversationId);
        setShowContactSearch(false);
        if (isMobile) {
          setShowConversationList(false);
        }
        toast({
          title: 'Czat utworzony',
          description: 'Możesz teraz wysyłać wiadomości'
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Błąd tworzenia czatu',
        description: 'Nie udało się utworzyć czatu. Sprawdź połączenie z internetem.',
        variant: 'destructive'
      });
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
      toast({
        title: 'Błąd tworzenia grupy',
        description: 'Nie udało się utworzyć grupy. Spróbuj ponownie.',
        variant: 'destructive'
      });
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
    </div>
  );
};

export default RealTimeChatInterface;
