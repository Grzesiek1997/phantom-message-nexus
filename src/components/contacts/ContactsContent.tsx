
import React from 'react';
import { MessageCircle, Phone, Trash2, UserPlus, UserX, Check, Clock, AlertCircle } from 'lucide-react';
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
import type { Contact } from '@/hooks/useContacts';
import type { FriendRequest } from '@/hooks/useFriendRequests';

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

  const getStatusBadge = (contact: Contact) => {
    if (contact.friend_request_status === 'accepted') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
          <Check className="w-3 h-3 mr-1" />
          Zaakceptowany
        </span>
      );
    } else if (contact.friend_request_status === 'pending') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
          <Clock className="w-3 h-3 mr-1" />
          Oczekuje
        </span>
      );
    } else if (contact.friend_request_status === 'rejected') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
          <AlertCircle className="w-3 h-3 mr-1" />
          Odrzucony
        </span>
      );
    }
    return null;
  };

  const renderFriends = () => {
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
          <div key={contact.id} className="bg-gray-800 rounded-lg p-4">
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
                    {getStatusBadge(contact)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {contact.can_chat ? (
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
        ))}
      </div>
    );
  };

  const renderReceivedRequests = () => {
    if (receivedRequests.length === 0) {
      return (
        <div className="text-center py-8">
          <UserX className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <p className="text-gray-400">Brak oczekujących zaproszeń</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {receivedRequests.map((request) => (
          <div key={request.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {request.sender_profile?.display_name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-white">{request.sender_profile?.display_name}</h3>
                  <p className="text-sm text-gray-400">@{request.sender_profile?.username}</p>
                  <p className="text-xs text-gray-500">Próba {request.attempt_count}/3</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => onAcceptRequest(request.id)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="w-4 h-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Odrzuć zaproszenie
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        Czy na pewno chcesz odrzucić zaproszenie od {request.sender_profile?.display_name}?
                        Ta osoba będzie mogła wysłać jeszcze {3 - request.attempt_count} zaproszenia.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                        Anuluj
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onRejectRequest(request.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Odrzuć
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSentRequests = () => {
    if (sentRequests.length === 0) {
      return (
        <div className="text-center py-8">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
          <p className="text-gray-400">Brak wysłanych zaproszeń</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {sentRequests.map((request) => (
          <div key={request.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {request.receiver_profile?.display_name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-white">{request.receiver_profile?.display_name}</h3>
                  <p className="text-sm text-gray-400">@{request.receiver_profile?.username}</p>
                  <p className="text-xs text-yellow-500">
                    {request.status === 'pending' ? 'Oczekuje' : request.status === 'rejected' ? 'Odrzucone' : 'Zaakceptowane'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Usuń zaproszenie
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        Czy na pewno chcesz usunąć zaproszenie wysłane do {request.receiver_profile?.display_name}?
                        Tej operacji nie można cofnąć.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                        Anuluj
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDeleteRequest(request.id)}
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
        ))}
      </div>
    );
  };

  const renderGroups = () => {
    return (
      <div className="text-center py-8">
        <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
        <p className="text-gray-400">Brak grup</p>
        <p className="text-sm text-gray-500">Grupy pojawią się tutaj</p>
      </div>
    );
  };

  switch (activeTab) {
    case 'friends':
      return renderFriends();
    case 'received':
      return renderReceivedRequests();
    case 'sent':
      return renderSentRequests();
    case 'groups':
      return renderGroups();
    default:
      return renderFriends();
  }
};

export default ContactsContent;
