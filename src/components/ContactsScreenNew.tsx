
import React from 'react';
import { useContactsLogic } from '@/hooks/useContactsLogic';
import ContactsMainContent from './contacts/ContactsMainContent';
import ContactsActions from './contacts/ContactsActions';

const ContactsScreenNew: React.FC = () => {
  console.log('ContactsScreenNew component rendered');
  
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    showFriendSearchDialog,
    setShowFriendSearchDialog,
    contacts,
    receivedRequests,
    sentRequests,
    handleSelectContact,
    handleAcceptRequest,
    handleRejectRequest,
    handleDeleteRequest,
    handleDeleteContact
  } = useContactsLogic();

  console.log('Contacts data:', { 
    contacts: contacts.length, 
    receivedRequests: receivedRequests.length, 
    sentRequests: sentRequests.length 
  });

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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <ContactsMainContent
        activeTab={activeTab}
        searchQuery={searchQuery}
        filteredContacts={filteredContacts}
        filteredReceivedRequests={filteredReceivedRequests}
        filteredSentRequests={filteredSentRequests}
        onTabChange={setActiveTab}
        onSearchChange={setSearchQuery}
        onSelectContact={handleSelectContact}
        onDeleteContact={handleDeleteContact}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onDeleteRequest={handleDeleteRequest}
      />

      <ContactsActions
        showFriendSearchDialog={showFriendSearchDialog}
        onShowFriendSearch={() => setShowFriendSearchDialog(true)}
        onCloseFriendSearch={() => setShowFriendSearchDialog(false)}
      />
    </div>
  );
};

export default ContactsScreenNew;
