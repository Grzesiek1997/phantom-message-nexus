import React from "react";
import EnhancedFriendSearch from "../EnhancedFriendSearch";
import GroupManagement from "../GroupManagement";
import FriendshipNotifications from "../FriendshipNotifications";

interface AppModalsProps {
  showContactSearch: boolean;
  showGroupManagement: boolean;
  showNotifications: boolean;
  onCloseContactSearch: () => void;
  onCloseGroupManagement: () => void;
  onCloseNotifications: () => void;
  onSelectContact: (contactId: string) => void;
  onCreateGroup: (groupName: string, participantIds: string[]) => void;
}

const AppModals: React.FC<AppModalsProps> = ({
  showContactSearch,
  showGroupManagement,
  showNotifications,
  onCloseContactSearch,
  onCloseGroupManagement,
  onCloseNotifications,
  onSelectContact,
  onCreateGroup,
}) => {
  return (
    <>
      {showContactSearch && (
        <EnhancedFriendSearch
          isOpen={showContactSearch}
          onClose={onCloseContactSearch}
        />
      )}

      {showGroupManagement && (
        <GroupManagement
          isOpen={showGroupManagement}
          onClose={onCloseGroupManagement}
          onCreateGroup={onCreateGroup}
          contacts={[]}
        />
      )}

      {/* FriendshipNotifications is always rendered and manages its own visibility */}
      <FriendshipNotifications />
    </>
  );
};

export default AppModals;
