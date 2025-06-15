
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  messageInput: string;
  replyingTo: string | null;
  replyingToMessage?: { content: string };
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onCancelReply: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  messageInput,
  replyingTo,
  replyingToMessage,
  onMessageChange,
  onSendMessage,
  onCancelReply
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', 
    '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛',
    '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '👐',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '💯', '🔥', '⭐', '✨', '💎', '🎉', '🎊', '🎈', '🎁', '🏆'
  ];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    onMessageChange(messageInput + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div>
      {/* Reply Preview */}
      {replyingTo && replyingToMessage && (
        <div className="px-4 py-2 bg-gray-800/50 border-t border-white/10">
          <div className="flex items-center justify-between bg-gray-700/50 rounded p-2">
            <div className="flex-1">
              <p className="text-xs text-gray-400">Odpowiadasz na:</p>
              <p className="text-sm text-white truncate">
                {replyingToMessage.content}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelReply}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="p-4 bg-gray-800/90 border-t border-white/10">
          <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto">
            {commonEmojis.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => handleEmojiClick(emoji)}
                className="text-xl hover:bg-white/10 h-8 w-8 p-0"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={messageInput}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Napisz wiadomość..."
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`text-white hover:bg-white/10 ${showEmojiPicker ? 'bg-white/10' : ''}`}
          >
            <Smile className="w-4 h-4" />
          </Button>
          <Button
            onClick={onSendMessage}
            disabled={!messageInput.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
