
import React from 'react';
import UserStatusIndicator from './UserStatusIndicator';
import { useUserStatus } from '@/hooks/useUserStatus';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Users, MessageCircle } from 'lucide-react';

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
      sender_id?: string;
    };
  };
  isSelected: boolean;
  currentUserId: string;
  onClick: (conversationId: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  currentUserId,
  onClick
}) => {
  const { userStatuses } = useUserStatus();

  const getConversationDisplayName = () => {
    if (conversation.name) return conversation.name;
    if (conversation.type === 'group') return 'Grupa';
    
    const otherParticipant = conversation.participants?.find(
      p => p.user_id !== currentUserId
    );
    return otherParticipant?.profiles?.display_name || 'Nieznany użytkownik';
  };

  const getOtherParticipantStatus = () => {
    if (conversation.type === 'group') return null;
    
    const otherParticipant = conversation.participants?.find(
      p => p.user_id !== currentUserId
    );
    
    return otherParticipant ? userStatuses[otherParticipant.user_id] : null;
  };

  const formatLastMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: pl 
    });
  };

  const truncateMessage = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const otherParticipantStatus = getOtherParticipantStatus();

  return (
    <div
      onClick={() => onClick(conversation.id)}
      className={`p-4 cursor-pointer transition-colors border-b border-gray-700 hover:bg-gray-700/50 ${
        isSelected ? 'bg-blue-600/20 border-blue-500/30' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <div className="flex items-center space-x-2">
              {conversation.type === 'group' ? (
                <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <h3 className="font-semibold text-white truncate">
                {getConversationDisplayName()}
              </h3>
            </div>
            {otherParticipantStatus && (
              <UserStatusIndicator status={otherParticipantStatus} size="sm" />
            )}
          </div>
          
          {conversation.last_message && (
            <div className="space-y-1">
              <p className="text-sm text-gray-400 truncate">
                {conversation.last_message.sender_id === currentUserId 
                  ? 'Ty: ' 
                  : `${conversation.participants?.find(p => p.user_id === conversation.last_message?.sender_id)?.profiles?.display_name || 'Ktoś'}: `
                }
                {truncateMessage(conversation.last_message.content)}
              </p>
              <p className="text-xs text-gray-500">
                {formatLastMessageTime(conversation.last_message.created_at)}
              </p>
            </div>
          )}
          
          {!conversation.last_message && (
            <p className="text-sm text-gray-500 italic">
              Brak wiadomości
            </p>
          )}
        </div>
        
        {conversation.type === 'group' && (
          <div className="text-xs text-gray-500 ml-2">
            {conversation.participants?.length || 0} członków
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationItem;
