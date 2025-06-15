
import React from 'react';
import { useContactsLogic } from '@/hooks/useContactsLogic';
import ContactsMainContent from './contacts/ContactsMainContent';
import ContactsActions from './contacts/ContactsActions';
import { Loader2, UserPlus, Search } from 'lucide-react';
import FriendSearch from '@/components/FriendSearch';

const ContactsScreenNew: React.FC = () => {
  const {
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
  } = useContactsLogic();

  // Defensywna inicjalizacja danych, logi do debugowania
  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const safeReceived = Array.isArray(receivedRequests) ? receivedRequests : [];
  const safeSent = Array.isArray(sentRequests) ? sentRequests : [];

  // Debug logi
  console.log("ContactsScreenNew loaded", {
    loading,
    contacts: safeContacts,
    receivedRequests: safeReceived,
    sentRequests: safeSent,
    searchQuery,
    activeTab,
    showFriendSearchDialog
  });

  // Filtrowanie kontaktów na podstawie wyszukiwania
  const filteredContacts = safeContacts.filter(contact =>
    contact?.profile?.display_name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
    contact?.profile?.username?.toLowerCase()?.includes(searchQuery.toLowerCase())
  );

  const filteredReceivedRequests = safeReceived.filter(request =>
    request?.sender_profile?.display_name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
    request?.sender_profile?.username?.toLowerCase()?.includes(searchQuery.toLowerCase())
  );

  const filteredSentRequests = safeSent.filter(request =>
    request?.receiver_profile?.display_name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
    request?.receiver_profile?.username?.toLowerCase()?.includes(searchQuery.toLowerCase())
  );

  // Obsługa ładowania
  if (loading) {
    console.log("Loading contacts...");
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
        <span className="text-white text-lg">Ładowanie kontaktów...</span>
      </div>
    );
  }

  // Obsługa pustych danych (po zalogowaniu, ale brak kontaktów i zaproszeń)
  if (
    filteredContacts.length === 0 &&
    filteredReceivedRequests.length === 0 &&
    filteredSentRequests.length === 0 &&
    searchQuery === ''
  ) {
    console.log("No contacts or requests found.");
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-24 h-24 flex items-center justify-center mb-6">
          <UserPlus className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Nie masz jeszcze znajomych</h2>
        <p className="text-gray-300 mb-6">Dodaj nowego znajomego, aby rozpocząć rozmowę lub zaproś kogoś.</p>
        <button
          className="flex items-center px-5 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow hover:from-blue-600 hover:to-purple-700 transition-colors"
          onClick={() => setShowFriendSearchDialog(true)}
        >
          <Search className="w-5 h-5 mr-2" /> Dodaj znajomych
        </button>
        <FriendSearch isOpen={showFriendSearchDialog} onClose={() => setShowFriendSearchDialog(false)} />
      </div>
    );
  }

  // Główny ekran kontaktów
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

      {/* Friend search modal (dodawanie znajomych) */}
      <FriendSearch isOpen={showFriendSearchDialog} onClose={() => setShowFriendSearchDialog(false)} />
    </div>
  );
};

export default ContactsScreenNew;

