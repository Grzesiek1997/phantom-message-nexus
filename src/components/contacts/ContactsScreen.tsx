
import React, { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useFriendRequests } from '@/hooks/friends/useFriendRequests';
import { Search, UserPlus, Users, UserCheck, UserX, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMessages } from '@/hooks/useMessages';

const ContactsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { contacts, searchUsers } = useContacts();
  const { 
    receivedRequests, 
    sentRequests, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest 
  } = useFriendRequests();
  const { createConversation } = useMessages();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Błąd wyszukiwania',
        description: 'Nie udało się wyszukać użytkowników',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      setSearchResults(prev => prev.filter(user => user.id !== userId));
      toast({
        title: 'Zaproszenie wysłane',
        description: 'Zaproszenie do znajomych zostało wysłane'
      });
    } catch (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się wysłać zaproszenia',
        variant: 'destructive'
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      toast({
        title: 'Zaproszenie zaakceptowane',
        description: 'Masz nowego znajomego!'
      });
    } catch (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaakceptować zaproszenia',
        variant: 'destructive'
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      toast({
        title: 'Zaproszenie odrzucone',
        description: 'Zaproszenie zostało odrzucone'
      });
    } catch (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się odrzucić zaproszenia',
        variant: 'destructive'
      });
    }
  };

  const handleStartChat = async (contactId: string) => {
    try {
      const conversationId = await createConversation([contactId]);
      if (conversationId) {
        toast({
          title: 'Czat utworzony',
          description: 'Możesz teraz rozpocząć rozmowę'
        });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się utworzyć czatu',
        variant: 'destructive'
      });
    }
  };

  const acceptedContacts = contacts.filter(c => c.status === 'accepted' && c.can_chat);
  const pendingContacts = contacts.filter(c => c.status !== 'accepted' || !c.can_chat);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white mb-4">Kontakty</h1>
        
        {/* Search Bar */}
        <div className="flex space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Szukaj użytkowników..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSearching ? 'Szukam...' : 'Szukaj'}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Wyniki wyszukiwania:</h3>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {user.display_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.display_name || user.username}</p>
                      <p className="text-sm text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSendRequest(user.id)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Dodaj
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'friends'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1" />
            Znajomi ({acceptedContacts.length})
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'received'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <UserCheck className="w-4 h-4 inline mr-1" />
            Otrzymane ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'sent'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <UserX className="w-4 h-4 inline mr-1" />
            Wysłane ({sentRequests.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'friends' && (
          <div className="space-y-3">
            {acceptedContacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-gray-400">Brak znajomych</p>
                <p className="text-sm text-gray-500">Użyj wyszukiwarki powyżej, aby dodać znajomych</p>
              </div>
            ) : (
              acceptedContacts.map((contact) => (
                <div key={contact.id} className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {contact.profile.display_name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{contact.profile.display_name}</h3>
                        <p className="text-sm text-gray-400">@{contact.profile.username}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartChat(contact.contact_user_id)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Czat
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'received' && (
          <div className="space-y-3">
            {receivedRequests.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-gray-400">Brak otrzymanych zaproszeń</p>
              </div>
            ) : (
              receivedRequests.map((request) => (
                <div key={request.id} className="bg-white/10 rounded-lg p-4">
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
                        <p className="text-xs text-gray-500">Chce dodać Cię do znajomych</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Akceptuj
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRejectRequest(request.id)}
                        variant="destructive"
                      >
                        Odrzuć
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="space-y-3">
            {sentRequests.length === 0 ? (
              <div className="text-center py-8">
                <UserX className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-gray-400">Brak wysłanych zaproszeń</p>
              </div>
            ) : (
              sentRequests.map((request) => (
                <div key={request.id} className="bg-white/10 rounded-lg p-4">
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
                          {request.status === 'pending' ? 'Oczekuje na odpowiedź' : 
                           request.status === 'rejected' ? 'Odrzucone' : 'Zaakceptowane'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsScreen;
