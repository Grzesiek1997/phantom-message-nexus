
import React, { useState } from 'react';
import { Plus, Search, Users, UserPlus, QrCode, Link, Share, MoreVertical, MessageCircle, Phone, Video, Info, Bell } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useContacts } from '@/hooks/useContacts';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NotificationPanel from './NotificationPanel';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  avatar?: string;
  lastActivity: Date;
}

const ContactsScreenNew: React.FC = () => {
  const { t } = useTranslation();
  const { contacts } = useContacts();
  const { friendRequests } = useFriendRequests();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'contacts' | 'groups' | 'requests'>('contacts');
  const [showNotifications, setShowNotifications] = useState(false);

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

  const filteredContacts = contacts.filter(contact =>
    contact.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = friendRequests.filter(request =>
    request.sender_profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.sender_profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">{t('contacts')}</h1>
          <div className="flex items-center space-x-2">
            {/* Notifications Button */}
            <Button
              onClick={() => setShowNotifications(true)}
              variant="ghost"
              size="icon"
              className="relative text-gray-400 hover:text-white"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
        </div>

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
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'contacts'
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Kontakty ({filteredContacts.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'requests'
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Zaproszenia ({filteredRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'groups'
                ? 'bg-white/20 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Grupy ({filteredGroups.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'contacts' ? (
          // Contacts List
          <div className="space-y-1">
            {filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <Users className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">Brak kontaktów</p>
                <p className="text-sm text-center">Zaproś znajomych, aby zacząć rozmawiać</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center p-4 hover:bg-white/5 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">
                      {contact.profile?.display_name?.charAt(0) || '?'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-white">
                      {contact.profile?.display_name || contact.profile?.username || 'Unknown'}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{t('online')}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleQuickAction('chat', contact)}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuickAction('call', contact)}
                      className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuickAction('video', contact)}
                      className="p-2 bg-purple-500/20 text-purple-400 rounded-full hover:bg-purple-500/30 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleQuickAction('info', contact)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'requests' ? (
          // Friend Requests List
          <div className="space-y-1">
            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <UserPlus className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">Brak zaproszeń</p>
                <p className="text-sm text-center">Nowe zaproszenia pojawią się tutaj</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center p-4 hover:bg-white/5 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">
                      {request.sender_profile?.display_name?.charAt(0) || '?'}
                    </span>
                  </div>

                  {/* Request Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-white">
                      {request.sender_profile?.display_name || request.sender_profile?.username || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-400">Chce dodać Cię do znajomych</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Akceptuj
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/20"
                    >
                      Odrzuć
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Groups List
          <div className="space-y-1">
            {filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <Users className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg">Brak grup</p>
                <p className="text-sm text-center">Utwórz grupę, aby zacząć rozmowę grupową</p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center p-4 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {/* Group Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>

                  {/* Group Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{group.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>{group.memberCount} członków</span>
                      <span>•</span>
                      <span>{formatLastActivity(group.lastActivity)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default ContactsScreenNew;
