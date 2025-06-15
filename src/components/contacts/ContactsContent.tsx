
import React from 'react';
import { Users, UserPlus, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContactCard from './ContactCard';
import FriendRequestCard from './FriendRequestCard';
import GroupCard from './GroupCard';

interface Contact {
  id: string;
  profile?: {
    display_name?: string;
    username?: string;
  };
}

interface FriendRequest {
  id: string;
  sender_profile?: {
    display_name?: string;
    username?: string;
  };
  receiver_profile?: {
    display_name?: string;
    username?: string;
  };
}

interface Group {
  id: string;
  name: string;
  memberCount: number;
  lastActivity: Date;
}

interface ContactsContentProps {
  activeTab: 'contacts' | 'groups' | 'received-requests' | 'sent-requests';
  filteredContacts: Contact[];
  filteredRequests: FriendRequest[];
  filteredSentRequests?: FriendRequest[];
  filteredGroups: Group[];
  onAddContact: () => void;
  onQuickAction: (action: string, contact: Contact) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onDeleteContact?: (contactId: string) => void;
  onDeleteRequest?: (requestId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  formatLastActivity: (date: Date) => string;
}

const ContactsContent: React.FC<ContactsContentProps> = ({
  activeTab,
  filteredContacts,
  filteredRequests,
  filteredSentRequests = [],
  filteredGroups,
  onAddContact,
  onQuickAction,
  onAcceptRequest,
  onRejectRequest,
  onDeleteContact,
  onDeleteRequest,
  onDeleteGroup,
  formatLastActivity
}) => {
  const renderEmptyState = (icon: any, title: string, description: string, showButton = false) => {
    const IconComponent = icon;
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <IconComponent className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">{title}</p>
        <p className="text-sm text-center mb-4">{description}</p>
        {showButton && (
          <Button onClick={onAddContact} className="bg-blue-500 hover:bg-blue-600">
            <UserPlus className="w-4 h-4 mr-2" />
            Dodaj pierwszy kontakt
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {activeTab === 'contacts' && (
        <div className="space-y-1">
          {filteredContacts.length === 0 ? (
            renderEmptyState(
              Users,
              'Brak znajomych',
              'Zaproś znajomych, aby zacząć rozmawiać',
              true
            )
          ) : (
            filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onQuickAction={onQuickAction}
                onDeleteContact={onDeleteContact}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'received-requests' && (
        <div className="space-y-1">
          {filteredRequests.length === 0 ? (
            renderEmptyState(
              UserPlus,
              'Brak zaproszeń do zaakceptowania',
              'Nowe zaproszenia pojawią się tutaj'
            )
          ) : (
            filteredRequests.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                onAccept={onAcceptRequest}
                onReject={onRejectRequest}
                onDelete={onDeleteRequest}
                type="received"
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'sent-requests' && (
        <div className="space-y-1">
          {filteredSentRequests.length === 0 ? (
            renderEmptyState(
              Send,
              'Brak wysłanych zaproszeń',
              'Wysłane zaproszenia pojawią się tutaj'
            )
          ) : (
            filteredSentRequests.map((request) => (
              <FriendRequestCard
                key={request.id}
                request={request}
                onAccept={onAcceptRequest}
                onReject={onRejectRequest}
                onDelete={onDeleteRequest}
                type="sent"
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="space-y-1">
          {filteredGroups.length === 0 ? (
            renderEmptyState(
              Users,
              'Brak grup',
              'Utwórz grupę, aby zacząć rozmowę grupową'
            )
          ) : (
            filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                formatLastActivity={formatLastActivity}
                onDeleteGroup={onDeleteGroup}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ContactsContent;
