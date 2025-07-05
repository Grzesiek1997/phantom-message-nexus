
import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useContacts, SearchUser } from '@/hooks/useContacts';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useDebounce } from '@/hooks/useDebounce';

interface FriendSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const FriendSearchDialog: React.FC<FriendSearchDialogProps> = ({ isOpen, onClose }) => {
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
      const results = await searchUsers(query);
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
    await sendFriendRequest(userId);
    // Remove user from search results after sending request
    setSearchResults(prev => prev.filter(user => user.id !== userId));
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Znajdź znajomych</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Wpisz nazwę użytkownika lub email..."
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400">Szukam...</div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-400 text-center">
                  {searchQuery.length < 2 
                    ? 'Wpisz co najmniej 2 znaki' 
                    : 'Nie znaleziono użytkowników'
                  }
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((user) => {
                  const requestStatus = getRequestStatus(user.id);
                  
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
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
                            className="bg-blue-600 hover:bg-blue-700"
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
      </DialogContent>
    </Dialog>
  );
};

export default FriendSearchDialog;
