
import React from 'react';
import { Message } from '@/types/chat';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import MessageReactions from './MessageReactions';
import ReactionPicker from './ReactionPicker';
import UserStatusIndicator from './UserStatusIndicator';
import { useUserStatus } from '@/hooks/useUserStatus';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
  onReply,
  onReact
}) => {
  const isOwn = message.sender_id === currentUserId;
  const { reactions, toggleReaction } = useMessageReactions([message.id]);
  const { userStatuses } = useUserStatus();
  const messageReactions = reactions[message.id] || [];
  const senderStatus = userStatuses[message.sender_id];

  const handleReactionSelect = (reactionType: string) => {
    toggleReaction(message.id, reactionType);
    if (onReact) {
      onReact(message.id, reactionType);
    }
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: pl 
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-700 text-white'
      } relative`}>
        {!isOwn && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-semibold text-blue-400">
              {message.sender?.display_name || message.sender?.username || 'Unknown'}
            </span>
            <UserStatusIndicator status={senderStatus} size="sm" />
          </div>
        )}
        
        <div className="break-words">
          {message.content}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs opacity-70">
            {formatTime(message.created_at)}
          </span>
          
          <div className="flex items-center space-x-1">
            {onReply && (
              <button
                onClick={() => onReply(message.id)}
                className="text-xs text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Odpowiedz
              </button>
            )}
            
            <ReactionPicker onReactionSelect={handleReactionSelect} />
          </div>
        </div>

        {message.expires_at && (
          <div className="text-xs text-yellow-400 mt-1 flex items-center">
            ⏰ Wygasa {formatTime(message.expires_at)}
          </div>
        )}

        <MessageReactions 
          reactions={messageReactions}
          onToggleReaction={handleReactionSelect}
        />
      </div>
    </div>
  );
};

export default MessageBubble;
