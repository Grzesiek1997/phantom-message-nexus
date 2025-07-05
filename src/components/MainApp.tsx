import React, { useState } from "react";
import BottomNavigation from "./BottomNavigation";
import SimpleFloatingActionButton from "./SimpleFloatingActionButton";
import SimpleAppHeader from "./layout/SimpleAppHeader";
import AppContent from "./layout/AppContent";
import AppModals from "./layout/AppModals";
import LandingPage from "./LandingPage";
import LoginForm from "./auth/LoginForm";
import FriendSearchSystem from "./FriendSearchSystem";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useUserStatus } from "@/hooks/useUserStatus";

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState("chats");
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const { user, loading, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { updateMyStatus } = useUserStatus();

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Ładowanie aplikacji...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!user) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowLoginForm(true)} />
        {showLoginForm && (
          <LoginForm onClose={() => setShowLoginForm(false)} />
        )}
      </>
    );
  }

  const totalUnreadCount = unreadCount;

  const handleNewChat = () => {
    setShowContactSearch(true);
  };

  const handleGroupChat = () => {
    setShowGroupManagement(true);
  };

  const handleSearchChats = () => {
    console.log("Search chats");
  };

  const handleAddContacts = () => {
    setActiveTab("contacts");
  };

  const handleSignOut = async () => {
    try {
      await updateMyStatus("offline");
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const handleSearchClick = () => {
    setShowFriendSearch(true);
  };

  const handleSelectContact = (contactId: string) => {
    console.log("Selected contact:", contactId);
    setShowContactSearch(false);
  };

  const handleCreateGroup = (groupName: string, participantIds: string[]) => {
    console.log("Create group:", groupName, participantIds);
    setShowGroupManagement(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <SimpleAppHeader
        totalUnreadCount={totalUnreadCount}
        onNotificationClick={handleNotificationClick}
        onSearchClick={handleSearchClick}
        onSignOut={handleSignOut}
        showBackButton={true}
      />

      <AppContent activeTab={activeTab} />

      {/* Simple Floating Action Button - Always Visible */}
      <SimpleFloatingActionButton
        onNewChat={handleNewChat}
        onGroupChat={handleGroupChat}
        onSearchChats={handleSearchChats}
        onAddContacts={handleAddContacts}
      />

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <AppModals
        showContactSearch={showContactSearch}
        showGroupManagement={showGroupManagement}
        showNotifications={showNotifications}
        onCloseContactSearch={() => setShowContactSearch(false)}
        onCloseGroupManagement={() => setShowGroupManagement(false)}
        onCloseNotifications={() => setShowNotifications(false)}
        onSelectContact={handleSelectContact}
        onCreateGroup={handleCreateGroup}
      />

      {/* Friend Search System */}
      <FriendSearchSystem 
        isOpen={showFriendSearch}
        onClose={() => setShowFriendSearch(false)}
      />
    </div>
  );
};

export default MainApp;
