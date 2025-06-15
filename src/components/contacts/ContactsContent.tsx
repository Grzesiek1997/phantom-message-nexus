import React from 'react';
import FriendsTab from './FriendsTab';
import RequestsTab from './RequestsTab';
import GroupsTab from './GroupsTab';
import type { Contact } from '@/hooks/useContacts';
import type { FriendRequest } from '@/hooks/friends/useFriendRequests';

interface ContactsContentProps {
  activeTab: 'friends' | 'received' | 'sent' | 'groups';
  contacts: Contact[];
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  onSelectContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
}

const ContactsContent: React.FC<ContactsContentProps> = ({
  activeTab,
  contacts,
  receivedRequests,
  sentRequests,
  onSelectContact,
  onDeleteContact,
  onAcceptRequest,
  onRejectRequest,
  onDeleteRequest
}) => {
  switch (activeTab) {
    case 'friends':
      return (
        <FriendsTab
          contacts={contacts}
          onSelectContact={onSelectContact}
          onDeleteContact={onDeleteContact}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
        />
      );
    case 'received':
      return (
        <RequestsTab
          type="received"
          requests={receivedRequests}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          onDeleteRequest={onDeleteRequest}
        />
      );
    case 'sent':
      return (
        <RequestsTab
          type="sent"
          requests={sentRequests}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          onDeleteRequest={onDeleteRequest}
        />
      );
    case 'groups':
      return <GroupsTab />;
    default:
      return (
        <FriendsTab
          contacts={contacts}
          onSelectContact={onSelectContact}
          onDeleteContact={onDeleteContact}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
        />
      );
  }
};

export default ContactsContent;
