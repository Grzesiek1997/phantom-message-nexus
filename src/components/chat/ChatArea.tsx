
import React from 'react';
import ChatHeader from '../ChatHeader';
import MessageBubble from '../MessageBubble';
import MessageInput from '../MessageInput';

interface ChatAreaProps {
  conversation: any;
  messages: any[];
  currentUserId: string;
  showBackButton: boolean;
  messageInput: string;
  replyingTo: string | null;
  replyingToMessage: any;
  onBack: () => void;
  onReply: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onCancelReply: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  currentUserId,
  showBackButton,
  messageInput,
  replyingTo,
  replyingToMessage,
  onBack,
  onReply,
  onReact,
  onMessageChange,
  onSendMessage,
  onCancelReply
}) => {
  return (
    <>
      <ChatHeader
        conversation={conversation}
        currentUserId={currentUserId}
        showBackButton={showBackButton}
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            onReply={onReply}
            onReact={onReact}
          />
        ))}
      </div>

      <MessageInput
        messageInput={messageInput}
        replyingTo={replyingTo}
        replyingToMessage={replyingToMessage}
        onMessageChange={onMessageChange}
        onSendMessage={onSendMessage}
        onCancelReply={onCancelReply}
      />
    </>
  );
};

export default ChatArea;
