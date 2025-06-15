
import React, { useState } from 'react';
import BottomNavigation from './BottomNavigation';
import RealTimeChatInterface from './RealTimeChatInterface';
import CallsScreen from './CallsScreen';
import ContactsScreenNew from './ContactsScreenNew';
import SettingsScreenNew from './SettingsScreenNew';
import FloatingActionButton from './FloatingActionButton';
import ContactSearch from './ContactSearch';
import GroupManagement from './GroupManagement';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [showGroupManagement, setShowGroupManagement] = useState(false);

  const handleNewChat = () => {
    setShowContactSearch(true);
  };

  const handleGroupChat = () => {
    setShowGroupManagement(true);
  };

  const handleSearchChats = () => {
    console.log('Search chats');
    // Implement search functionality
  };

  const handleAddContacts = () => {
    setActiveTab('contacts');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'chats':
        return <RealTimeChatInterface />;
      case 'calls':
        return <CallsScreen />;
      case 'contacts':
        return <ContactsScreenNew />;
      case 'settings':
        return <SettingsScreenNew />;
      default:
        return <RealTimeChatInterface />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderActiveScreen()}
      </div>

      {/* Floating Action Button - tylko na ekranie czatów */}
      {activeTab === 'chats' && (
        <FloatingActionButton
          onNewChat={handleNewChat}
          onGroupChat={handleGroupChat}
          onSearchChats={handleSearchChats}
          onAddContacts={handleAddContacts}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Modals */}
      {showContactSearch && (
        <ContactSearch
          isOpen={showContactSearch}
          onClose={() => setShowContactSearch(false)}
          onSelectContact={(contactId) => {
            console.log('Selected contact:', contactId);
            setShowContactSearch(false);
          }}
        />
      )}

      {showGroupManagement && (
        <GroupManagement
          isOpen={showGroupManagement}
          onClose={() => setShowGroupManagement(false)}
          onCreateGroup={(groupName, participantIds) => {
            console.log('Create group:', groupName, participantIds);
            setShowGroupManagement(false);
          }}
          contacts={[]} // Pass real contacts here
        />
      )}
    </div>
  );
};

export default MainApp;
