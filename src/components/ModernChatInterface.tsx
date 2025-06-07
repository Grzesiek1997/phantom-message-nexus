
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MoreVertical, 
  Search, 
  Shield, 
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isEncrypted: boolean;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

const ModernChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chats] = useState<Chat[]>([
    {
      id: '1',
      name: 'SecureChat Team',
      lastMessage: 'Witaj w SecureChat! 🛡️',
      timestamp: new Date(),
      unreadCount: 1,
      isOnline: true
    },
    {
      id: '2',
      name: 'Anna Kowalska',
      lastMessage: 'Świetnie, że używasz bezpiecznego komunikatora!',
      timestamp: new Date(Date.now() - 300000),
      unreadCount: 0,
      isOnline: false
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
      loadMessages(chats[0].id);
    }
  }, [chats, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = (chatId: string) => {
    // Symulacja wiadomości
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Witaj w SecureChat! 🛡️ Twoje wiadomości są chronione szyfrowaniem end-to-end.',
        sender_id: 'system',
        sender_name: 'SecureChat',
        timestamp: new Date(Date.now() - 600000),
        status: 'read',
        isEncrypted: true
      },
      {
        id: '2',
        content: 'Wszystkie funkcje bezpieczeństwa zostały aktywowane automatycznie.',
        sender_id: 'system',
        sender_name: 'SecureChat',
        timestamp: new Date(Date.now() - 300000),
        status: 'read',
        isEncrypted: true
      }
    ];
    setMessages(mockMessages);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender_id: user.id,
      sender_name: user.user_metadata?.username || 'You',
      timestamp: new Date(),
      status: 'sending',
      isEncrypted: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Symulacja wysyłania
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Sidebar z listą chatów */}
      <div className="w-80 border-r border-white/20 bg-black/40">
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Chats</h2>
            <Button size="sm" variant="ghost" className="text-white">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <Input
            placeholder="Szukaj rozmów..."
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        
        <div className="overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat);
                loadMessages(chat.id);
              }}
              className={`p-4 border-b border-white/10 cursor-pointer transition-colors ${
                selectedChat?.id === chat.id
                  ? 'bg-blue-600/30'
                  : 'hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {chat.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{chat.name}</span>
                      {chat.isOnline && (
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      {chat.lastMessage}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {chat.unreadCount > 0 && (
                    <Badge className="bg-blue-600 text-white text-xs mt-1">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Główny obszar chatu */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header chatu */}
            <div className="p-4 border-b border-white/20 bg-black/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedChat.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedChat.name}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      {selectedChat.isOnline ? (
                        <span className="text-green-400">Online</span>
                      ) : (
                        <span className="text-gray-400">Last seen recently</span>
                      )}
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Encrypted</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Obszar wiadomości */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {message.isEncrypted && (
                        <Shield className="w-3 h-3 text-green-400" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.sender_id === user?.id && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input do wysyłania wiadomości */}
            <div className="p-4 border-t border-white/20 bg-black/40">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-white">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Napisz wiadomość..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button size="sm" variant="ghost" className="text-white">
                  <Mic className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={sendMessage}
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">SecureChat</h3>
              <p className="text-gray-300">Wybierz rozmowę aby rozpocząć bezpieczną komunikację</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernChatInterface;
