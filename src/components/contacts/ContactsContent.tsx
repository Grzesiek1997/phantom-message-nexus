
import React from 'react';
import { Users, UserPlus } from 'lucide-react';
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
}

interface Group {
  id: string;
  name: string;
  memberCount: number;
  lastActivity: Date;
}

interface ContactsContentProps {
  activeTab: 'contacts' | 'groups' | 'requests';
  filteredContacts: Contact[];
  filteredRequests: FriendRequest[];
  filteredGroups: Group[];
  onAddContact: () => void;
  onQuickAction: (action: string, contact: Contact) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  formatLastActivity: (date: Date) => string;
}

const ContactsContent: React.FC<ContactsContentProps> = ({
  activeTab,
  filteredContacts,
  filteredRequests,
  filteredGroups,
  onAddContact,
  onQuickAction,
  onAcceptRequest,
  onRejectRequest,
  formatLastActivity
}) => {
  console.log('ContactsContent: Rendering with activeTab:', activeTab);
  console.log('ContactsContent: Data counts:', {
    contacts: filteredContacts?.length || 0,
    requests: filteredRequests?.length || 0,
    groups: filteredGroups?.length || 0
  });

  try {
    return (
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'contacts' && (
          <div className="space-y-1">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <Users className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">Brak kontaktów</p>
                <p className="text-sm text-center mb-4">Zaproś znajomych, aby zacząć rozmawiać</p>
                <Button
                  onClick={onAddContact}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Dodaj pierwszy kontakt
                </Button>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onQuickAction={onQuickAction}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-1">
            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <UserPlus className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">Brak zaproszeń</p>
                <p className="text-sm text-center">Nowe zaproszenia pojawią się tutaj</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  onAccept={onAcceptRequest}
                  onReject={onRejectRequest}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-1">
            {filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <Users className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">Brak grup</p>
                <p className="text-sm text-center">Utwórz grupę, aby zacząć rozmowę grupową</p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  formatLastActivity={formatLastActivity}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('ContactsContent: Error rendering:', error);
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-400">Błąd renderowania zawartości kontaktów</div>
      </div>
    );
  }
};

export default ContactsContent;
