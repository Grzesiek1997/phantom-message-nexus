
import React from 'react';

interface ContactsTabNavigationProps {
  activeTab: 'friends' | 'received' | 'sent' | 'groups';
  onTabChange: (tab: 'friends' | 'received' | 'sent' | 'groups') => void;
  friendsCount: number;
  receivedCount: number;
  sentCount: number;
  groupsCount: number;
}

const ContactsTabNavigation: React.FC<ContactsTabNavigationProps> = ({
  activeTab,
  onTabChange,
  friendsCount,
  receivedCount,
  sentCount,
  groupsCount
}) => {
  return (
    <div className="px-6 py-2 border-b border-white/10">
      <div className="flex space-x-2">
        <button
          onClick={() => onTabChange('friends')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'friends'
              ? 'bg-white/20 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Znajomi ({friendsCount})
        </button>
        <button
          onClick={() => onTabChange('received')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'received'
              ? 'bg-white/20 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Otrzymane ({receivedCount})
        </button>
        <button
          onClick={() => onTabChange('sent')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'sent'
              ? 'bg-white/20 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Wysłane ({sentCount})
        </button>
        <button
          onClick={() => onTabChange('groups')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'groups'
              ? 'bg-white/20 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Grupy ({groupsCount})
        </button>
      </div>
    </div>
  );
};

export default ContactsTabNavigation;
