
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Users } from 'lucide-react';

interface ChatHeaderProps {
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
  };
  currentUserId: string;
  showBackButton: boolean;
  onBack: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  currentUserId,
  showBackButton,
  onBack
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

  const getSubtitle = () => {
    if (conversation.type === 'group') {
      return `${conversation.participants?.length || 0} członków`;
    }
    return 'Online';
  };

  return (
    <div className="p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/10 mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {conversation.type === 'group' ? (
              <Users className="w-5 h-5 text-white" />
            ) : (
              <span className="text-white font-bold">{getInitial()}</span>
            )}
          </div>
          <div>
            <h3 className="font-medium text-white">{getDisplayName()}</h3>
            <p className="text-sm text-gray-400">{getSubtitle()}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/10"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
