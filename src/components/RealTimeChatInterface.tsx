import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import { ArrowLeft, Phone, Video, MoreVertical, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MessageBubble from './MessageBubble';
import ChatInterface from './messaging/ChatInterface';

const RealTimeChatInterface: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { contacts } = useContacts();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Pobierz conversationId ze state lub jako domyślny
  const selectedConversationId = location.state?.selectedConversationId;
  
  const { 
    messages, 
    conversations, 
    loading, 
    sendMessage, 
    fetchMessages 
  } = useMessages(selectedConversationId);
  
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(selectedConversationId);

  // Znajdź aktualną konwersację
  const currentConversation = conversations.find(conv => conv.id === currentConversationId);
  
  // Znajdź drugiego użytkownika w konwersacji bezpośredniej
  const otherParticipant = currentConversation?.type === 'direct' 
    ? currentConversation.participants.find(p => p.user_id !== user?.id)
    : null;

  // Znajdź kontakt na podstawie drugiego uczestnika
  const contact = otherParticipant 
    ? contacts.find(c => c.contact_user_id === otherParticipant.user_id)
    : null;

  const conversationName = currentConversation?.name || 
    (otherParticipant?.profiles?.display_name || otherParticipant?.profiles?.username || 'Nieznany użytkownik');

  useEffect(() => {
    if (selectedConversationId) {
      setCurrentConversationId(selectedConversationId);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (currentConversationId && user) {
      fetchMessages(currentConversationId);
    }
  }, [currentConversationId, user, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId) return;
    
    try {
      await sendMessage(content, currentConversationId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReply = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      const replyPrefix = `↩️ Odpowiedź na: "${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}"\n\n`;
      // Tutaj możesz dodać logikę do ustawienia tekstu w input
      console.log('Reply to message:', messageId, replyPrefix);
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    console.log('React to message:', messageId, 'with emoji:', emoji);
    // Tutaj możesz dodać logikę do dodawania reakcji
  };

  const handleBack = () => {
    if (location.state?.fromContacts) {
      navigate('/contacts');
    } else if (location.state?.fromCalls) {
      navigate('/calls');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-white">Ładowanie...</div>
      </div>
    );
  }

  if (!currentConversationId || !currentConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <MessageCircle className="w-16 h-16 text-gray-400 mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-white mb-2">Wybierz konwersację</h3>
        <p className="text-gray-400 text-center px-4">
          Wybierz kontakt z listy znajomych aby rozpocząć czat
        </p>
        <Button
          onClick={handleBack}
          className="mt-4 bg-blue-500 hover:bg-blue-600"
        >
          Powrót
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {conversationName.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div>
            <h1 className="text-lg font-semibold text-white">{conversationName}</h1>
            {contact && (
              <p className="text-sm text-gray-400">
                {contact.can_chat ? 'Online' : 'Oczekuje zaproszenia'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {contact?.can_chat && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                title="Połączenie głosowe"
              >
                <Phone className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                title="Połączenie wideo"
              >
                <Video className="w-5 h-5" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">Brak wiadomości</h3>
            <p className="text-gray-400">
              {contact?.can_chat 
                ? 'Rozpocznij konwersację wysyłając pierwszą wiadomość'
                : 'Oczekuje na zaakceptowanie zaproszenia do znajomych'
              }
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                currentUserId={user?.id || ''}
                onReply={handleReply}
                onReact={handleReact}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Chat Input */}
      <ChatInterface
        conversationId={currentConversationId}
        otherUserId={otherParticipant?.user_id}
        onSendMessage={handleSendMessage}
        disabled={loading}
      />
    </div>
  );
};

export default RealTimeChatInterface;
