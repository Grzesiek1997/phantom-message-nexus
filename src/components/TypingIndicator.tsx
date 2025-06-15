
import React from 'react';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';

interface TypingIndicatorProps {
  conversationId: string;
  userProfiles?: Record<string, { display_name: string; username: string }>;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  conversationId, 
  userProfiles = {} 
}) => {
  const { typingUsers } = useTypingIndicator(conversationId);
  
  const typingUserList = Object.values(typingUsers);
  
  if (typingUserList.length === 0) {
    return null;
  }

  const getTypingMessage = () => {
    if (typingUserList.length === 1) {
      const user = userProfiles[typingUserList[0].user_id];
      const name = user?.display_name || user?.username || 'Ktoś';
      return `${name} pisze...`;
    } else if (typingUserList.length === 2) {
      const user1 = userProfiles[typingUserList[0].user_id];
      const user2 = userProfiles[typingUserList[1].user_id];
      const name1 = user1?.display_name || user1?.username || 'Ktoś';
      const name2 = user2?.display_name || user2?.username || 'Ktoś';
      return `${name1} i ${name2} piszą...`;
    } else {
      return `${typingUserList.length} osób pisze...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 px-4 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getTypingMessage()}</span>
    </div>
  );
};

export default TypingIndicator;
