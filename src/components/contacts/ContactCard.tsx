
import React from 'react';
import StatusBadge from './StatusBadge';
import type { Contact } from '@/hooks/useContacts';
import ContactCardActions from './ContactCardActions';
import DeleteContactDialog from './DeleteContactDialog';

interface ContactCardProps {
  contact: Contact;
  onSelectContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onSelectContact,
  onDeleteContact,
  onAcceptRequest,
  onRejectRequest
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {contact.profile.display_name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-white">{contact.profile.display_name}</h3>
            <p className="text-sm text-gray-400">@{contact.profile.username}</p>
            <div className="mt-1">
              <StatusBadge contact={contact} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ContactCardActions
            contact={contact}
            onSelectContact={onSelectContact}
            onAcceptRequest={onAcceptRequest}
            onRejectRequest={onRejectRequest}
          />
          
          <DeleteContactDialog
            contact={contact}
            onDeleteContact={onDeleteContact}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
