
import React from 'react';
import ContactsHeader from './ContactsHeader';
import ContactsTabNavigation from './ContactsTabNavigation';
import ContactsContent from './ContactsContent';
import type { Contact } from '@/hooks/useContacts';
import type { FriendRequest } from '@/hooks/useFriendRequests';

interface ContactsMainContentProps {
  activeTab: 'friends' | 'received' | 'sent' | 'groups';
  searchQuery: string;
  filteredContacts: Contact[];
  filteredReceivedRequests: FriendRequest[];
  filteredSentRequests: FriendRequest[];
  onTabChange: (tab: 'friends' | 'received' | 'sent' | 'groups') => void;
  onSearchChange: (query: string) => void;
  onSelectContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
}

const ContactsMainContent: React.FC<ContactsMainContentProps> = ({
  activeTab,
  searchQuery,
  filteredContacts,
  filteredReceivedRequests,
  filteredSentRequests,
  onTabChange,
  onSearchChange,
  onSelectContact,
  onDeleteContact,
  onAcceptRequest,
  onRejectRequest,
  onDeleteRequest
}) => {
  const acceptedFriendsCount = filteredContacts.filter(c => c.can_chat).length;
  const pendingContactsCount = filteredContacts.filter(c => !c.can_chat).length;
  const totalContactsCount = acceptedFriendsCount + pendingContactsCount;

  return (
    <>
      <ContactsHeader 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      
      <ContactsTabNavigation 
        activeTab={activeTab}
        onTabChange={onTabChange}
        friendsCount={totalContactsCount}
        receivedCount={filteredReceivedRequests.length}
        sentCount={filteredSentRequests.length}
        groupsCount={0}
      />

      <div className="flex-1 overflow-y-auto p-4">
        <ContactsContent
          activeTab={activeTab}
          contacts={filteredContacts}
          receivedRequests={filteredReceivedRequests}
          sentRequests={filteredSentRequests}
          onSelectContact={onSelectContact}
          onDeleteContact={onDeleteContact}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          onDeleteRequest={onDeleteRequest}
        />
      </div>
    </>
  );
};

export default ContactsMainContent;
