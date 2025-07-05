import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useContacts, SearchUser } from '@/hooks/useContacts';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useDebounce } from '@/hooks/useDebounce';

interface FriendSearchSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const FriendSearchSystem: React.FC<FriendSearchSystemProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { searchUsers } = useContacts();
  const { sendFriendRequest, sentRequests } = useFriendRequests();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for:', query);
      const results = await searchUsers(query);
      console.log('Search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (debouncedSearchQuery) {
      handleSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  const handleSendRequest = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      // Remove user from search results after sending request
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const isRequestSent = (userId: string) => {
    return sentRequests.some(req => req.receiver_id === userId && req.status === 'pending');
  };

  const getRequestStatus = (userId: string) => {
    const request = sentRequests.find(req => req.receiver_id === userId);
    return request?.status;
  };

  const getAvatarFallback = (user: SearchUser) => {
    return user.display_name?.charAt(0) || user.username?.charAt(0) || '?';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 border border-white/20 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Znajdź znajomych</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Wpisz nazwę użytkownika..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto max-h-96 px-6 pb-6">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span className="text-gray-400 ml-2">Szukam...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400 text-center">
                {searchQuery.length < 2 
                  ? 'Wpisz co najmniej 2 znaki aby wyszukać' 
                  : 'Nie znaleziono użytkowników'
                }
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((user) => {
                const requestStatus = getRequestStatus(user.id);
                
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
                          {getAvatarFallback(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white font-medium">
                          {user.display_name || user.username}
                        </div>
                        {user.display_name && (
                          <div className="text-gray-400 text-sm">@{user.username}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {requestStatus === 'pending' ? (
                        <div className="flex items-center text-yellow-400 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          Wysłano
                        </div>
                      ) : requestStatus === 'accepted' ? (
                        <div className="flex items-center text-green-400 text-sm">
                          <Check className="w-4 h-4 mr-1" />
                          Znajomi
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleSendRequest(user.id)}
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Dodaj
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendSearchSystem;