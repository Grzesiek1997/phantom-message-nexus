
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Settings, MessageCircle, Users, Bot, Send, Paperclip, Smile } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import ContactSearch from './ContactSearch';
import AIAssistant from './AIAssistant';

const RealTimeChatInterface: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);

  const { user } = useAuth();
  const { messages, conversations, loading, sendMessage, createConversation } = useMessages(selectedConversationId || undefined);
  const { contacts } = useContacts();
  const { toast } = useToast();

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
      await sendMessage(messageInput, selectedConversationId, 24);
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

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Conversations List */}
      <div className={`${
        isMobile ? (showConversationList ? 'flex' : 'hidden') : 'flex'
      } flex-col w-full md:w-80 bg-black/20 backdrop-blur-sm border-r border-white/10`}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Czaty</h2>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAIAssistant(true)}
                className="text-white hover:bg-white/10"
                title="AI Asystent"
              >
                <Bot className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowContactSearch(true)}
                className="text-white hover:bg-white/10"
                title="Dodaj kontakt"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Szukaj czatów..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Ładowanie...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Brak konwersacji</p>
              <p className="text-sm">Dodaj kontakt, aby rozpocząć czat</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
                className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
                  selectedConversationId === conversation.id 
                    ? 'bg-blue-500/20' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {conversation.name?.charAt(0).toUpperCase() || 
                       conversation.participants?.find(p => p.user_id !== user?.id)?.profiles?.display_name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white truncate">
                        {conversation.name || 
                         conversation.participants?.find(p => p.user_id !== user?.id)?.profiles?.display_name || 
                         'Nieznany użytkownik'}
                      </h3>
                      {conversation.last_message && (
                        <span className="text-xs text-gray-400">
                          {format(new Date(conversation.last_message.created_at), 'HH:mm', { locale: pl })}
                        </span>
                      )}
                    </div>
                    {conversation.last_message && (
                      <p className="text-sm text-gray-400 truncate">
                        {conversation.last_message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${
        isMobile ? (showConversationList ? 'hidden' : 'flex') : 'flex'
      } flex-1 flex-col`}>
        
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isMobile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleBackToConversations}
                      className="text-white hover:bg-white/10 mr-2"
                    >
                      ←
                    </Button>
                  )}
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {selectedConversation.name?.charAt(0).toUpperCase() || 
                       selectedConversation.participants?.find(p => p.user_id !== user?.id)?.profiles?.display_name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {selectedConversation.name || 
                       selectedConversation.participants?.find(p => p.user_id !== user?.id)?.profiles?.display_name || 
                       'Nieznany użytkownik'}
                    </h3>
                    <p className="text-sm text-gray-400">Online</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(new Date(message.created_at), 'HH:mm', { locale: pl })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Napisz wiadomość..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
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
    </div>
  );
};

export default RealTimeChatInterface;
