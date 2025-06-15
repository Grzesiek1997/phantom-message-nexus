
import React from 'react';

interface ContactsTabNavigationProps {
  activeTab: 'contacts' | 'groups' | 'requests';
  onTabChange: (tab: 'contacts' | 'groups' | 'requests') => void;
  contactsCount: number;
  requestsCount: number;
  groupsCount: number;
}

const ContactsTabNavigation: React.FC<ContactsTabNavigationProps> = ({
  activeTab,
  onTabChange,
  contactsCount,
  requestsCount,
  groupsCount
}) => {
  return (
    <div className="flex space-x-2">
      <button
        onClick={() => onTabChange('contacts')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'contacts'
            ? 'bg-white/20 text-white'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
      >
        Kontakty ({contactsCount})
      </button>
      <button
        onClick={() => onTabChange('requests')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'requests'
            ? 'bg-white/20 text-white'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
      >
        Zaproszenia ({requestsCount})
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
  );
};

export default ContactsTabNavigation;
