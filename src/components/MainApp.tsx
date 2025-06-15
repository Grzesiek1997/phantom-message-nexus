
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, LogOut } from 'lucide-react';
import BottomNavigation from './BottomNavigation';
import RealTimeChatInterface from './RealTimeChatInterface';
import CallsScreen from './CallsScreen';
import ContactsScreenNew from './ContactsScreenNew';
import SettingsScreenNew from './SettingsScreenNew';
import FloatingActionButton from './FloatingActionButton';
import ContactSearch from './ContactSearch';
import GroupManagement from './GroupManagement';
import NotificationPanel from './NotificationPanel';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useUserStatus } from '@/hooks/useUserStatus';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { signOut, user } = useAuth();
  const { unreadCount } = useNotifications();
  const { receivedRequests } = useFriendRequests();
  const { updateMyStatus } = useUserStatus();

  // Calculate total unread notifications including friend requests
  const totalUnreadCount = unreadCount + receivedRequests.length;

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

  const handleSignOut = async () => {
    try {
      await updateMyStatus('offline');
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
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
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🛡️</span>
            </div>
            <h1 className="text-xl font-bold text-white">SecureChat Quantum - Make Gibek</h1>
            {user && (
              <div className="text-sm text-gray-300">
                Zalogowany jako: <span className="text-blue-400">{user.email || user.user_metadata?.username}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              className={`text-white hover:bg-white/10 relative ${
                totalUnreadCount > 0 ? 'animate-pulse' : ''
              }`}
              title="Powiadomienia"
            >
              <Bell className={`w-4 h-4 ${totalUnreadCount > 0 ? 'text-red-400' : 'text-white'}`} />
              {totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </span>
              )}
            </Button>
            
            {/* Prominent Logout Button */}
            <Button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg transition-colors shadow-lg border-2 border-red-500 hover:border-red-400"
              title="Wyloguj się"
            >
              <LogOut className="w-4 h-4 mr-2" />
              WYLOGUJ
            </Button>
          </div>
        </div>
      </header>

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

      {showNotifications && (
        <NotificationPanel 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />
      )}
    </div>
  );
};

export default MainApp;
