
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone } from 'lucide-react';
import type { Contact } from '@/hooks/useContacts';

interface ContactCardActionsProps {
  contact: Contact;
  onSelectContact: (contactId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}

const ContactCardActions: React.FC<ContactCardActionsProps> = ({
  contact,
  onSelectContact,
  onAcceptRequest,
  onRejectRequest
}) => {
  if (contact.friend_request_status === 'pending' && contact.friend_request_id) {
    return (
      <>
        <Button
          size="sm"
          onClick={() => onAcceptRequest(contact.friend_request_id!)}
          className="bg-green-500 hover:bg-green-600"
          title="Akceptuj zaproszenie"
        >
          Akceptuj
        </Button>
        <Button
          size="sm"
          onClick={() => onRejectRequest(contact.friend_request_id!)}
          className="bg-red-500 hover:bg-red-600"
          title="Odrzuć zaproszenie"
        >
          Odrzuć
        </Button>
      </>
    );
  }

  if (contact.can_chat) {
    return (
      <>
        <Button
          size="sm"
          onClick={() => onSelectContact(contact.contact_user_id)}
          className="bg-blue-500 hover:bg-blue-600"
          title="Rozpocznij czat"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
          title="Zadzwoń"
        >
          <Phone className="w-4 h-4" />
        </Button>
      </>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled
      className="border-gray-600 text-gray-500 cursor-not-allowed"
      title="Czekaj na akceptację zaproszenia"
    >
      <MessageCircle className="w-4 h-4" />
    </Button>
  );
};

export default ContactCardActions;
