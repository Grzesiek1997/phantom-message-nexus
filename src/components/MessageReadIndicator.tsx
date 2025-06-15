
import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { useMessageReadStatus } from '@/hooks/useMessageReadStatus';

interface MessageReadIndicatorProps {
  messageId: string;
  senderId: string;
  currentUserId: string;
  conversationParticipants?: string[];
}

const MessageReadIndicator: React.FC<MessageReadIndicatorProps> = ({
  messageId,
  senderId,
  currentUserId,
  conversationParticipants = []
}) => {
  const { readStatuses, isMessageRead } = useMessageReadStatus();
  
  // Only show read indicators for messages sent by current user
  if (senderId !== currentUserId) {
    return null;
  }

  const messageReadStatuses = readStatuses[messageId] || [];
  const otherParticipants = conversationParticipants.filter(id => id !== currentUserId);
  
  // Check if all other participants have read the message
  const allRead = otherParticipants.length > 0 && 
    otherParticipants.every(userId => isMessageRead(messageId, userId));
  
  // Check if any participant has read the message
  const someRead = messageReadStatuses.length > 0;

  if (allRead) {
    return (
      <div title="Przeczytane przez wszystkich">
        <CheckCheck className="w-4 h-4 text-blue-500" />
      </div>
    );
  } else if (someRead) {
    return (
      <div title="Dostarczone">
        <CheckCheck className="w-4 h-4 text-gray-400" />
      </div>
    );
  } else {
    return (
      <div title="Wysłane">
        <Check className="w-4 h-4 text-gray-400" />
      </div>
    );
  }
};

export default MessageReadIndicator;
