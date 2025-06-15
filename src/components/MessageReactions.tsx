
import React from 'react';
import { MessageReaction } from '@/hooks/useMessageReactions';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onToggleReaction: (reactionType: string) => void;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  onToggleReaction
}) => {
  const { user } = useAuth();

  // Group reactions by type
  const reactionGroups = reactions.reduce((groups, reaction) => {
    if (!groups[reaction.reaction_type]) {
      groups[reaction.reaction_type] = [];
    }
    groups[reaction.reaction_type].push(reaction);
    return groups;
  }, {} as Record<string, MessageReaction[]>);

  if (Object.keys(reactionGroups).length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {Object.entries(reactionGroups).map(([reactionType, reactionList]) => {
        const hasUserReacted = reactionList.some(r => r.user_id === user?.id);
        const count = reactionList.length;

        return (
          <Button
            key={reactionType}
            variant="ghost"
            size="sm"
            onClick={() => onToggleReaction(reactionType)}
            className={`h-6 px-2 text-xs rounded-full transition-colors ${
              hasUserReacted 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="mr-1">{reactionType}</span>
            <span>{count}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default MessageReactions;
