
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MoreVertical, 
  Search, 
  Shield, 
  Clock,
  Check,
  CheckCheck,
  ArrowLeft,
  Menu,
  Plus,
  Phone,
  Video
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
  const { user, signOut } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Mobile: Show chat list when no chat selected, or chat when selected
  const isMobile = window.innerWidth < 768;

  if (isMobile && !selectedChat) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-lg border-b border-white/10">
          <h1 className="text-xl font-bold text-white">SecureChat</h1>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" className="text-white">
              <Search className="w-5 h-5" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white"
              onClick={signOut}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <Input
            placeholder="Szukaj rozmów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className="p-4 border-b border-white/10 active:bg-white/10 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {chat.name.charAt(0)}
                  </div>
                  <div className="flex-1">
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
                    <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isMobile && selectedChat) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
        {/* Mobile Chat Header */}
        <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              className="text-white"
              onClick={() => setSelectedChat(null)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {selectedChat.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-white font-semibold">{selectedChat.name}</h3>
              <div className="flex items-center gap-1 text-xs">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Encrypted</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" className="text-white">
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white">
              <Video className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  message.sender_id === user?.id
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white/10 text-white rounded-bl-md'
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

        {/* Message Input */}
        <div className="p-4 bg-black/40 backdrop-blur-lg border-t border-white/10">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-white">
              <Plus className="w-4 h-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Wiadomość..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-full"
            />
            {newMessage.trim() ? (
              <Button 
                onClick={sendMessage}
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="sm" variant="ghost" className="text-white rounded-full w-10 h-10 p-0">
                <Mic className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Desktop Sidebar */}
      <div className="w-80 border-r border-white/20 bg-black/40 backdrop-blur-lg flex flex-col">
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">SecureChat</h2>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="ghost" className="text-white">
                <Search className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-white">
                <Plus className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-white"
                onClick={signOut}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Input
            placeholder="Szukaj rozmów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {chat.name.charAt(0)}
                  </div>
                  <div className="flex-1">
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
                    <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Desktop Chat Header */}
            <div className="p-4 border-b border-white/20 bg-black/40 backdrop-blur-lg">
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
                      <span className="text-green-400">End-to-end encrypted</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" className="text-white">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-2xl ${
                      message.sender_id === user?.id
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white/10 text-white rounded-bl-md'
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

            {/* Desktop Message Input */}
            <div className="p-4 border-t border-white/20 bg-black/40 backdrop-blur-lg">
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
