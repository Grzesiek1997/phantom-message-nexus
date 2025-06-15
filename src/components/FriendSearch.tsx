import React, { useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useContacts } from '@/hooks/useContacts';
import { useFriendRequests } from '@/hooks/friends/useFriendRequests';

interface FriendSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const FriendSearch: React.FC<FriendSearchProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchUsers } = useContacts();
  const { sendFriendRequest, sentRequests } = useFriendRequests();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
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

  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
    // Remove user from search results after sending request
    setSearchResults(prev => prev.filter(user => user.id !== userId));
  };

  const isRequestSent = (userId: string) => {
    return sentRequests.some(req => req.receiver_id === userId && req.status === 'pending');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Znajdź znajomych</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Wpisz nazwę użytkownika..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {isSearching ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-400">Szukam...</div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-400">
                {searchQuery.length < 2 
                  ? 'Wpisz co najmniej 2 znaki' 
                  : 'Nie znaleziono użytkowników'
                }
              </div>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.display_name?.charAt(0) || user.username?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {user.display_name || user.username}
                      </div>
                      {user.display_name && (
                        <div className="text-gray-400 text-sm">@{user.username}</div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSendRequest(user.id)}
                    disabled={isRequestSent(user.id)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                    size="sm"
                  >
                    {isRequestSent(user.id) ? (
                      'Wysłano'
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Dodaj
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendSearch;
