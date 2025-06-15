
import React, { useState, useEffect } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import ConversationList from './ConversationList';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import { Card } from '@/components/ui/card';
import { Users, MessageCircle } from 'lucide-react';

const RealTimeChatInterface: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const { user } = useAuth();
  const { 
    messages, 
    conversations, 
    loading, 
    sendMessage,
    fetchMessages 
  } = useMessages(selectedConversationId);

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

  const handleSendMessage = async (content: string, expiresInHours?: number) => {
    if (selectedConversationId && content.trim()) {
      try {
        await sendMessage(content, selectedConversationId, expiresInHours);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
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
      <div className="w-80 border-r border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Konwersacje
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Brak konwersacji</p>
              <p className="text-sm mt-2">Dodaj znajomych aby rozpocząć czat</p>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              currentUserId={user?.id || ''}
            />
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <ChatHeader 
              conversation={selectedConversation}
              currentUserId={user?.id || ''}
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
                    isOwn={message.sender_id === user?.id}
                    currentUserId={user?.id || ''}
                  />
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-white/10 p-4">
              <MessageInput onSendMessage={handleSendMessage} />
            </div>
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
