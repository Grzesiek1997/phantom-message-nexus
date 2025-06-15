
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { useContacts } from '@/hooks/useContacts';
import { useNotifications } from '@/hooks/useNotifications';
import { useChatState } from '@/hooks/useChatState';
import { useChatHandlers } from '@/hooks/useChatHandlers';
import ConversationList from '../ConversationList';
import ChatArea from './ChatArea';
import EmptyState from './EmptyState';
import NotificationButton from './NotificationButton';
import ModalsProvider from './ModalsProvider';
import SearchOverlay from '../search/SearchOverlay';

const ChatContainer: React.FC = () => {
  const {
    selectedConversationId,
    setSelectedConversationId,
    messageInput,
    setMessageInput,
    showContactSearch,
    setShowContactSearch,
    showAIAssistant,
    setShowAIAssistant,
    showGroupManagement,
    setShowGroupManagement,
    showNotifications,
    setShowNotifications,
    showSearchOverlay,
    setShowSearchOverlay,
    searchQuery,
    setSearchQuery,
    isMobile,
    showConversationList,
    setShowConversationList,
    replyingTo,
    setReplyingTo
  } = useChatState();

  const { user } = useAuth();
  const { messages, conversations, loading } = useMessages(selectedConversationId || undefined);
  const { contacts } = useContacts();
  const { unreadCount } = useNotifications();

  const {
    handleSendMessage,
    handleSelectConversation,
    handleBackToConversations,
    handleCreateConversation,
    handleCreateGroup,
    handleReply,
    handleReact,
    handleSearchChats,
    handleCloseSearch
  } = useChatHandlers({
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
  });

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return false;
    
    const query = searchQuery.toLowerCase();
    
    if (conv.name && conv.name.toLowerCase().includes(query)) {
      return true;
    }
    
    return conv.participants.some(p => 
      p.profiles.display_name.toLowerCase().includes(query) ||
      p.profiles.username.toLowerCase().includes(query)
    );
  });

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const replyingToMessage = messages.find(m => m.id === replyingTo);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header with notifications */}
      {(isMobile ? showConversationList : true) && (
        <div className="absolute top-4 right-4 z-50">
          <NotificationButton
            unreadCount={unreadCount}
            onShowNotifications={() => setShowNotifications(true)}
          />
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
          <ChatArea
            conversation={selectedConversation}
            messages={messages}
            currentUserId={user?.id || ''}
            showBackButton={isMobile}
            messageInput={messageInput}
            replyingTo={replyingTo}
            replyingToMessage={replyingToMessage}
            onBack={handleBackToConversations}
            onReply={handleReply}
            onReact={handleReact}
            onMessageChange={setMessageInput}
            onSendMessage={handleSendMessage}
            onCancelReply={() => setReplyingTo(null)}
          />
        ) : (
          <EmptyState />
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
      <ModalsProvider
        showContactSearch={showContactSearch}
        showAIAssistant={showAIAssistant}
        showGroupManagement={showGroupManagement}
        showNotifications={showNotifications}
        contacts={contacts}
        onCloseContactSearch={() => setShowContactSearch(false)}
        onCloseAIAssistant={() => setShowAIAssistant(false)}
        onCloseGroupManagement={() => setShowGroupManagement(false)}
        onCloseNotifications={() => setShowNotifications(false)}
        onSelectContact={handleCreateConversation}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
};

export default ChatContainer;
