
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, X } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import { useFriendRequests } from "@/hooks/useFriendRequests";

interface FriendSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const FriendSearchDialog: React.FC<FriendSearchDialogProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [justSentTo, setJustSentTo] = useState<string | null>(null);
  const { searchUsers } = useContacts();
  const { sendFriendRequest, sentRequests } = useFriendRequests();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setJustSentTo(null);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
    setJustSentTo(userId);
    setSearchResults(prev => prev.filter(user => user.id !== userId));
  };

  const isRequestSent = (userId: string) =>
    sentRequests.some(req => req.receiver_id === userId && req.status === "pending") || justSentTo === userId;

  // Reset on close
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
        setJustSentTo(null);
      }, 250);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 max-w-md w-full rounded-xl border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between pb-2">
            <DialogTitle className="text-xl font-bold text-white">Dodaj znajomego</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        <div className="p-4">
          {/* SEARCH */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Wpisz nazwę użytkownika..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              autoFocus
            />
          </div>
          {/* RESULTS */}
          <div>
            {isSearching ? (
              <div className="text-center text-gray-400 py-6">Szukam...</div>
            ) : searchQuery.length < 2 ? (
              <div className="text-center text-gray-400 py-6">Wpisz min. 2 znaki aby zacząć szukać</div>
            ) : searchResults.length === 0 ? (
              <div className="text-center text-gray-400 py-6">Nie znaleziono użytkowników</div>
            ) : (
              <div className="flex flex-col gap-3">
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.display_name?.charAt(0) || user.username?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.display_name || user.username}</div>
                        <div className="text-gray-400 text-xs">@{user.username}</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSendRequest(user.id)}
                      disabled={isRequestSent(user.id)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                      size="sm"
                    >
                      {isRequestSent(user.id) ? "Wysłano" : (
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
          {/* After request */}
          {justSentTo && <div className="pt-4 text-green-400 text-center">Zaproszenie wysłane!</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FriendSearchDialog;
