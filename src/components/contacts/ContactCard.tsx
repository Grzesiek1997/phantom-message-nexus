
import React from 'react';
import { MessageCircle, Phone, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import StatusBadge from './StatusBadge';
import type { Contact } from '@/hooks/useContacts';

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
          {contact.friend_request_status === 'pending' && contact.friend_request_id ? (
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
          ) : contact.can_chat ? (
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
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled
              className="border-gray-600 text-gray-500 cursor-not-allowed"
              title="Czekaj na akceptację zaproszenia"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Usuń znajomego
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  Czy na pewno chcesz usunąć {contact.profile.display_name} z listy znajomych? 
                  Tej operacji nie można cofnąć.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                  Anuluj
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDeleteContact(contact.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Usuń
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default ContactCard;
