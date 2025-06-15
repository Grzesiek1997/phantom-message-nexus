
import React from 'react';
import { UserPlus } from 'lucide-react';
import ContactCard from './ContactCard';
import type { Contact } from '@/hooks/useContacts';

interface FriendsTabProps {
  contacts: Contact[];
  onSelectContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}

const FriendsTab: React.FC<FriendsTabProps> = ({
  contacts,
  onSelectContact,
  onDeleteContact,
  onAcceptRequest,
  onRejectRequest
}) => {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-8">
        <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
        <p className="text-gray-400">Brak znajomych</p>
        <p className="text-sm text-gray-500">Dodaj znajomych, aby rozpocząć rozmowę</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onSelectContact={onSelectContact}
          onDeleteContact={onDeleteContact}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
        />
      ))}
    </div>
  );
};

export default FriendsTab;
