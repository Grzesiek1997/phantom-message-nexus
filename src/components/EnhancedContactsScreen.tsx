import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Inbox,
  Send,
  Settings,
  TrendingUp,
  Heart,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnhancedContacts } from "@/hooks/useEnhancedContacts";
import { useEnhancedFriendRequests } from "@/hooks/useEnhancedFriendRequests";
import { useContactsLogic } from "@/hooks/useContactsLogic";
import EnhancedFriendSearch from "./EnhancedFriendSearch";
import EnhancedFriendRequestCard from "./EnhancedFriendRequestCard";
import EnhancedLoadingAnimations from "./EnhancedLoadingAnimations";
import { cn } from "@/lib/utils";

const EnhancedContactsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "online" | "recent"
  >("all");
  const [activeTab, setActiveTab] = useState<
    "friends" | "received" | "sent" | "stats"
  >("friends");

  const {
    contacts,
    stats: contactsStats,
    loading: contactsLoading,
    searchUsers,
    deleteContact,
    isProcessing: isContactProcessing,
  } = useEnhancedContacts();
  const {
    receivedRequests,
    sentRequests,
    allReceivedRequests,
    stats,
    loading: requestsLoading,
    acceptFriendRequest,
    rejectFriendRequest,
    deleteFriendRequest,
    isProcessing,
  } = useEnhancedFriendRequests();

  const { handleSelectContact } = useContactsLogic();

  const loading = contactsLoading || requestsLoading;

  // Enhanced filtering and search
  const filteredContacts = useMemo(() => {
    let filtered = contacts.filter((contact) => {
      const searchMatch =
        contact?.profile?.display_name
          ?.toLowerCase()
          ?.includes(searchQuery.toLowerCase()) ||
        contact?.profile?.username
          ?.toLowerCase()
          ?.includes(searchQuery.toLowerCase());

      switch (selectedFilter) {
        case "online":
          return searchMatch && Math.random() > 0.5; // Simulate online status
        case "recent":
          return (
            searchMatch &&
            new Date(contact.created_at).getTime() >
              Date.now() - 7 * 24 * 60 * 60 * 1000
          );
        default:
          return searchMatch;
      }
    });

    return filtered;
  }, [contacts, searchQuery, selectedFilter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", duration: 0.5 },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", duration: 0.8, bounce: 0.4 },
    },
  };

  const tabVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <EnhancedLoadingAnimations
        type="contacts"
        message="Synchronizujemy Twoją społeczność..."
        showProgress={true}
        progress={Math.min(95, Date.now() % 100)}
      />
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"
    >
      {/* Enhanced Header */}
      <motion.div
        variants={headerVariants}
        className="relative p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Kontakty</h1>
              <p className="text-gray-300 text-sm">
                {contacts.length} znajomych • {stats.pending_received} nowych
                zaproszeń
              </p>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowFriendSearch(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl px-6 py-3 shadow-lg"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Dodaj znajomego
            </Button>
          </motion.div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="flex items-center space-x-4">
          <motion.div variants={itemVariants} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj znajomych..."
              className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500/50"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="flex space-x-2">
            {["all", "online", "recent"].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedFilter(filter as any)}
                className={cn(
                  "rounded-xl transition-all duration-200",
                  selectedFilter === filter
                    ? "bg-white/20 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/10",
                )}
              >
                <Filter className="w-4 h-4 mr-1" />
                {filter === "all"
                  ? "Wszyscy"
                  : filter === "online"
                    ? "Online"
                    : "Niedawni"}
              </Button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          className="h-full flex flex-col"
        >
          <motion.div
            variants={itemVariants}
            className="px-6 py-4 border-b border-white/10"
          >
            <TabsList className="bg-white/10 rounded-xl p-1">
              <TabsTrigger
                value="friends"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg transition-all duration-200"
              >
                <Users className="w-4 h-4 mr-2" />
                Znajomi
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-500/20 text-blue-300"
                >
                  {contacts.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="received"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg transition-all duration-200"
              >
                <Inbox className="w-4 h-4 mr-2" />
                Otrzymane
                {stats.pending_received > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2"
                  >
                    <Badge
                      variant="destructive"
                      className="bg-red-500/20 text-red-300"
                    >
                      {stats.pending_received}
                    </Badge>
                  </motion.div>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="sent"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg transition-all duration-200"
              >
                <Send className="w-4 h-4 mr-2" />
                Wysłane
                <Badge
                  variant="secondary"
                  className="ml-2 bg-gray-500/20 text-gray-300"
                >
                  {sentRequests.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Statystyki
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === "friends" && (
                <TabsContent key="friends-tab" value="friends" className="mt-0 p-6 space-y-4">
                  <motion.div
                    key="friends-content"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                  {filteredContacts.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-white text-xl font-semibold mb-2">
                        {searchQuery
                          ? "Nie znaleziono znajomych"
                          : "Brak znajomych"}
                      </h3>
                      <p className="text-gray-400 mb-6">
                        {searchQuery
                          ? "Spróbuj użyć innej frazy wyszukiwania"
                          : "Dodaj pierwszego znajomego, aby rozpocząć!"}
                      </p>
                      <Button
                        onClick={() => setShowFriendSearch(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Znajdź znajomych
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="grid gap-4"
                      variants={containerVariants}
                    >
                      {filteredContacts.map((contact, index) => (
                        <motion.div
                          key={contact.id}
                          variants={itemVariants}
                          custom={index}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 cursor-pointer transition-all duration-300"
                          onClick={() =>
                            handleSelectContact(contact.contact_user_id)
                          }
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white">
                              {contact.profile?.display_name?.charAt(0) || "?"}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-semibold">
                                {contact.profile?.display_name ||
                                  contact.profile?.username}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                @{contact.profile?.username}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-green-400 border-green-400/50 bg-green-400/10"
                            >
                              <Heart className="w-3 h-3 mr-1" />
                              Znajomy
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  </motion.div>
                </TabsContent>
              )}

              {activeTab === "received" && (
                <TabsContent key="received-tab" value="received" className="mt-0 p-6 space-y-4">
                  <motion.div
                    key="received-content"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                  {receivedRequests.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-24 h-24 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Inbox className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-white text-xl font-semibold mb-2">
                        Brak nowych zaproszeń
                      </h3>
                      <p className="text-gray-400">
                        Gdy ktoś wyśle Ci zaproszenie, pojawi się tutaj
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="space-y-4"
                      variants={containerVariants}
                    >
                      {receivedRequests.map((request, index) => (
                        <motion.div
                          key={request.id}
                          variants={itemVariants}
                          custom={index}
                        >
                          <EnhancedFriendRequestCard
                            request={request}
                            type="received"
                            onAccept={acceptFriendRequest}
                            onReject={rejectFriendRequest}
                            onDelete={deleteFriendRequest}
                            isProcessing={isProcessing(request.id)}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  </motion.div>
                </TabsContent>
              )}

              {activeTab === "sent" && (
                <TabsContent key="sent-tab" value="sent" className="mt-0 p-6 space-y-4">
                  <motion.div
                    key="sent-content"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                  {sentRequests.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Send className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-white text-xl font-semibold mb-2">
                        Brak wysłanych zaproszeń
                      </h3>
                      <p className="text-gray-400">
                        Zaproś kogoś do znajomych!
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="space-y-4"
                      variants={containerVariants}
                    >
                      {sentRequests.map((request, index) => (
                        <motion.div
                          key={request.id}
                          variants={itemVariants}
                          custom={index}
                        >
                          <EnhancedFriendRequestCard
                            request={request}
                            type="sent"
                            onDelete={deleteFriendRequest}
                            isProcessing={isProcessing(request.id)}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  </motion.div>
                </TabsContent>
              )}

              {activeTab === "stats" && (
                <TabsContent key="stats-tab" value="stats" className="mt-0 p-6 space-y-6">
                  <motion.div
                    key="stats-content"
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="grid gap-6"
                  >
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        title: "Znajomi",
                        value: contacts.length,
                        icon: Users,
                        color: "from-blue-500 to-blue-600",
                      },
                      {
                        title: "Oczekujące",
                        value: stats.pending_received,
                        icon: Clock,
                        color: "from-yellow-500 to-orange-600",
                      },
                      {
                        title: "Wysłane",
                        value: stats.total_sent,
                        icon: Send,
                        color: "from-purple-500 to-purple-600",
                      },
                      {
                        title: "Skuteczność",
                        value: `${stats.success_rate.toFixed(0)}%`,
                        icon: TrendingUp,
                        color: "from-green-500 to-green-600",
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.title}
                        variants={itemVariants}
                        custom={index}
                        whileHover={{ scale: 1.05 }}
                      >
                        <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-gray-400 text-sm">
                                  {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-white">
                                  {stat.value}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r",
                                  stat.color,
                                )}
                              >
                                <stat.icon className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Activity Chart Placeholder */}
                  <motion.div variants={itemVariants}>
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Zap className="w-5 h-5 mr-2" />
                          Aktywność znajomości
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-32 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                          <p className="text-gray-400">
                            Wykres aktywności (wkrótce)
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </div>

      {/* Enhanced Friend Search Modal */}
      <EnhancedFriendSearch
        isOpen={showFriendSearch}
        onClose={() => setShowFriendSearch(false)}
      />
    </motion.div>
  );
};

export default EnhancedContactsScreen;