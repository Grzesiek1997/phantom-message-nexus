
import React, { useState, useEffect } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useUserStatus } from '@/hooks/useUserStatus';
import ConversationList from './ConversationList';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import { Card } from '@/components/ui/card';
import { Users, MessageCircle } from 'lucide-react';

const RealTimeChatInterface: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<{ content: string } | undefined>();
  
  const { user } = useAuth();
  const { fetchUserStatuses } = useUserStatus();
  const { 
    messages, 
    conversations, 
    loading, 
    sendMessage,
    fetchMessages 
  } = useMessages(selectedConversationId || undefined);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Auto-select first conversation if available
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  // Fetch user statuses for conversation participants
  useEffect(() => {
    if (selectedConversation) {
      const participantIds = selectedConversation.participants?.map(p => p.user_id) || [];
      if (participantIds.length > 0) {
        fetchUserStatuses(participantIds);
      }
    }
  }, [selectedConversation, fetchUserStatuses]);

  const handleSendMessage = async () => {
    if (selectedConversationId && messageInput.trim()) {
      try {
        let content = messageInput.trim();
        
        // Add reply context if replying
        if (replyingTo && replyingToMessage) {
          content = `↩️ Odpowiedź na: "${replyingToMessage.content.substring(0, 50)}..."\n\n${content}`;
        }
        
        await sendMessage(content, selectedConversationId);
        setMessageInput('');
        setReplyingTo(null);
        setReplyingToMessage(undefined);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleReply = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setReplyingTo(messageId);
      setReplyingToMessage({ content: message.content });
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    console.log('React to message:', messageId, emoji);
    // Reactions are handled by MessageBubble component
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyingToMessage(undefined);
  };

  const getConversationDisplayName = (conversation: any) => {
    if (conversation.name) return conversation.name;
    if (conversation.type === 'group') return 'Grupa';
    
    const otherParticipant = conversation.participants?.find(
      (p: any) => p.user_id !== user?.id
    );
    return otherParticipant?.profiles?.display_name || 'Nieznany użytkownik';
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-xl">Ładowanie czatów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Conversations Sidebar */}
      <ConversationList
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        currentUserId={user?.id || ''}
        loading={loading}
        isVisible={true}
        onSelectConversation={setSelectedConversationId}
        onShowContactSearch={() => console.log('Show contact search')}
        onShowAIAssistant={() => console.log('Show AI assistant')}
        onShowGroupManagement={() => console.log('Show group management')}
        onSearchChats={() => console.log('Search chats')}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <ChatHeader 
              conversation={selectedConversation}
              currentUserId={user?.id || ''}
              showBackButton={false}
              onBack={() => {}}
            />
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center text-gray-400">
                  <div>
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Rozpocznij konwersację</p>
                    <p className="text-sm">Wyślij pierwszą wiadomość do {getConversationDisplayName(selectedConversation)}</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    currentUserId={user?.id || ''}
                    onReply={handleReply}
                    onReact={handleReact}
                  />
                ))
              )}
            </div>

            {/* Message Input */}
            <MessageInput
              messageInput={messageInput}
              replyingTo={replyingTo}
              replyingToMessage={replyingToMessage}
              onMessageChange={setMessageInput}
              onSendMessage={handleSendMessage}
              onCancelReply={handleCancelReply}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="glass border-white/20 p-8 text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Wybierz konwersację
              </h3>
              <p className="text-gray-400">
                Wybierz konwersację z listy po lewej stronie aby rozpocząć czat
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeChatInterface;
