
import React from 'react';
import ContactSearch from '../ContactSearch';
import GroupManagement from '../GroupManagement';
import NotificationPanel from '../NotificationPanel';

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
  onCreateGroup
}) => {
  return (
    <>
      {showContactSearch && (
        <ContactSearch
          isOpen={showContactSearch}
          onClose={onCloseContactSearch}
          onSelectContact={onSelectContact}
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

      {showNotifications && (
        <NotificationPanel 
          isOpen={showNotifications} 
          onClose={onCloseNotifications} 
        />
      )}
    </>
  );
};

export default AppModals;
