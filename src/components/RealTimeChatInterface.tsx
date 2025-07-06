
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  message: string;
  username: string;
  avatar: string;
  display_name: string;
  timestamp: string;
}

const RealTimeChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [usersOnline, setUsersOnline] = useState<string[]>([]);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLSpanElement>(null);

  // Konfiguracja realtime
  useEffect(() => {
    if (!user) {
      setUsersOnline([]);
      return;
    }

    console.log('🔗 Konfiguracja realtime chat dla użytkownika:', user.id);

    const roomOne = supabase
      .channel('room-one')
      .on('broadcast', { event: 'message' }, (payload) => {
        console.log('📨 Otrzymano wiadomość:', payload.payload);
        setMessages(prev => [...prev, payload.payload]);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = roomOne.presenceState();
        const onlineUsers = Object.keys(state);
        console.log('👥 Users online sync:', onlineUsers);
        setUsersOnline(onlineUsers);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        console.log('📡 Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          const presenceTrackStatus = await roomOne.track({
            id: user.id,
            username: user.email || 'unknown',
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
            avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
          });
          console.log('👤 Presence track status:', presenceTrackStatus);
        }
      });

    return () => {
      console.log('🧹 Cleaning up realtime subscription');
      roomOne.unsubscribe();
    };
  }, [user]);

  // Wysyłanie wiadomości
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    console.log('📤 Wysyłanie wiadomości:', newMessage);

    const messagePayload = {
      message: newMessage,
      username: user.email || 'unknown',
      display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
      avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      timestamp: new Date().toISOString()
    };

    await supabase.channel('room-one').send({
      type: 'broadcast',
      event: 'message',
      payload: messagePayload
    });

    setNewMessage('');
  };

  // Formatowanie czasu
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('pl-PL', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  };

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  }, [messages]);

  const getAvatarFallback = (message: Message) => {
    return message.display_name?.charAt(0) || message.username?.charAt(0) || '?';
  };

  const isMyMessage = (message: Message) => {
    return message.username === user?.email;
  };

  return (
    <div className="flex w-full h-full justify-center items-center p-4">
      <div className="border border-border max-w-6xl w-full min-h-[600px] h-full rounded-lg glass-dark overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between h-20 border-b border-border p-4 text-foreground bg-card/50">
          <div>
            <p className="font-medium">Chat publiczny</p>
            <p className="text-muted-foreground italic text-sm">
              {usersOnline.length} {usersOnline.length === 1 ? 'użytkownik online' : 'użytkowników online'}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Zalogowany jako {user?.user_metadata?.display_name || user?.email?.split('@')[0]}
          </div>
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="p-4 flex flex-col overflow-y-auto flex-1 space-y-4 scrollbar-hide"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">🎉 Witaj w czacie publicznym!</p>
                <p>Napisz coś, aby rozpocząć rozmowę</p>
              </div>
            </div>
          ) : (
            messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex w-full items-start space-x-3 animate-fadeInUp ${
                  isMyMessage(message) ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Avatar for others */}
                {!isMyMessage(message) && (
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={message.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      {getAvatarFallback(message)}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Message container */}
                <div className={`flex flex-col max-w-[70%] ${isMyMessage(message) ? 'items-end' : 'items-start'}`}>
                  {/* Username */}
                  {!isMyMessage(message) && (
                    <p className="text-xs text-muted-foreground mb-1 px-2">
                      {message.display_name}
                    </p>
                  )}
                  
                  {/* Message bubble */}
                  <div
                    className={`message-bubble ${
                      isMyMessage(message) 
                        ? 'message-sent' 
                        : 'message-received'
                    }`}
                  >
                    {message.message}
                  </div>
                  
                  {/* Timestamp */}
                  <p className="text-xs text-muted-foreground mt-1 px-2">
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {/* Avatar for current user */}
                {isMyMessage(message) && (
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={message.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      {getAvatarFallback(message)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <span ref={scrollRef}></span>
        </div>

        {/* Message Input */}
        <form
          onSubmit={sendMessage}
          className="flex flex-col sm:flex-row p-4 border-t border-border bg-card/30 gap-4"
        >
          <Input
            type="text"
            placeholder="Napisz wiadomość..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-primary-foreground font-medium px-6"
          >
            Wyślij
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RealTimeChatInterface;
