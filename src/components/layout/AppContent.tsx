
import React from 'react';
import ConversationList from '../ConversationList';
import ContactsScreen from '../contacts/ContactsScreen';
import CallsScreen from '../calls/CallsScreen';
import SettingsScreenNew from '../SettingsScreenNew';

interface AppContentProps {
  activeTab: string;
}

const AppContent: React.FC<AppContentProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'chats':
      return (
        <div className="flex-1 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          <div className="text-center py-8 text-white">
            <h2 className="text-xl font-semibold mb-2">Czaty</h2>
            <p className="text-gray-300">Funkcjonalność czatów będzie wkrótce dostępna</p>
          </div>
        </div>
      );
    case 'calls':
      return <CallsScreen />;
    case 'contacts':
      return <ContactsScreen />;
    case 'settings':
      return <SettingsScreenNew />;
    default:
      return (
        <div className="flex-1 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          <div className="text-center py-8 text-white">
            <h2 className="text-xl font-semibold mb-2">Czaty</h2>
            <p className="text-gray-300">Funkcjonalność czatów będzie wkrótce dostępna</p>
          </div>
        </div>
      );
  }
};

export default AppContent;
