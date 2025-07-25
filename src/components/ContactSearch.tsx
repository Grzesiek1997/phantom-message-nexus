import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, X, Check, UserX, Clock } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import { useFixedFriendRequests } from "@/hooks/useFixedFriendRequests";
import { useToast } from "@/hooks/use-toast";

interface ContactSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contactId: string) => void;
}

const ContactSearch: React.FC<ContactSearchProps> = ({
  isOpen,
  onClose,
  onSelectContact,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const { contacts, searchUsers, deleteContact } = useContacts();
  const {
    receivedRequests,
    sentRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    canSendRequest,
    isProcessing,
  } = useFixedFriendRequests();
  const { toast } = useToast();

  const getRequestStatus = (userId: string) => {
    const sentRequest = sentRequests.find((req) => req.receiver_id === userId);
    const receivedRequest = receivedRequests.find(
      (req) => req.sender_id === userId,
    );

    if (sentRequest) return sentRequest.status;
    if (receivedRequest) return "received";
    return null;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Błąd wyszukiwania",
        description: "Nie udało się wyszukać użytkowników",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleAddContact = async (userId: string) => {
    try {
      await sendFriendRequest(userId);
      // Remove from search results after adding
      setSearchResults((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Add contact error:", error);
    }
  };

  const handleSelectContact = (contactId: string) => {
    onSelectContact(contactId);
    onClose();
  };

  const handleAcceptContact = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
    } catch (error) {
      console.error("Accept contact error:", error);
    }
  };

  const handleRejectContact = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
    } catch (error) {
      console.error("Reject contact error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Kontakty</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Szukaj użytkowników..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {searching ? "Szukam..." : "Szukaj"}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-300">
                Wyniki wyszukiwania:
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {searchResults.map((user) => {
                  // Check if user is already a contact
                  const isContact = contacts.some(
                    (contact) => contact.contact_user_id === user.id,
                  );

                  // Get comprehensive request status
                  const requestStatus = getRequestStatus(user.id);
                  const canSend = canSendRequest(user.id);
                  const processing = isProcessing(user.id);

                  // Check if we received invitation from this user
                  const receivedRequest = receivedRequests.find(
                    (request) => request.sender_id === user.id,
                  );

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {user.display_name?.charAt(0).toUpperCase() ||
                              user.username?.charAt(0).toUpperCase() ||
                              "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {user.display_name || user.username}
                          </p>
                          <p className="text-xs text-gray-400">
                            @{user.username}
                          </p>
                        </div>
                      </div>

                      {/* Enhanced Status indicators */}
                      <div className="flex items-center space-x-2">
                        {isContact ? (
                          <div className="flex items-center space-x-1 text-green-400 bg-green-400/10 px-3 py-1 rounded-lg border border-green-400/30">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-medium">Znajomy</span>
                          </div>
                        ) : requestStatus === "pending" ? (
                          <div className="flex items-center space-x-1 text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-lg border border-yellow-400/30">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-medium">Wysłano</span>
                          </div>
                        ) : requestStatus === "accepted" ? (
                          <div className="flex items-center space-x-1 text-green-400 bg-green-400/10 px-3 py-1 rounded-lg border border-green-400/30">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              Zaakceptowano
                            </span>
                          </div>
                        ) : requestStatus === "rejected" ? (
                          <div className="flex items-center space-x-1 text-red-400 bg-red-400/10 px-3 py-1 rounded-lg border border-red-400/30">
                            <UserX className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              Odrzucono
                            </span>
                          </div>
                        ) : requestStatus === "received" && receivedRequest ? (
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleAcceptContact(receivedRequest.id)
                              }
                              disabled={processing}
                              className="bg-green-500 hover:bg-green-600 h-8 px-3"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleRejectContact(receivedRequest.id)
                              }
                              disabled={processing}
                              className="bg-red-500 hover:bg-red-600 h-8 px-3"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : canSend ? (
                          <Button
                            size="sm"
                            onClick={() => handleAddContact(user.id)}
                            disabled={processing}
                            className="bg-green-500 hover:bg-green-600 h-8 px-3"
                          >
                            {processing ? (
                              <Clock className="w-4 h-4 animate-spin" />
                            ) : (
                              <UserPlus className="w-4 h-4" />
                            )}
                          </Button>
                        ) : (
                          <div className="flex items-center space-x-1 text-gray-500 bg-gray-500/10 px-3 py-1 rounded-lg border border-gray-500/30">
                            <UserX className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              Niedostępne
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Received Pending Requests */}
          {receivedRequests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-300">
                Otrzymane zaproszenia:
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {receivedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-2 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {request.sender_profile?.display_name
                            ?.charAt(0)
                            .toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {request.sender_profile?.display_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          @{request.sender_profile?.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptContact(request.id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRejectContact(request.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sent Pending Requests */}
          {sentRequests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-300">
                Wysłane zaproszenia:
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {sentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-2 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {request.receiver_profile?.display_name
                            ?.charAt(0)
                            .toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {request.receiver_profile?.display_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          @{request.receiver_profile?.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-gray-400">Oczekuje</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Contacts */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">
              Twoje kontakty:
            </h3>
            {contacts.length === 0 ? (
              <p className="text-gray-400 text-sm">Brak kontaktów</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleSelectContact(contact.contact_user_id)}
                    className="flex items-center space-x-3 p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {contact.profile.display_name
                          ?.charAt(0)
                          .toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {contact.profile.display_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        @{contact.profile.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSearch;
