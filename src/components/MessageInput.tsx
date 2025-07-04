
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X, Paperclip, Mic, MicOff } from 'lucide-react';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import FileUpload from './messaging/FileUpload';
import VoiceMessageSystem from './messaging/VoiceMessageSystem';

interface MessageInputProps {
  messageInput: string;
  replyingTo?: string | null;
  replyingToMessage?: { content: string };
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onSendFileMessage?: (fileUrl: string, fileName: string, fileType: string) => void;
  onSendVoiceMessage?: (audioUrl: string, duration: number) => void;
  onCancelReply?: () => void;
  conversationId?: string;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  messageInput,
  replyingTo,
  replyingToMessage,
  onMessageChange,
  onSendMessage,
  onSendFileMessage,
  onSendVoiceMessage,
  onCancelReply,
  conversationId,
  disabled = false
}) => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startTyping, stopTyping } = useTypingIndicator(conversationId);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onMessageChange(value);

    // Handle typing indicators
    if (value.trim() && conversationId) {
      startTyping();
      
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout to stop typing after 2 seconds of inactivity
      const newTimeout = setTimeout(() => {
        stopTyping();
      }, 2000);
      
      setTypingTimeout(newTimeout);
    } else if (conversationId) {
      stopTyping();
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
    }
  };

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      stopTyping();
    };
  }, [typingTimeout, stopTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageInput]);

  const handleFileUploaded = (fileUrl: string, fileName: string, fileType: string) => {
    if (onSendFileMessage) {
      onSendFileMessage(fileUrl, fileName, fileType);
    }
    setShowFileUpload(false);
  };

  const handleVoiceRecorded = (audioBlob: Blob, duration: number) => {
    // Convert blob to URL for now - in real implementation, upload to storage
    const audioUrl = URL.createObjectURL(audioBlob);
    if (onSendVoiceMessage) {
      onSendVoiceMessage(audioUrl, duration);
    }
    setShowVoiceRecorder(false);
  };

  return (
    <div className="border-t border-gray-700 p-4">
      {replyingTo && replyingToMessage && (
        <div className="mb-3 p-3 bg-gray-700/50 rounded-lg flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-blue-400 mb-1">Odpowiadasz na:</p>
            <p className="text-sm text-gray-300 truncate">
              {replyingToMessage.content}
            </p>
          </div>
          {onCancelReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="text-gray-400 hover:text-white ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        {/* File Upload Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFileUpload(true)}
          disabled={disabled}
          className="text-gray-400 hover:text-white"
          title="Dołącz plik"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        {/* Voice Recording Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowVoiceRecorder(true)}
          disabled={disabled}
          className="text-gray-400 hover:text-white"
          title="Nagraj wiadomość głosową"
        >
          <Mic className="w-4 h-4" />
        </Button>
        
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Napisz wiadomość..."
            disabled={disabled}
            className="min-h-[44px] max-h-32 resize-none bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
            rows={1}
          />
        </div>
        
        <Button
          onClick={onSendMessage}
          disabled={disabled || !messageInput.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && conversationId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <FileUpload
            conversationId={conversationId}
            onFileUploaded={handleFileUploaded}
            onClose={() => setShowFileUpload(false)}
          />
        </div>
      )}

      {/* Voice Recording Modal */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/20 rounded-lg p-6 max-w-md w-full">
            <VoiceMessageSystem
              onSendVoiceMessage={handleVoiceRecorded}
              className="w-full"
            />
            <Button
              onClick={() => setShowVoiceRecorder(false)}
              variant="outline"
              className="w-full mt-4 border-gray-600 text-white"
            >
              Anuluj
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
