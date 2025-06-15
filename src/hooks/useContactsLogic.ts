
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContacts } from '@/hooks/useContacts';
import { useFriendRequests } from '@/hooks/friends/useFriendRequests';
import { useMessages } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';

export const useContactsLogic = () => {
  console.log('useContactsLogic: Hook initialized');
  
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent' | 'groups'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFriendSearchDialog, setShowFriendSearchDialog] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  
  try {
    const { contacts, deleteContact, fetchContacts } = useContacts();
    const { 
      receivedRequests, 
      sentRequests, 
      acceptFriendRequest, 
      rejectFriendRequest,
      deleteFriendRequest,
      fetchFriendRequests
    } = useFriendRequests();
    const { createConversation } = useMessages();

    console.log('useContactsLogic: Data loaded', {
      contactsCount: contacts?.length || 0,
      receivedRequestsCount: receivedRequests?.length || 0,
      sentRequestsCount: sentRequests?.length || 0
    });

    const handleSelectContact = async (contactId: string) => {
      try {
        console.log('useContactsLogic: Attempting to start chat with contact:', contactId);
        
        const contact = contacts.find(c => c.contact_user_id === contactId);
        
        if (!contact) {
          console.error('useContactsLogic: Contact not found:', contactId);
          toast({
            title: 'Błąd',
            description: 'Nie znaleziono kontaktu',
            variant: 'destructive'
          });
          return;
        }

        console.log('useContactsLogic: Found contact:', contact);

        if (contact.status !== 'accepted' || !contact.can_chat) {
          console.log('useContactsLogic: Cannot chat with contact - not accepted yet:', {
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

        console.log('useContactsLogic: Creating conversation with accepted contact:', contactId);
        
        const conversationId = await createConversation([contactId]);
        
        if (conversationId) {
          console.log('useContactsLogic: Conversation created/found successfully:', conversationId);
          
          toast({
            title: 'Czat utworzony',
            description: 'Możesz teraz rozpocząć rozmowę'
          });
          
          window.location.reload();
        } else {
          throw new Error('No conversation ID returned');
        }
      } catch (error) {
        console.error('useContactsLogic: Error creating conversation:', error);
        
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
        console.log('useContactsLogic: Accepting request:', requestId);
        await acceptFriendRequest(requestId);
        await fetchContacts();
        await fetchFriendRequests();
        toast({
          title: 'Zaproszenie zaakceptowane',
          description: 'Możesz teraz rozpocząć czat z tą osobą'
        });
      } catch (error) {
        console.error('useContactsLogic: Error accepting friend request:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się zaakceptować zaproszenia.",
          variant: "destructive"
        });
      }
    };

    const handleRejectRequest = async (requestId: string) => {
      try {
        console.log('useContactsLogic: Rejecting request:', requestId);
        await rejectFriendRequest(requestId);
        await fetchFriendRequests();
        toast({ title: "Zaproszenie odrzucone", description: "Zaproszenie zostało odrzucone." });
      } catch (error) {
        console.error('useContactsLogic: Error rejecting friend request:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się odrzucić zaproszenia.",
          variant: "destructive"
        });
      }
    };

    const handleDeleteRequest = async (requestId: string) => {
      try {
        console.log('useContactsLogic: Deleting request:', requestId);
        await deleteFriendRequest(requestId);
        await fetchFriendRequests();
        toast({ title: "Zaproszenie usunięte", description: "Zaproszenie zostało usunięte." });
      } catch (error) {
        console.error('useContactsLogic: Error deleting friend request:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć zaproszenia.",
          variant: "destructive"
        });
      }
    };

    const handleDeleteContact = async (contactId: string) => {
      try {
        console.log('useContactsLogic: Deleting contact:', contactId);
        await deleteContact(contactId);
        await fetchContacts();
        toast({
          title: "Kontakt usunięty",
          description: "Kontakt został usunięty.",
        });
      } catch (error) {
        console.error('useContactsLogic: Error deleting contact:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć kontaktu.",
          variant: "destructive"
        });
      }
    };

    return {
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      showFriendSearchDialog,
      setShowFriendSearchDialog,
      contacts: contacts || [],
      receivedRequests: receivedRequests || [],
      sentRequests: sentRequests || [],
      handleSelectContact,
      handleAcceptRequest,
      handleRejectRequest,
      handleDeleteRequest,
      handleDeleteContact
    };
  } catch (error) {
    console.error('useContactsLogic: Critical error in hook:', error);
    
    // Zwracaj bezpieczne defaulty w przypadku błędu
    return {
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      showFriendSearchDialog,
      setShowFriendSearchDialog,
      contacts: [],
      receivedRequests: [],
      sentRequests: [],
      handleSelectContact: () => {},
      handleAcceptRequest: () => {},
      handleRejectRequest: () => {},
      handleDeleteRequest: () => {},
      handleDeleteContact: () => {}
    };
  }
};
