
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Reply, Smile, Heart, ThumbsUp, Laugh, Angry } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    sender?: {
      username: string;
      display_name: string;
    };
  };
  currentUserId: string;
  onReply: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  currentUserId, 
  onReply, 
  onReact 
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const isOwnMessage = message.sender_id === currentUserId;
  
  const reactions = [
    { emoji: '❤️', icon: Heart },
    { emoji: '👍', icon: ThumbsUp },
    { emoji: '😂', icon: Laugh },
    { emoji: '😮', icon: Smile },
    { emoji: '😢', icon: Angry },
    { emoji: '😠', icon: Angry }
  ];

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setShowReactions(true);
    }, 500);
    setPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleReaction = (emoji: string) => {
    onReact(message.id, emoji);
    setShowReactions(false);
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} relative`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
          isOwnMessage
            ? 'bg-blue-500 text-white'
            : 'bg-white/10 text-white'
        }`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        {!isOwnMessage && message.sender && (
          <p className="text-xs font-semibold mb-1 opacity-70">
            {message.sender.display_name || message.sender.username}
          </p>
        )}
        
        <p className="text-sm">{message.content}</p>
        
        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
          <span>{format(new Date(message.created_at), 'HH:mm', { locale: pl })}</span>
        </div>

        {/* Hover actions */}
        <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-gray-800 rounded-lg p-1`}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReply(message.id)}
            className="text-gray-300 hover:text-white p-1 h-auto"
          >
            <Reply className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowReactions(!showReactions)}
            className="text-gray-300 hover:text-white p-1 h-auto"
          >
            <Smile className="w-3 h-3" />
          </Button>
        </div>

        {/* Reaction picker */}
        {showReactions && (
          <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} bg-gray-800 rounded-lg p-2 flex space-x-1 shadow-lg border border-gray-600 z-10`}>
            {reactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                size="sm"
                variant="ghost"
                onClick={() => handleReaction(reaction.emoji)}
                className="text-gray-300 hover:text-white p-1 h-auto text-lg"
              >
                {reaction.emoji}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
