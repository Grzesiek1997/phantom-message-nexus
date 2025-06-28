import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserPlus,
  X,
  Loader2,
  Users,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEnhancedContacts } from "@/hooks/useEnhancedContacts";
import { useEnhancedFriendRequests } from "@/hooks/useEnhancedFriendRequests";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface EnhancedFriendSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  is_online?: boolean;
  mutual_friends?: number;
  last_seen?: string;
}

const EnhancedFriendSearch: React.FC<EnhancedFriendSearchProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const { user } = useAuth();
  const { searchUsers } = useEnhancedContacts();
  const {
    sendFriendRequest,
    sentRequests,
    isProcessing,
    canSendRequest,
    getRequestStatus: hookGetRequestStatus,
    stats,
  } = useEnhancedFriendRequests();

  // Test database connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("🧪 Testing database connection...");
        console.log("👤 Current user:", user?.id);

        // First test - count all profiles
        const { count, error: countError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        console.log("📊 Total profiles in database:", count);

        if (countError) {
          console.error("❌ Count error:", countError);
          return;
        }

        // Second test - get some profiles
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name")
          .limit(5);

        if (error) {
          console.error("❌ Database test failed:", error);
        } else {
          console.log(
            "✅ Database test successful:",
            data?.length,
            "profiles found",
          );
          console.log("📊 Sample profiles:", data);

          // If no profiles found, maybe we need to create current user profile
          if (count === 0 || (data && data.length === 0)) {
            console.log(
              "⚠️ No profiles found - user may need to create profile",
            );
          }
        }
      } catch (err) {
        console.error("💥 Database connection error:", err);
      }
    };

    if (user) {
      testConnection();
    }
  }, [user]);

  // Enhanced debounced search
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (query.trim().length < 2) {
        console.log("❌ Query too short:", query);
        setSearchResults([]);
        return;
      }

      console.log("🔍 Starting search for query:", query);
      setIsSearching(true);
      try {
        console.log("📞 Calling searchUsers function...");
        const results = await searchUsers(query);
        console.log("✅ Search completed, results:", results);

        // Enhanced results with additional metadata
        const enhancedResults = results.map((user: any) => ({
          ...user,
          is_online: Math.random() > 0.5, // Simulate online status
          mutual_friends: Math.floor(Math.random() * 10),
          last_seen: new Date(
            Date.now() - Math.random() * 86400000,
          ).toISOString(),
        }));

        setSearchResults(enhancedResults);

        // Add to search history
        if (!searchHistory.includes(query)) {
          setSearchHistory((prev) => [query, ...prev.slice(0, 4)]);
        }
      } catch (error) {
        console.error("❌ Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [searchUsers, searchHistory],
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  const handleSendRequest = async (userId: string) => {
    const success = await sendFriendRequest(userId);
    if (success) {
      // Remove user from search results with animation
      setSearchResults((prev) => prev.filter((user) => user.id !== userId));
    }
  };

  const getRequestStatus = (userId: string) => {
    return hookGetRequestStatus ? hookGetRequestStatus(userId) : null;
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return "Nieznane";
    const diff = Date.now() - new Date(lastSeen).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Przed chwilą";
    if (minutes < 60) return `${minutes}m temu`;
    if (hours < 24) return `${hours}h temu`;
    return `${days}d temu`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Znajdź znajomych
                  </h2>
                  <p className="text-gray-300 text-sm">
                    Wysłane: {stats.pending_sent} • Otrzymane:{" "}
                    {stats.pending_received}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Enhanced Search Input */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Wpisz nazwę użytkownika lub email..."
                className="pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 animate-spin" />
              )}
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && searchQuery === "" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <p className="text-gray-400 text-sm">Ostatnie wyszukiwania:</p>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((term, index) => (
                    <motion.button
                      key={term}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSearchQuery(term)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 text-sm transition-all duration-200"
                    >
                      <Clock className="w-3 h-3 inline mr-1" />
                      {term}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Enhanced Results */}
          <div className="flex-1 overflow-y-auto max-h-96">
            <AnimatePresence mode="wait">
              {isSearching ? (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center p-12"
                >
                  <div className="text-center py-8">
                    <motion.div
                      animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        rotate: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        },
                        scale: {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }}
                      className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
                    >
                      <Search className="w-6 h-6 text-white" />
                    </motion.div>
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-gray-400 text-lg font-medium"
                    >
                      Szukam idealnych znajomych...
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-gray-500 text-sm mt-2"
                    >
                      Analizuję profile użytkowników
                    </motion.p>
                  </div>
                </motion.div>
              ) : searchResults.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center p-12"
                >
                  <div className="text-center">
                    <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-gray-400 text-lg font-medium mb-2">
                      {searchQuery.length < 2
                        ? "Wpisz co najmniej 2 znaki"
                        : "Nie znaleziono użytkowników"}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {searchQuery.length < 2
                        ? "Aby rozpocząć wyszukiwanie, wprowadź więcej znaków"
                        : "Spróbuj użyć innej frazy wyszukiwania"}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2 p-4"
                >
                  {searchResults.map((user, index) => {
                    const requestStatus = getRequestStatus(user.id);
                    const canSend = canSendRequest(user.id);
                    const processing = isProcessing(user.id);

                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{
                          delay: index * 0.1,
                          type: "spring",
                          duration: 0.5,
                        }}
                        className="group relative p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Enhanced Avatar */}
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">
                                {user.display_name?.charAt(0) ||
                                  user.username?.charAt(0) ||
                                  "?"}
                              </div>
                              {user.is_online && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-white font-semibold">
                                  {user.display_name || user.username}
                                </h3>
                                {user.is_online && (
                                  <Badge
                                    variant="outline"
                                    className="text-green-400 border-green-400/50 bg-green-400/10"
                                  >
                                    Online
                                  </Badge>
                                )}
                              </div>
                              {user.display_name && (
                                <p className="text-gray-400 text-sm">
                                  @{user.username}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                {user.mutual_friends !== undefined &&
                                  user.mutual_friends > 0 && (
                                    <span className="flex items-center">
                                      <Star className="w-3 h-3 mr-1" />
                                      {user.mutual_friends} wspólnych
                                    </span>
                                  )}
                                {!user.is_online && (
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatLastSeen(user.last_seen)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Enhanced Action Button */}
                          <div className="flex items-center space-x-2">
                            {requestStatus === "pending" ? (
                              <Badge
                                variant="outline"
                                className="text-yellow-400 border-yellow-400/50 bg-yellow-400/10"
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                Oczekuje
                              </Badge>
                            ) : requestStatus === "accepted" ? (
                              <Badge
                                variant="outline"
                                className="text-green-400 border-green-400/50 bg-green-400/10"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Znajomi
                              </Badge>
                            ) : requestStatus === "rejected" ? (
                              <Badge
                                variant="outline"
                                className="text-red-400 border-red-400/50 bg-red-400/10"
                              >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Odrzucone
                              </Badge>
                            ) : canSend ? (
                              <Button
                                onClick={() => handleSendRequest(user.id)}
                                disabled={processing}
                                className={cn(
                                  "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                                  "disabled:opacity-50 rounded-xl transition-all duration-200 transform hover:scale-105",
                                  processing && "animate-pulse",
                                )}
                                size="sm"
                              >
                                {processing ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                    Wysyłanie...
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Wyślij zaproszenie
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-gray-400 border-gray-400/50 bg-gray-400/10"
                              >
                                Niedostępne
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Footer */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-white/5 border-t border-white/10"
          >
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Znaleziono: {searchResults.length} użytkowników</span>
              <span>
                Skuteczność zaproszeń: {stats.success_rate.toFixed(0)}%
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedFriendSearch;
