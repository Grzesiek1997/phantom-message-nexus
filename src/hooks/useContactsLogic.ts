
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContacts } from '@/hooks/useContacts';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useMessages } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';

export const useContactsLogic = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent' | 'groups'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFriendSearchDialog, setShowFriendSearchDialog] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { contacts, loading, deleteContact, fetchContacts } = useContacts();
  const { 
    receivedRequests, 
    sentRequests, 
    acceptFriendRequest, 
    rejectFriendRequest,
    deleteFriendRequest,
    fetchFriendRequests
  } = useFriendRequests();
  const { createConversation } = useMessages();

  const handleSelectContact = async (contactId: string) => {
    try {
      console.log('Attempting to start chat with contact:', contactId);
      
      const contact = contacts.find(c => c.contact_user_id === contactId);
      
      if (!contact) {
        console.error('Contact not found:', contactId);
        toast({
          title: 'Błąd',
          description: 'Nie znaleziono kontaktu',
          variant: 'destructive'
        });
        return;
      }

      console.log('Found contact:', contact);

      if (contact.status !== 'accepted' || !contact.can_chat) {
        console.log('Cannot chat with contact - not accepted yet:', {
          status: contact.status,
          can_chat: contact.can_chat,
          friend_request_status: contact.friend_request_status
        });
        
        toast({
          title: 'Nie można rozpocząć czatu',
          description: 'Osoba musi zaakceptować zaproszenie do znajomych',
          variant: 'destructive'
        });
        return;
      }

      console.log('Creating conversation with accepted contact:', contactId);
      
      const result = await createConversation([contactId]);
      
      if (result) {
        console.log('Conversation created/found successfully:', result);
        
        toast({
          title: 'Czat utworzony',
          description: 'Możesz teraz rozpocząć rozmowę'
        });
        
        window.location.reload();
      } else {
        throw new Error('No conversation ID returned');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      
      let errorMessage = 'Nie udało się utworzyć czatu.';
      
      if (error instanceof Error) {
        if (error.message.includes('User not authenticated')) {
          errorMessage = 'Musisz być zalogowany aby utworzyć czat.';
        } else if (error.message.includes('nie jest Twoim znajomym')) {
          errorMessage = 'Nie można utworzyć czatu z osobą, która nie jest Twoim znajomym.';
        } else if (error.message.includes('Nie udało się utworzyć konwersacji')) {
          errorMessage = 'Błąd podczas tworzenia konwersacji. Sprawdź połączenie z internetem.';
        } else if (error.message.includes('Nie udało się dodać uczestników')) {
          errorMessage = 'Nie udało się dodać uczestników do czatu.';
        }
      }
      
      toast({
        title: 'Błąd tworzenia czatu',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await fetchContacts();
      await fetchFriendRequests();
      
      toast({
        title: 'Zaproszenie zaakceptowane',
        description: 'Możesz teraz rozpocząć czat z tą osobą'
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      await fetchFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await deleteFriendRequest(requestId);
      await fetchFriendRequests();
    } catch (error) {
      console.error('Error deleting friend request:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContact(contactId);
      await fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    showFriendSearchDialog,
    setShowFriendSearchDialog,
    contacts,
    loading,
    receivedRequests,
    sentRequests,
    handleSelectContact,
    handleAcceptRequest,
    handleRejectRequest,
    handleDeleteRequest,
    handleDeleteContact
  };
};
