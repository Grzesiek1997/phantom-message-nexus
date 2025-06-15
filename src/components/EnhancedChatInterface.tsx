
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Reply, 
  Edit3, 
  Trash2, 
  Clock, 
  Shield, 
  Phone, 
  Video,
  MoreHorizontal,
  Timer,
  Lock
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useDisappearingMessages } from '@/hooks/useDisappearingMessages';
import { useCalls } from '@/hooks/useCalls';
import { useAuth } from '@/hooks/useAuth';
import { AttachmentUpload } from './AttachmentUpload';
import { CallInterface } from './CallInterface';
import { TypingIndicator } from './TypingIndicator';

interface EnhancedChatInterfaceProps {
  conversationId: string;
  conversationName?: string;
  isGroup?: boolean;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  conversationId,
  conversationName = 'Chat',
  isGroup = false
}) => {
  const { messages, loading, sendMessage, editMessage, deleteMessage } = useEnhancedMessages(conversationId);
  const { updateMessageTTL } = useDisappearingMessages();
  const { startCall } = useCalls();
  const { user } = useAuth();
  
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [showDisappearingSettings, setShowDisappearingSettings] = useState(false);
  const [disappearingTTL, setDisappearingTTL] = useState('0');
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !replyingTo) return;

    const autoDeleteAfter = disappearingTTL !== '0' ? parseInt(disappearingTTL) : undefined;

    try {
      await sendMessage(newMessage, {
        replyToId: replyingTo || undefined,
        autoDeleteAfter
      });
      
      setNewMessage('');
      setReplyingTo(null);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await editMessage(messageId, content);
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string, forEveryone: boolean = false) => {
    try {
      await deleteMessage(messageId, forEveryone);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleStartCall = async (type: 'voice' | 'video') => {
    try {
      await startCall(conversationId, type);
      setShowCallInterface(true);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    }
  };

  const getReplyToMessage = (messageId: string) => {
    return messages.find(m => m.id === messageId);
  };

  const ttlOptions = [
    { value: '0', label: 'Wyłączone' },
    { value: '30', label: '30 sekund' },
    { value: '300', label: '5 minut' },
    { value: '3600', label: '1 godzina' },
    { value: '86400', label: '24 godziny' },
    { value: '604800', label: '7 dni' }
  ];

  if (showCallInterface) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-white/10">
          <Button
            onClick={() => setShowCallInterface(false)}
            variant="outline"
            size="sm"
          >
            ← Powrót do czatu
          </Button>
        </div>
        <div className="flex-1 p-4">
          <CallInterface conversationId={conversationId} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {conversationName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-white">{conversationName}</h2>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                <Shield className="w-3 h-3" />
                <span className="text-xs font-medium">E2E</span>
              </div>
              {disappearingTTL !== '0' && (
                <div className="flex items-center space-x-1 text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">
                  <Timer className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {ttlOptions.find(opt => opt.value === disappearingTTL)?.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStartCall('voice')}
            className="text-gray-400 hover:text-white"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStartCall('video')}
            className="text-gray-400 hover:text-white"
          >
            <Video className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass border-white/20">
              <DropdownMenuItem onClick={() => setShowDisappearingSettings(true)}>
                <Timer className="w-4 h-4 mr-2" />
                Znikające wiadomości
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowCallInterface(true)}>
                <Phone className="w-4 h-4 mr-2" />
                Panel połączeń
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-400">Ładowanie wiadomości...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Rozmowa jest zabezpieczona szyfrowanie end-to-end</p>
            <p className="text-sm">Wyślij pierwszą wiadomość aby rozpocząć</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${
                message.sender_id === user?.id 
                  ? 'message-bubble message-sent' 
                  : 'message-bubble message-received'
              }`}>
                {/* Reply indicator */}
                {message.reply_to_id && (
                  <div className="mb-2 p-2 bg-black/20 rounded border-l-2 border-blue-500">
                    <p className="text-xs text-gray-400">
                      Odpowiedź na: {getReplyToMessage(message.reply_to_id)?.sender?.display_name || 'Nieznany'}
                    </p>
                    <p className="text-xs text-gray-300 truncate">
                      {getReplyToMessage(message.reply_to_id)?.content || 'Wiadomość niedostępna'}
                    </p>
                  </div>
                )}

                {/* Sender name for group chats */}
                {isGroup && message.sender_id !== user?.id && (
                  <p className="text-xs font-semibold mb-1 opacity-70">
                    {message.sender?.display_name || message.sender?.username}
                  </p>
                )}

                {/* Message content */}
                {editingMessage === message.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="bg-white/10 border-white/20 text-white text-sm"
                      rows={2}
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleEditMessage(message.id, editContent)}
                        className="text-xs"
                      >
                        Zapisz
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingMessage(null);
                          setEditContent('');
                        }}
                        className="text-xs"
                      >
                        Anuluj
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment: any) => (
                          <div key={attachment.id} className="text-xs bg-white/10 rounded p-2">
                            📎 {attachment.file_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Message metadata */}
                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                  <div className="flex items-center space-x-2">
                    <span>{formatTimestamp(message.created_at)}</span>
                    {message.is_edited && (
                      <span className="text-gray-400">(edytowane)</span>
                    )}
                    {message.expires_at && (
                      <div className="flex items-center space-x-1 text-orange-400">
                        <Clock className="w-3 h-3" />
                        <span>Auto-usuń</span>
                      </div>
                    )}
                  </div>

                  {/* Message actions */}
                  {message.sender_id === user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-50 hover:opacity-100">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass border-white/20">
                        <DropdownMenuItem onClick={() => setReplyingTo(message.id)}>
                          <Reply className="w-3 h-3 mr-2" />
                          Odpowiedz
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setEditingMessage(message.id);
                          setEditContent(message.content);
                        }}>
                          <Edit3 className="w-3 h-3 mr-2" />
                          Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setMessageToDelete(message.id)}
                          className="text-red-400"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Usuń
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        <TypingIndicator conversationId={conversationId} />
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-blue-500/10 border-t border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400">
                Odpowiadasz na: {getReplyToMessage(replyingTo)?.sender?.display_name || 'wiadomość'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
              className="text-blue-400 hover:text-blue-300"
            >
              ✕
            </Button>
          </div>
          <p className="text-xs text-gray-300 truncate mt-1">
            {getReplyToMessage(replyingTo)?.content}
          </p>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Napisz zabezpieczoną wiadomość..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <div className="flex items-end space-x-1">
            <AttachmentUpload 
              messageId=""
              disabled={!newMessage.trim() && !replyingTo}
            />
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={!newMessage.trim() && !replyingTo}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
        
        {disappearingTTL !== '0' && (
          <p className="text-xs text-orange-400 mt-2 text-center">
            🔥 Wiadomości znikają po {ttlOptions.find(opt => opt.value === disappearingTTL)?.label.toLowerCase()}
          </p>
        )}
      </div>

      {/* Disappearing Messages Settings Dialog */}
      <Dialog open={showDisappearingSettings} onOpenChange={setShowDisappearingSettings}>
        <DialogContent className="glass border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Znikające wiadomości</DialogTitle>
            <DialogDescription>
              Ustaw czas po którym wiadomości będą automatycznie usuwane
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={disappearingTTL} onValueChange={setDisappearingTTL}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ttlOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  await updateMessageTTL(conversationId, parseInt(disappearingTTL));
                  setShowDisappearingSettings(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Zapisz
              </Button>
              <Button
                onClick={() => setShowDisappearingSettings(false)}
                variant="outline"
                className="flex-1"
              >
                Anuluj
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Message Dialog */}
      <Dialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
        <DialogContent className="glass border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Usuń wiadomość</DialogTitle>
            <DialogDescription>
              Wybierz opcję usunięcia wiadomości
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => messageToDelete && handleDeleteMessage(messageToDelete, false)}
              variant="outline"
              className="w-full"
            >
              Usuń dla mnie
            </Button>
            <Button
              onClick={() => messageToDelete && handleDeleteMessage(messageToDelete, true)}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Usuń dla wszystkich
            </Button>
            <Button
              onClick={() => setMessageToDelete(null)}
              variant="ghost"
              className="w-full"
            >
              Anuluj
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedChatInterface;
