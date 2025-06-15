
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Bot, Users, MessageCircle } from 'lucide-react';
import ConversationItem from './ConversationItem';

interface ConversationListProps {
  conversations: Array<{
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
  }>;
  selectedConversationId: string | null;
  currentUserId: string;
  loading: boolean;
  isVisible: boolean;
  onSelectConversation: (conversationId: string) => void;
  onShowContactSearch: () => void;
  onShowAIAssistant: () => void;
  onShowGroupManagement: () => void;
  onSearchChats: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  currentUserId,
  loading,
  isVisible,
  onSelectConversation,
  onShowContactSearch,
  onShowAIAssistant,
  onShowGroupManagement,
  onSearchChats
}) => {
  return (
    <div className={`${
      isVisible ? 'flex' : 'hidden'
    } flex-col w-full md:w-80 bg-black/20 backdrop-blur-sm border-r border-white/10`}>
      
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Czaty</h2>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onShowAIAssistant}
              className="text-white hover:bg-white/10"
              title="AI Asystent"
            >
              <Bot className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onShowGroupManagement}
              className="text-white hover:bg-white/10"
              title="Utwórz grupę"
            >
              <Users className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onShowContactSearch}
              className="text-white hover:bg-white/10"
              title="Dodaj kontakt"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Szukaj czatów..."
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            onClick={onSearchChats}
            readOnly
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">Ładowanie...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Brak konwersacji</p>
            <p className="text-sm">Dodaj kontakt, aby rozpocząć czat</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              currentUserId={currentUserId}
              isSelected={selectedConversationId === conversation.id}
              onClick={onSelectConversation}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
