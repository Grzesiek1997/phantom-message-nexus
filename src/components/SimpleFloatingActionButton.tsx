import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, MessageCircle, Users, Search, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleFloatingActionButtonProps {
  onNewChat: () => void;
  onGroupChat: () => void;
  onSearchChats: () => void;
  onAddContacts: () => void;
  className?: string;
}

const SimpleFloatingActionButton: React.FC<SimpleFloatingActionButtonProps> = ({
  onNewChat,
  onGroupChat,
  onSearchChats,
  onAddContacts,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    console.log('🔘 FAB toggled:', !isOpen);
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void, actionName: string) => {
    console.log(`🎯 FAB action triggered: ${actionName}`);
    action();
    setIsOpen(false);
  };

  const actions = [
    {
      id: 'new-chat',
      label: 'Nowy chat',
      icon: MessageCircle,
      onClick: () => handleAction(onNewChat, 'New Chat'),
      className: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'group-chat', 
      label: 'Chat grupowy',
      icon: Users,
      onClick: () => handleAction(onGroupChat, 'Group Chat'),
      className: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'search',
      label: 'Wyszukaj',
      icon: Search,
      onClick: () => handleAction(onSearchChats, 'Search'),
      className: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'add-contacts',
      label: 'Dodaj kontakty',
      icon: UserPlus,
      onClick: () => handleAction(onAddContacts, 'Add Contacts'),
      className: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Action Buttons */}
      <div 
        className={cn(
          "flex flex-col items-end space-y-3 mb-4 transition-all duration-200",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <div key={action.id} className="flex items-center space-x-3">
              {/* Label */}
              <div className="bg-gray-900/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-white/10 whitespace-nowrap">
                {action.label}
              </div>
              
              {/* Button */}
              <Button
                onClick={action.onClick}
                className={cn(
                  "w-12 h-12 rounded-full shadow-lg text-white border-2 border-white/20 transition-all duration-200 hover:scale-105 hover:border-white/40",
                  action.className
                )}
                size="icon"
              >
                <IconComponent className="w-5 h-5" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main Button */}
      <Button
        onClick={toggleOpen}
        className={cn(
          "w-16 h-16 rounded-full shadow-2xl border-2 border-white/20 transition-all duration-200 hover:scale-105 hover:border-white/40",
          "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        )}
        size="icon"
      >
        <div className={cn("transition-transform duration-200", isOpen ? "rotate-45" : "rotate-0")}>
          {isOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <Plus className="w-7 h-7 text-white" />
          )}
        </div>
      </Button>
    </div>
  );
};

export default SimpleFloatingActionButton;