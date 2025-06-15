
import React from 'react';
import ContactSearch from '../ContactSearch';
import AIAssistant from '../AIAssistant';
import GroupManagement from '../GroupManagement';
import NotificationPanel from '../NotificationPanel';

interface ModalsProviderProps {
  showContactSearch: boolean;
  showAIAssistant: boolean;
  showGroupManagement: boolean;
  showNotifications: boolean;
  contacts: any[];
  onCloseContactSearch: () => void;
  onCloseAIAssistant: () => void;
  onCloseGroupManagement: () => void;
  onCloseNotifications: () => void;
  onSelectContact: (contactId: string) => void;
  onCreateGroup: (groupName: string, participantIds: string[]) => void;
}

const ModalsProvider: React.FC<ModalsProviderProps> = ({
  showContactSearch,
  showAIAssistant,
  showGroupManagement,
  showNotifications,
  contacts,
  onCloseContactSearch,
  onCloseAIAssistant,
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

      {showAIAssistant && (
        <AIAssistant
          isOpen={showAIAssistant}
          onClose={onCloseAIAssistant}
        />
      )}

      {showGroupManagement && (
        <GroupManagement
          isOpen={showGroupManagement}
          onClose={onCloseGroupManagement}
          onCreateGroup={onCreateGroup}
          contacts={contacts}
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

export default ModalsProvider;
