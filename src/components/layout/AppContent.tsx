
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
      return <ConversationList />;
    case 'calls':
      return <CallsScreen />;
    case 'contacts':
      return <ContactsScreen />;
    case 'settings':
      return <SettingsScreenNew />;
    default:
      return <ConversationList />;
  }
};

export default AppContent;
