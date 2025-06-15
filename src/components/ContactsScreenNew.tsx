
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useContacts } from '@/hooks/useContacts';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useNotifications } from '@/hooks/useNotifications';
import { Input } from '@/components/ui/input';
import NotificationPanel from './NotificationPanel';
import ContactSearch from './ContactSearch';
import ContactsHeader from './contacts/ContactsHeader';
import ContactsQuickActions from './contacts/ContactsQuickActions';
import ContactsTabNavigation from './contacts/ContactsTabNavigation';
import ContactsContent from './contacts/ContactsContent';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  avatar?: string;
  lastActivity: Date;
}

const ContactsScreenNew: React.FC = () => {
  console.log('ContactsScreenNew: Component rendering started');
  
  const { t } = useTranslation();
  const { contacts } = useContacts();
  const { friendRequests, acceptFriendRequest, rejectFriendRequest } = useFriendRequests();
  const { unreadCount } = useNotifications();
  
  console.log('ContactsScreenNew: Hooks loaded', { 
    contacts: contacts?.length || 0, 
    friendRequests: friendRequests?.length || 0, 
    unreadCount 
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'contacts' | 'groups' | 'requests'>('contacts');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showContactSearch, setShowContactSearch] = useState(false);

  // Mock groups data
  const [groups] = useState<Group[]>([
    {
      id: '1',
      name: 'Rodzina',
      memberCount: 8,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Praca - Marketing',
      memberCount: 12,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Znajomi ze studiów',
      memberCount: 25,
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);

  const filteredContacts = contacts?.filter(contact =>
    contact.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = friendRequests?.filter(request =>
    request.sender_profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.sender_profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleQuickAction = (action: string, contact: any) => {
    console.log(`${action} with ${contact.profile?.display_name}`);
    // Implement quick actions
  };

  const formatLastActivity = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 1) return 'aktywne teraz';
    if (hours < 24) return `${Math.floor(hours)}h temu`;
    return `${Math.floor(hours / 24)}d temu`;
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  console.log('ContactsScreenNew: About to render JSX');

  try {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <ContactsHeader
            unreadCount={unreadCount || 0}
            onAddContact={() => setShowContactSearch(true)}
            onShowNotifications={() => setShowNotifications(true)}
          />

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj kontaktów..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Tabs */}
          <ContactsTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            contactsCount={filteredContacts.length}
            requestsCount={filteredRequests.length}
            groupsCount={filteredGroups.length}
          />
        </div>

        {/* Quick Actions Bar */}
        <ContactsQuickActions onAddContact={() => setShowContactSearch(true)} />

        {/* Content */}
        <ContactsContent
          activeTab={activeTab}
          filteredContacts={filteredContacts}
          filteredRequests={filteredRequests}
          filteredGroups={filteredGroups}
          onAddContact={() => setShowContactSearch(true)}
          onQuickAction={handleQuickAction}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          formatLastActivity={formatLastActivity}
        />

        {/* Modals */}
        {showNotifications && (
          <NotificationPanel
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        )}

        {showContactSearch && (
          <ContactSearch
            isOpen={showContactSearch}
            onClose={() => setShowContactSearch(false)}
            onSelectContact={(contactId) => {
              console.log('Selected contact:', contactId);
              setShowContactSearch(false);
            }}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('ContactsScreenNew: Error rendering component:', error);
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 items-center justify-center">
        <div className="text-white">Błąd ładowania kontaktów</div>
        <div className="text-gray-400 text-sm mt-2">Sprawdź konsolę dla szczegółów</div>
      </div>
    );
  }
};

export default ContactsScreenNew;
