
import React from 'react';
import { useContactsLogic } from '@/hooks/useContactsLogic';
import ContactsMainContent from './contacts/ContactsMainContent';
import ContactsActions from './contacts/ContactsActions';

const ContactsScreenNew: React.FC = () => {
  console.log('ContactsScreenNew: Rendering started');
  
  try {
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

    console.log('ContactsScreenNew: Data loaded', {
      contactsCount: contacts?.length || 0,
      receivedCount: receivedRequests?.length || 0,
      sentCount: sentRequests?.length || 0
    });

    // Defensywne sprawdzenie danych
    const safeContacts = contacts || [];
    const safeReceivedRequests = receivedRequests || [];
    const safeSentRequests = sentRequests || [];

    // Filtrowanie kontaktów na podstawie wyszukiwania
    const filteredContacts = safeContacts.filter(contact => {
      if (!contact || !contact.profile) {
        console.warn('ContactsScreenNew: Invalid contact object', contact);
        return false;
      }
      const displayName = contact.profile.display_name || '';
      const username = contact.profile.username || '';
      const query = searchQuery.toLowerCase();
      return displayName.toLowerCase().includes(query) ||
             username.toLowerCase().includes(query);
    });

    const filteredReceivedRequests = safeReceivedRequests.filter(request => {
      if (!request || !request.sender_profile) {
        console.warn('ContactsScreenNew: Invalid received request', request);
        return false;
      }
      const displayName = request.sender_profile.display_name || '';
      const username = request.sender_profile.username || '';
      const query = searchQuery.toLowerCase();
      return displayName.toLowerCase().includes(query) ||
             username.toLowerCase().includes(query);
    });

    const filteredSentRequests = safeSentRequests.filter(request => {
      if (!request || !request.receiver_profile) {
        console.warn('ContactsScreenNew: Invalid sent request', request);
        return false;
      }
      const displayName = request.receiver_profile.display_name || '';
      const username = request.receiver_profile.username || '';
      const query = searchQuery.toLowerCase();
      return displayName.toLowerCase().includes(query) ||
             username.toLowerCase().includes(query);
    });

    console.log('ContactsScreenNew: Filtered data', {
      filteredContactsCount: filteredContacts.length,
      filteredReceivedCount: filteredReceivedRequests.length,
      filteredSentCount: filteredSentRequests.length
    });

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
  } catch (error) {
    console.error('ContactsScreenNew: Critical error', error);
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h3 className="text-lg font-medium mb-2">Błąd ładowania kontaktów</h3>
            <p className="text-gray-400">Sprawdź konsolę przeglądarki po więcej informacji</p>
          </div>
        </div>
      </div>
    );
  }
};

export default ContactsScreenNew;
