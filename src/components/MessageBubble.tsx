
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Reply, Smile, Heart, ThumbsUp, Laugh, Angry, MoreVertical } from 'lucide-react';
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
  const [showActions, setShowActions] = useState(false);
  
  const isOwnMessage = message.sender_id === currentUserId;
  
  const reactions = [
    { emoji: '❤️', icon: Heart },
    { emoji: '👍', icon: ThumbsUp },
    { emoji: '😂', icon: Laugh },
    { emoji: '😮', icon: Smile },
    { emoji: '😢', icon: Angry },
    { emoji: '😠', icon: Angry }
  ];

  const handleReaction = (emoji: string) => {
    onReact(message.id, emoji);
    setShowReactions(false);
  };

  // Parse reply content if it's a reply message
  const isReplyMessage = message.content.startsWith('↩️ Odpowiedź na:');
  let displayContent = message.content;
  let replyContent = '';

  if (isReplyMessage) {
    const lines = message.content.split('\n\n');
    if (lines.length >= 2) {
      replyContent = lines[0].replace('↩️ Odpowiedź na: "', '').replace('"...', '');
      displayContent = lines.slice(1).join('\n\n');
    }
  }

  return (
    <div 
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} relative group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactions(false);
      }}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
          isOwnMessage
            ? 'bg-blue-500 text-white'
            : 'bg-white/10 text-white'
        }`}
      >
        {!isOwnMessage && message.sender && (
          <p className="text-xs font-semibold mb-1 opacity-70">
            {message.sender.display_name || message.sender.username}
          </p>
        )}

        {/* Reply preview */}
        {isReplyMessage && replyContent && (
          <div className={`mb-2 p-2 rounded text-xs ${
            isOwnMessage ? 'bg-blue-600/50' : 'bg-white/10'
          } border-l-2 border-gray-400`}>
            <p className="opacity-70">Odpowiedź na:</p>
            <p className="italic">"{replyContent}..."</p>
          </div>
        )}
        
        <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
        
        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
          <span>{format(new Date(message.created_at), 'HH:mm', { locale: pl })}</span>
        </div>

        {/* Quick action buttons */}
        {showActions && (
          <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex space-x-1 bg-gray-800 rounded-lg p-1 shadow-lg border border-gray-600 z-10`}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReply(message.id)}
              className="text-gray-300 hover:text-white p-1 h-auto"
              title="Odpowiedz"
            >
              <Reply className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowReactions(!showReactions)}
              className="text-gray-300 hover:text-white p-1 h-auto"
              title="Dodaj reakcję"
            >
              <Smile className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white p-1 h-auto"
              title="Więcej opcji"
            >
              <MoreVertical className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Reaction picker */}
        {showReactions && (
          <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full -translate-y-full' : 'right-0 translate-x-full -translate-y-full'} bg-gray-800 rounded-lg p-2 flex space-x-1 shadow-lg border border-gray-600 z-20`}>
            {reactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                size="sm"
                variant="ghost"
                onClick={() => handleReaction(reaction.emoji)}
                className="text-gray-300 hover:text-white p-1 h-auto text-lg hover:scale-110 transition-transform"
                title={`Dodaj ${reaction.emoji}`}
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
