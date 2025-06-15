
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContacts } from '@/hooks/useContacts';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useMessages } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';
import ContactsHeader from './contacts/ContactsHeader';
import ContactsTabNavigation from './contacts/ContactsTabNavigation';
import ContactsContent from './contacts/ContactsContent';
import ContactsQuickActions from './contacts/ContactsQuickActions';
import FriendSearch from './FriendSearch';

const ContactsScreenNew: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent' | 'groups'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFriendSearch, setShowFriendSearch] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleSelectContact = async (contactId: string) => {
    try {
      console.log('Attempting to start chat with contact:', contactId);
      
      // Znajdź kontakt w liście
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

      // Sprawdź czy można rozmawiać z tym kontaktem
      if (!contact.can_chat) {
        console.log('Cannot chat with contact - not accepted yet:', contact);
        toast({
          title: 'Nie można rozpocząć czatu',
          description: 'Poczekaj, aż użytkownik zaakceptuje zaproszenie do znajomych',
          variant: 'destructive'
        });
        return;
      }

      console.log('Creating conversation with contact:', contactId);
      
      // Utwórz konwersację
      const conversationId = await createConversation([contactId]);
      
      if (conversationId) {
        console.log('Conversation created successfully:', conversationId);
        toast({
          title: 'Czat utworzony',
          description: 'Przekierowuję do czatu...'
        });
        
        // Przekieruj do głównej aplikacji z wybraną konwersacją
        navigate('/', { 
          state: { 
            selectedConversationId: conversationId,
            fromContacts: true 
          } 
        });
      } else {
        throw new Error('Failed to create conversation - no ID returned');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się utworzyć czatu. Spróbuj ponownie.',
        variant: 'destructive'
      });
    }
  };

  const handleAddContact = () => {
    setShowFriendSearch(true);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      // Odśwież listę kontaktów po zaakceptowaniu zaproszenia
      await fetchContacts();
      await fetchFriendRequests();
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

  // Filtrowanie kontaktów na podstawie wyszukiwania
  const filteredContacts = contacts.filter(contact =>
    contact.profile.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.profile.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReceivedRequests = receivedRequests.filter(request =>
    request.sender_profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.sender_profile?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSentRequests = sentRequests.filter(request =>
    request.receiver_profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.receiver_profile?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Oblicz liczby dla zakładek
  const acceptedFriendsCount = filteredContacts.filter(c => c.can_chat).length;
  const pendingRequestsCount = filteredContacts.filter(c => !c.can_chat).length + acceptedFriendsCount;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <ContactsHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <ContactsTabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        friendsCount={pendingRequestsCount}
        receivedCount={filteredReceivedRequests.length}
        sentCount={filteredSentRequests.length}
        groupsCount={0}
      />

      <div className="flex-1 overflow-y-auto p-4">
        <ContactsContent
          activeTab={activeTab}
          contacts={filteredContacts}
          receivedRequests={filteredReceivedRequests}
          sentRequests={filteredSentRequests}
          onSelectContact={handleSelectContact}
          onDeleteContact={handleDeleteContact}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          onDeleteRequest={handleDeleteRequest}
        />
      </div>

      <ContactsQuickActions onAddContact={handleAddContact} />

      {showFriendSearch && (
        <FriendSearch
          isOpen={showFriendSearch}
          onClose={() => setShowFriendSearch(false)}
        />
      )}
    </div>
  );
};

export default ContactsScreenNew;
