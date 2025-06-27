import React, { useState } from "react";
import BottomNavigation from "./BottomNavigation";
import FloatingActionButton from "./FloatingActionButton";
import AppHeader from "./layout/AppHeader";
import AppContent from "./layout/AppContent";
import AppModals from "./layout/AppModals";
import FriendshipNotifications from "./FriendshipNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useUserStatus } from "@/hooks/useUserStatus";

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState("chats");
  const [showContactSearch, setShowContactSearch] = useState(false);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { receivedRequests } = useFriendRequests();
  const { updateMyStatus } = useUserStatus();

  const totalUnreadCount = unreadCount + receivedRequests.length;

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
      <AppHeader
        totalUnreadCount={totalUnreadCount}
        onNotificationClick={handleNotificationClick}
        onSignOut={handleSignOut}
      />

      <AppContent activeTab={activeTab} />

      {activeTab === "chats" && (
        <FloatingActionButton
          onNewChat={handleNewChat}
          onGroupChat={handleGroupChat}
          onSearchChats={handleSearchChats}
          onAddContacts={handleAddContacts}
        />
      )}

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

      {/* Enhanced Friendship Notifications */}
      <FriendshipNotifications />
    </div>
  );
};

export default MainApp;
