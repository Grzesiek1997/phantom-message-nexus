
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Clock, Shield, Users, Settings, Search } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: Date;
  expiresAt?: Date;
  senderName?: string;
}

interface Contact {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp?: Date;
  unread?: number;
  online?: boolean;
}

/**
 * Main Chat Interface Component
 * Handles conversation display, message sending, and contact management
 * Features: End-to-end encryption, self-destructing messages, contact sidebar
 */
const ChatInterfaceMain: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How secure is this app?',
      sender: 'other',
      timestamp: new Date(Date.now() - 300000),
      senderName: 'Alice'
    },
    {
      id: '2',
      text: 'Completely end-to-end encrypted! Messages self-destruct too.',
      sender: 'me',
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: '3',
      text: 'That\'s amazing! Perfect for privacy.',
      sender: 'other',
      timestamp: new Date(Date.now() - 180000),
      senderName: 'Alice'
    }
  ]);

  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Alice',
      lastMessage: 'That\'s amazing! Perfect for privacy.',
      timestamp: new Date(Date.now() - 180000),
      unread: 0,
      online: true
    },
    {
      id: '2',
      name: 'Bob',
      lastMessage: 'Meeting at 3pm?',
      timestamp: new Date(Date.now() - 3600000),
      unread: 2,
      online: false
    },
    {
      id: '3',
      name: 'Carol',
      lastMessage: 'Thanks for the secure link!',
      timestamp: new Date(Date.now() - 7200000),
      unread: 0,
      online: true
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Scrolls the message container to the bottom
   * Used for auto-scrolling when new messages arrive
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handles sending a new message
   * Creates message object with timestamp and expiry
   * @param e - Form submission event
   */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'me',
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h expiry
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  /**
   * Formats time to HH:MM format
   * @param date - Date to format
   * @returns Formatted time string
   */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  /**
   * Formats last seen timestamp with relative time
   * @param date - Date to format
   * @returns Human readable time string (e.g., "5m ago", "2h ago")
   */
  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 5) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-[calc(100vh-200px)] max-w-6xl mx-auto gap-4">
      {/* Contacts Sidebar */}
      <Card className="w-80 glass border-white/20 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b border-white/10 cursor-pointer transition-colors ${
                selectedContact.id === contact.id ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {contact.name.charAt(0)}
                    </span>
                  </div>
                  {contact.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white truncate">{contact.name}</h3>
                    {contact.unread && contact.unread > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm truncate">{contact.lastMessage}</p>
                  <p className="text-gray-500 text-xs">
                    {contact.timestamp && formatLastSeen(contact.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-white/10">
          <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Users className="w-4 h-4 mr-2" />
            New Group
          </Button>
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 glass border-white/20 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {selectedContact.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-white">{selectedContact.name}</h2>
              <p className="text-sm text-gray-400">
                {selectedContact.online ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium">E2E Encrypted</span>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${
                message.sender === 'me' 
                  ? 'message-bubble message-sent' 
                  : 'message-bubble message-received'
              }`}>
                {message.sender === 'other' && message.senderName && (
                  <p className="text-xs font-semibold mb-1 opacity-70">
                    {message.senderName}
                  </p>
                )}
                <p className="text-sm">{message.text}</p>
                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                  <span>{formatTime(message.timestamp)}</span>
                  {message.expiresAt && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>24h</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a secure message..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            🔒 Messages are end-to-end encrypted and self-destruct after 24 hours
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterfaceMain;
