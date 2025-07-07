
import React from 'react';
import SafeRealTimeChatInterface from '../SafeRealTimeChatInterface';
// import RealTimeChatInterface from '../RealTimeChatInterface';
import CallsScreen from '../CallsScreen';
import ContactsScreenNew from '../ContactsScreenNew';
import SettingsScreenNew from '../SettingsScreenNew';

interface AppContentProps {
  activeTab: string;
}

const AppContent: React.FC<AppContentProps> = ({ activeTab }) => {
  const renderActiveScreen = () => {
    console.log('🔧 AppContent rendering screen:', activeTab);
    switch (activeTab) {
      case 'chats':
        return <SafeRealTimeChatInterface />;
      case 'calls':
        return <CallsScreen />;
      case 'contacts':
        return <ContactsScreenNew />;
      case 'settings':
        return <SettingsScreenNew />;
      default:
        return <SafeRealTimeChatInterface />;
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      {renderActiveScreen()}
    </div>
  );
};

export default AppContent;
