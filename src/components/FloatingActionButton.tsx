
import React, { useState } from 'react';
import { Plus, Search, MessageCircle, Users, UserPlus, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const menuItems = [
    {
      icon: Search,
      label: t('searchChats'),
      action: onSearchChats,
      color: 'bg-blue-500',
      delay: 'delay-100'
    },
    {
      icon: MessageCircle,
      label: t('newChat'),
      action: onNewChat,
      color: 'bg-green-500',
      delay: 'delay-200'
    },
    {
      icon: Users,
      label: t('groupChat'),
      action: onGroupChat,
      color: 'bg-purple-500',
      delay: 'delay-300'
    },
    {
      icon: UserPlus,
      label: t('addContacts'),
      action: onAddContacts,
      color: 'bg-orange-500',
      delay: 'delay-400'
    }
  ];

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Menu Items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`transform transition-all duration-300 ${item.delay} ${
                  isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-0'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                  <button
                    onClick={() => handleMenuItemClick(item.action)}
                    className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ${
          isOpen ? 'rotate-45 scale-110' : 'rotate-0 scale-100'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FloatingActionButton;
