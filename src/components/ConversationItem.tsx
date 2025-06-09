
import React from 'react';
import { MessageCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface ConversationItemProps {
  conversation: {
    id: string;
    name: string | null;
    type: 'direct' | 'group';
    participants?: Array<{
      user_id: string;
      profiles: {
        display_name: string;
      };
    }>;
    last_message?: {
      content: string;
      created_at: string;
    };
  };
  currentUserId: string;
  isSelected: boolean;
  onClick: (conversationId: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  currentUserId,
  isSelected,
  onClick
}) => {
  const getDisplayName = () => {
    if (conversation.name) return conversation.name;
    if (conversation.type === 'group') return 'Grupa';
    
    const otherParticipant = conversation.participants?.find(
      p => p.user_id !== currentUserId
    );
    return otherParticipant?.profiles?.display_name || 'Nieznany użytkownik';
  };

  const getInitial = () => {
    const displayName = getDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <div
      onClick={() => onClick(conversation.id)}
      className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-500/20' : 'hover:bg-white/5'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          {conversation.type === 'group' ? (
            <Users className="w-6 h-6 text-white" />
          ) : (
            <span className="text-white font-bold">{getInitial()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white truncate">
              {getDisplayName()}
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
  );
};

export default ConversationItem;
