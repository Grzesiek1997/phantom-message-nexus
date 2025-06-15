
import React, { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useMessages } from '@/hooks/useMessages';
import ContactsHeader from './contacts/ContactsHeader';
import ContactsTabNavigation from './contacts/ContactsTabNavigation';
import ContactsContent from './contacts/ContactsContent';
import ContactsQuickActions from './contacts/ContactsQuickActions';

const ContactsScreenNew: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent' | 'groups'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  const { contacts, deleteContact } = useContacts();
  const { 
    receivedRequests, 
    sentRequests, 
    acceptFriendRequest, 
    rejectFriendRequest,
    deleteFriendRequest 
  } = useFriendRequests();
  const { createConversation } = useMessages();

  const handleSelectContact = async (contactId: string) => {
    try {
      const conversationId = await createConversation([contactId]);
      if (conversationId) {
        // Tutaj można dodać nawigację do czatu
        console.log('Created conversation:', conversationId);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <ContactsHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <ContactsTabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        friendsCount={filteredContacts.length}
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
          onDeleteContact={deleteContact}
          onAcceptRequest={acceptFriendRequest}
          onRejectRequest={rejectFriendRequest}
          onDeleteRequest={deleteFriendRequest}
        />
      </div>

      <ContactsQuickActions />
    </div>
  );
};

export default ContactsScreenNew;
