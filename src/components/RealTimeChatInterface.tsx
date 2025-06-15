
import React, { useState, useEffect } from 'react';
import ConversationList from './ConversationList';
import ChatInterface from './messaging/ChatInterface';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

const RealTimeChatInterface: React.FC = () => {
  const { user } = useAuth();
  const { conversations, loading } = useMessages();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Auto-select first conversation when conversations load
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  const handleAddContact = () => {
    // Symulujemy przejście do zakładki kontakty
    const bottomNav = document.querySelector('[data-tab="contacts"]') as HTMLButtonElement;
    if (bottomNav) {
      bottomNav.click();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Ładowanie czatów...</p>
        </div>
      </div>
    );
  }

  // Show empty state when no conversations
  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserPlus className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Brak konwersacji</h2>
          <p className="text-gray-300 mb-6">Dodaj kontakt, aby rozpocząć czat</p>
          <Button
            onClick={handleAddContact}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-lg"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Przejdź do kontaktów
          </Button>
        </div>
      </div>
    );
  }

  // Mobile view - show either list or chat
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {selectedConversationId ? (
          <ChatInterface
            conversationId={selectedConversationId}
            onBack={handleBackToList}
          />
        ) : (
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            currentUserId={user?.id || ''}
            loading={loading}
            onConversationSelect={handleConversationSelect}
            onDeleteConversation={() => {}}
            onPinConversation={() => {}}
            onMuteConversation={() => {}}
            onMarkAsRead={() => {}}
            onArchiveConversation={() => {}}
          />
        )}
      </div>
    );
  }

  // Desktop view - side by side
  return (
    <div className="h-full flex bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="w-1/3 border-r border-white/10">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          currentUserId={user?.id || ''}
          loading={loading}
          onConversationSelect={handleConversationSelect}
          onDeleteConversation={() => {}}
          onPinConversation={() => {}}
          onMuteConversation={() => {}}
          onMarkAsRead={() => {}}
          onArchiveConversation={() => {}}
        />
      </div>
      <div className="flex-1">
        {selectedConversationId ? (
          <ChatInterface
            conversationId={selectedConversationId}
            onBack={handleBackToList}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-xl font-semibold mb-2">Wybierz rozmowę</h3>
              <p className="text-gray-300">Kliknij na rozmowę, aby rozpocząć czat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeChatInterface;
