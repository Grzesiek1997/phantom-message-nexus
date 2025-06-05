
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Clock, Shield, Users, Settings, Search, Plus, LogOut, Wallet, Bot, ArrowLeft, Smile, Paperclip, Mic, Video, Phone, MoreVertical } from 'lucide-react';
import { useMessages, Message, Conversation } from '@/hooks/useMessages';
import { useContacts } from '@/hooks/useContacts';
import { useAuth } from '@/hooks/useAuth';
import { useAdvancedMessaging } from '@/hooks/useAdvancedMessaging';
import AIAssistant from './AIAssistant';

const RealTimeChatInterface: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user, signOut } = useAuth();
  const { messages, conversations, sendMessage, createConversation } = useMessages(selectedConversation?.id);
  const { contacts, searchUsers, addContact } = useContacts();
  const { 
    messagingFeatures, 
    callFeatures,
    sendDisappearingMessage,
    initiateVoiceCall,
    initiateVideoCall,
    shareFile,
    createSecretChat
  } = useAdvancedMessaging();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setIsTyping(true);
      await sendMessage(newMessage, selectedConversation.id, 24); // 24h expiry
      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartConversation = async (contactUserId: string) => {
    try {
      const conversationId = await createConversation([contactUserId]);
      if (conversationId) {
        const newConversation = conversations.find(c => c.id === conversationId);
        if (newConversation) {
          setSelectedConversation(newConversation);
        }
      }
      setShowContacts(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleVoiceCall = async () => {
    if (!selectedConversation) return;
    const otherParticipant = selectedConversation.participants.find(p => p.user_id !== user?.id);
    if (otherParticipant) {
      await initiateVoiceCall(otherParticipant.user_id);
    }
  };

  const handleVideoCall = async () => {
    if (!selectedConversation) return;
    const otherParticipant = selectedConversation.participants.find(p => p.user_id !== user?.id);
    if (otherParticipant) {
      await initiateVideoCall(otherParticipant.user_id);
    }
  };

  const handleFileShare = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await shareFile(file);
    }
  };

  const handleCreateSecretChat = async () => {
    if (!selectedConversation) return;
    const otherParticipant = selectedConversation.participants.find(p => p.user_id !== user?.id);
    if (otherParticipant) {
      const secretChatId = await createSecretChat(otherParticipant.user_id);
      console.log('Secret chat created:', secretChatId);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name || 'Czat grupowy';
    }
    
    const otherParticipant = conversation.participants.find(p => p.user_id !== user?.id);
    return otherParticipant?.profiles.display_name || 'Nieznany użytkownik';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name?.[0] || 'G';
    }
    
    const otherParticipant = conversation.participants.find(p => p.user_id !== user?.id);
    return otherParticipant?.profiles.display_name?.[0] || '?';
  };

  if (showContacts) {
    return (
      <div className="flex h-[calc(100vh-80px)] max-w-7xl mx-auto">
        <Card className="flex-1 glass border-white/20 flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center">
            <Button
              variant="ghost"
              onClick={() => setShowContacts(false)}
              className="text-white hover:bg-white/10 mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold text-white">📱 Kontakty</h2>
          </div>
          
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Szukaj kontaktów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleStartConversation(contact.contact_user_id)}
                className="p-4 hover:bg-white/5 cursor-pointer rounded-lg transition-colors mb-2"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {contact.profile.display_name[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{contact.profile.display_name}</h4>
                    <p className="text-sm text-gray-400">@{contact.profile.username}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] max-w-7xl mx-auto gap-4">
      {/* Conversations Sidebar */}
      <Card className="w-80 glass border-white/20 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">💬 Czaty</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => setShowContacts(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-400 hover:text-purple-300"
                onClick={() => setShowAI(!showAI)}
                title="AI Assistant"
              >
                <Bot className="w-4 h-4" />
              </Button>
              {user?.email === '97gibek@gmail.com' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-yellow-400 hover:text-yellow-300"
                  onClick={() => window.open('/?admin=true', '_blank')}
                  title="Panel Administracyjny"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Szukaj konwersacji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-white/10 cursor-pointer transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {getConversationAvatar(conversation)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">
                    {getConversationName(conversation)}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {conversation.last_message?.content || 'Brak wiadomości'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatTime(conversation.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col space-y-4">
          <Card className="flex-1 glass border-white/20 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {getConversationAvatar(selectedConversation)}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-white">
                    {getConversationName(selectedConversation)}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedConversation.participants.length} uczestników • Online
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs font-medium">Quantum E2E</span>
                </div>
                
                {/* Call buttons */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  onClick={handleVoiceCall}
                  title="Połączenie głosowe"
                >
                  <Phone className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  onClick={handleVideoCall}
                  title="Połączenie wideo"
                >
                  <Video className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  title="Wyślij pieniądze"
                >
                  <Wallet className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowChatSettings(!showChatSettings)}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Reply to message bar */}
            {replyingTo && (
              <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-8 bg-blue-500 rounded"></div>
                    <div>
                      <p className="text-xs text-gray-400">Odpowiadasz na:</p>
                      <p className="text-sm text-white truncate max-w-md">{replyingTo.content}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs lg:max-w-md group ${
                      message.sender_id === user?.id 
                        ? 'message-bubble message-sent' 
                        : 'message-bubble message-received'
                    }`}
                    onDoubleClick={() => setReplyingTo(message)}
                  >
                    {message.sender_id !== user?.id && message.sender && (
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {message.sender.display_name}
                      </p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{formatTime(message.created_at)}</span>
                      {message.expires_at && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>24h</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="message-bubble message-received">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/10">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileShare}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="💬 Wpisz bezpieczną wiadomość..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Mic className="w-4 h-4" />
                </Button>
                
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                🔒 Wiadomości są szyfrowane kwantowo i automatycznie usuwane po 24 godzinach
              </p>
            </div>
          </Card>

          {/* AI Assistant Panel */}
          {showAI && <AIAssistant />}
        </div>
      ) : (
        <Card className="flex-1 glass border-white/20 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">🚀 Wybierz konwersację</h3>
            <p className="text-gray-400 mb-4">Wybierz konwersację aby rozpocząć bezpieczny czat z quantum encryption</p>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowContacts(true)}
                className="bg-blue-900/20 border-blue-500/30 text-blue-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                💬 Nowy czat
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAI(!showAI)}
                className="bg-purple-900/20 border-purple-500/30 text-purple-300"
              >
                <Bot className="w-4 h-4 mr-2" />
                🤖 AI Assistant
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RealTimeChatInterface;
