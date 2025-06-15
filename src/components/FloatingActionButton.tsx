
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, Users, Search, UserPlus } from 'lucide-react';

interface FloatingActionButtonProps {
  onNewChat: () => void;
  onGroupChat: () => void;
  onSearchChats: () => void;
  onAddContacts: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onNewChat,
  onGroupChat,
  onSearchChats,
  onAddContacts
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="flex flex-col items-end space-y-2">
        {isExpanded && (
          <>
            <Button
              onClick={onAddContacts}
              className="bg-green-500 hover:bg-green-600 text-white shadow-lg"
              size="sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Dodaj kontakty
            </Button>
            <Button
              onClick={onSearchChats}
              className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg"
              size="sm"
            >
              <Search className="w-4 h-4 mr-2" />
              Szukaj czatów
            </Button>
            <Button
              onClick={onGroupChat}
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
              size="sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Grupa
            </Button>
            <Button
              onClick={onNewChat}
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Nowy czat
            </Button>
          </>
        )}
        
        <Button
          onClick={toggleExpanded}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-700 hover:to-purple-800 text-white rounded-full w-14 h-14 shadow-lg transform transition-transform duration-200 hover:scale-110"
        >
          <Plus className={`w-6 h-6 transition-transform duration-200 ${isExpanded ? 'rotate-45' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default FloatingActionButton;
