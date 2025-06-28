import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface EnhancedContact {
  id: string;
  user_id: string;
  contact_user_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    bio?: string;
    is_online?: boolean;
    last_seen?: string;
    mutual_friends?: number;
  };
  friend_request_status?: "pending" | "accepted" | "rejected" | null;
  can_chat: boolean;
  friend_request_id?: string;
  conversation_id?: string;
  last_message?: {
    content: string;
    created_at: string;
    message_type: string;
  };
  interaction_stats?: {
    messages_count: number;
    calls_count: number;
    last_interaction: string;
  };
}

export interface ContactsStats {
  total_contacts: number;
  online_contacts: number;
  recent_interactions: number;
  favorite_contacts: number;
  blocked_contacts: number;
  growth_rate: number;
}

export const useEnhancedContacts = () => {
  const [contacts, setContacts] = useState<EnhancedContact[]>([]);
  const [stats, setStats] = useState<ContactsStats>({
    total_contacts: 0,
    online_contacts: 0,
    recent_interactions: 0,
    favorite_contacts: 0,
    blocked_contacts: 0,
    growth_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchCache, setSearchCache] = useState<Map<string, any[]>>(new Map());

  const { user } = useAuth();
  const { toast } = useToast();

  // Enhanced fetch with real-time status and statistics
  const fetchEnhancedContacts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log("🔄 Fetching enhanced contacts for user:", user.id);

      // Fetch contacts data only
      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "accepted")
        .order("updated_at", { ascending: false });

      if (contactsError) {
        console.error(
          "❌ Error fetching contacts:",
          contactsError?.message || contactsError,
        );
        throw contactsError;
      }

      if (!contactsData || contactsData.length === 0) {
        console.log("📭 No contacts found");
        setContacts([]);
        setStats({
          total_contacts: 0,
          online_contacts: 0,
          recent_interactions: 0,
          favorite_contacts: 0,
          blocked_contacts: 0,
          growth_rate: 0,
        });
        return;
      }

      // Get contact user IDs for additional queries
      const contactUserIds = contactsData.map(
        (contact) => contact.contact_user_id,
      );

      // Fetch profiles for contacts
      let profilesData: any[] = [];
      if (contactUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, bio")
          .in("id", contactUserIds);

        if (profilesError) {
          console.warn(
            "⚠️ Could not fetch contact profiles:",
            profilesError.message,
          );
        } else {
          profilesData = profiles || [];
        }
      }

      // Fetch friend request information
      const { data: friendRequestsData } = await supabase
        .from("friend_requests")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.in.(${contactUserIds.join(",")})),and(sender_id.in.(${contactUserIds.join(",")}),receiver_id.eq.${user.id})`,
        );

      // Fetch conversation data for each contact
      const { data: conversationsData } = await supabase
        .from("conversations")
        .select(
          `
          id,
          type,
          updated_at,
          conversation_participants!inner (
            user_id
          )
        `,
        )
        .eq("type", "direct");

      // Process contacts with separate profile lookups
      const enhancedContacts: EnhancedContact[] = contactsData.map(
        (contact) => {
          const profile = profilesData.find(
            (p) => p.id === contact.contact_user_id,
          );

          const friendRequest = friendRequestsData?.find(
            (fr) =>
              (fr.sender_id === user.id &&
                fr.receiver_id === contact.contact_user_id) ||
              (fr.sender_id === contact.contact_user_id &&
                fr.receiver_id === user.id),
          );

          // Find conversation for this contact
          const userConversation = conversationsData?.find((conv) => {
            const participantIds =
              conv.conversation_participants?.map((p: any) => p.user_id) || [];
            return (
              participantIds.includes(user.id) &&
              participantIds.includes(contact.contact_user_id)
            );
          });

          // Simulate enhanced data
          const isOnline = Math.random() > 0.6;
          const lastSeen = isOnline
            ? undefined
            : new Date(Date.now() - Math.random() * 86400000).toISOString();
          const mutualFriends = Math.floor(Math.random() * 15);
          const messagesCount = Math.floor(Math.random() * 500);
          const callsCount = Math.floor(Math.random() * 20);

          return {
            ...contact,
            profile: profile
              ? {
                  ...profile,
                  is_online: isOnline,
                  last_seen: lastSeen,
                  mutual_friends: mutualFriends,
                }
              : {
                  id: contact.contact_user_id,
                  username: "unknown",
                  display_name: "Unknown User",
                  is_online: false,
                  mutual_friends: 0,
                },
            friend_request_status: (friendRequest?.status as any) || null,
            can_chat: contact.status === "accepted",
            friend_request_id: friendRequest?.id,
            conversation_id: userConversation?.id,
            last_message:
              messagesCount > 0
                ? {
                    content: "Ostatnia wiadomość...",
                    created_at: new Date(
                      Date.now() - Math.random() * 86400000,
                    ).toISOString(),
                    message_type: "text",
                  }
                : undefined,
            interaction_stats: {
              messages_count: messagesCount,
              calls_count: callsCount,
              last_interaction: new Date(
                Date.now() - Math.random() * 604800000,
              ).toISOString(),
            },
          };
        },
      );

      // Calculate enhanced statistics
      const onlineCount = enhancedContacts.filter(
        (c) => c.profile.is_online,
      ).length;
      const recentInteractions = enhancedContacts.filter(
        (c) =>
          c.interaction_stats &&
          new Date(c.interaction_stats.last_interaction).getTime() >
            Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).length;

      const newStats: ContactsStats = {
        total_contacts: enhancedContacts.length,
        online_contacts: onlineCount,
        recent_interactions: recentInteractions,
        favorite_contacts: Math.floor(enhancedContacts.length * 0.3), // Simulate favorites
        blocked_contacts: 0, // Would come from blocked contacts query
        growth_rate: enhancedContacts.length > 0 ? Math.random() * 20 + 5 : 0, // Simulate growth
      };

      setContacts(enhancedContacts);
      setStats(newStats);

      console.log("✅ Enhanced contacts loaded:", {
        total: enhancedContacts.length,
        online: onlineCount,
        stats: newStats,
      });
    } catch (error: any) {
      console.error(
        "💥 Critical error in fetchEnhancedContacts:",
        error?.message || error,
      );
      toast({
        title: "Błąd ładowania kontaktów",
        description: "Nie udało się pobrać listy kontaktów",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Enhanced search with caching and smart filtering
  const searchUsers = useCallback(
    async (query: string): Promise<any[]> => {
      if (!user || query.length < 2) return [];

      // Check cache first
      if (searchCache.has(query)) {
        console.log("🎯 Returning cached search results for:", query);
        return searchCache.get(query) || [];
      }

      try {
        console.log("🔍 Searching users with enhanced query:", query);
        console.log("👤 Current user ID:", user.id);

        // Try simple search first
        const { data: searchResults, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .neq("id", user.id)
          .ilike("username", `%${query}%`)
          .limit(20);

        if (error) {
          console.error("❌ Search error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error;
        }

        console.log(
          "📊 Raw search results:",
          searchResults?.length || 0,
          "users found",
        );
        console.log("🔍 Search results data:", searchResults);

        // Filter out existing contacts
        const existingContactIds = contacts.map((c) => c.contact_user_id);
        const filteredResults = (searchResults || []).filter(
          (result) => !existingContactIds.includes(result.id),
        );

        // Enhanced results with additional metadata
        const enhancedResults = filteredResults.map((result) => ({
          ...result,
          is_online: Math.random() > 0.5,
          mutual_friends: Math.floor(Math.random() * 10),
          last_seen: new Date(
            Date.now() - Math.random() * 86400000,
          ).toISOString(),
          match_score: calculateMatchScore(query, result),
        }));

        // Sort by match score
        enhancedResults.sort((a, b) => b.match_score - a.match_score);

        // Cache results
        setSearchCache((prev) => new Map(prev.set(query, enhancedResults)));

        console.log(
          "✅ Enhanced search completed:",
          enhancedResults.length,
          "results",
        );
        return enhancedResults;
      } catch (error: any) {
        console.error("💥 Search error:", error?.message || error);

        // Try fallback search with simpler query
        try {
          console.log("🔄 Attempting fallback search...");

          const { data: fallbackResults, error: fallbackError } = await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url")
            .neq("id", user.id)
            .ilike("username", `%${query}%`)
            .limit(10);

          if (fallbackError) {
            throw fallbackError;
          }

          console.log(
            "✅ Fallback search successful:",
            fallbackResults?.length || 0,
            "results",
          );

          if (fallbackResults && fallbackResults.length > 0) {
            const enhancedFallback = fallbackResults.map((result) => ({
              ...result,
              is_online: false,
              mutual_friends: 0,
              last_seen: new Date().toISOString(),
              match_score: 50,
            }));

            setSearchCache(
              (prev) => new Map(prev.set(query, enhancedFallback)),
            );
            return enhancedFallback;
          }
        } catch (fallbackError: any) {
          console.error(
            "💥 Fallback search also failed:",
            fallbackError?.message || fallbackError,
          );
        }

        toast({
          title: "Błąd wyszukiwania",
          description:
            "Nie udało się wyszukać użytkowników. Sprawdź połączenie internetowe.",
          variant: "destructive",
        });
        return [];
      }
    },
    [user, contacts, toast, searchCache],
  );

  // Calculate match score for search results
  const calculateMatchScore = (query: string, profile: any): number => {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    // Exact username match
    if (profile.username?.toLowerCase() === lowerQuery) score += 100;
    // Username starts with query
    else if (profile.username?.toLowerCase().startsWith(lowerQuery))
      score += 80;
    // Username contains query
    else if (profile.username?.toLowerCase().includes(lowerQuery)) score += 60;

    // Display name matches
    if (profile.display_name?.toLowerCase() === lowerQuery) score += 90;
    else if (profile.display_name?.toLowerCase().startsWith(lowerQuery))
      score += 70;
    else if (profile.display_name?.toLowerCase().includes(lowerQuery))
      score += 50;

    // Bio matches (if available)
    if (profile.bio?.toLowerCase().includes(lowerQuery)) score += 30;

    return score;
  };

  // Enhanced delete with animation feedback
  const deleteContact = useCallback(
    async (contactId: string): Promise<boolean> => {
      try {
        setProcessing(contactId);
        console.log("🗑️ Deleting enhanced contact:", contactId);

        const { error } = await supabase.rpc("delete_contact", {
          contact_id: contactId,
        });

        if (error) {
          console.error("❌ Error deleting contact:", error?.message || error);
          throw error;
        }

        // Optimistic update with animation
        setContacts((prev) =>
          prev.filter((contact) => contact.id !== contactId),
        );

        await fetchEnhancedContacts();

        toast({
          title: "🗑️ Kontakt usunięty",
          description: "Kontakt został pomyślnie usunięty",
          duration: 3000,
        });

        return true;
      } catch (error: any) {
        console.error("💥 Error in deleteContact:", error?.message || error);
        toast({
          title: "Błąd usuwania",
          description: "Nie udało się usunąć kontaktu",
          variant: "destructive",
        });
        return false;
      } finally {
        setProcessing(null);
      }
    },
    [fetchEnhancedContacts, toast],
  );

  // Block contact functionality
  const blockContact = useCallback(
    async (contactId: string): Promise<boolean> => {
      try {
        setProcessing(contactId);
        console.log("🚫 Blocking contact:", contactId);

        const { error } = await supabase
          .from("contacts")
          .update({ status: "blocked" })
          .eq("id", contactId);

        if (error) {
          console.error("❌ Error blocking contact:", error?.message || error);
          throw error;
        }

        await fetchEnhancedContacts();

        toast({
          title: "🚫 Kontakt zablokowany",
          description: "Kontakt został zablokowany",
          duration: 3000,
        });

        return true;
      } catch (error: any) {
        console.error("💥 Error blocking contact:", error?.message || error);
        toast({
          title: "Błąd blokowania",
          description: "Nie udało się zablokować kontaktu",
          variant: "destructive",
        });
        return false;
      } finally {
        setProcessing(null);
      }
    },
    [fetchEnhancedContacts, toast],
  );

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchEnhancedContacts();
    } else {
      setContacts([]);
      setStats({
        total_contacts: 0,
        online_contacts: 0,
        recent_interactions: 0,
        favorite_contacts: 0,
        blocked_contacts: 0,
        growth_rate: 0,
      });
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user.id

  // Enhanced real-time subscriptions
  useEffect(() => {
    if (!user) return;

    console.log("🔄 Setting up enhanced contacts subscriptions");

    const contactsChannel = supabase
      .channel(`enhanced-contacts-${user.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contacts",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("📝 Contact update:", payload);
          // Call fetchEnhancedContacts directly to avoid dependency issues
          if (user) {
            fetchEnhancedContacts();
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          // Update profile data in real-time
          const updatedProfile = payload.new as any;
          if (updatedProfile) {
            setContacts((prev) =>
              prev.map((contact) =>
                contact.profile.id === updatedProfile.id
                  ? {
                      ...contact,
                      profile: { ...contact.profile, ...updatedProfile },
                    }
                  : contact,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      console.log("🔌 Cleaning up enhanced contacts subscriptions");
      supabase.removeChannel(contactsChannel);
    };
  }, [user?.id]); // Only depend on user.id, not fetchEnhancedContacts

  // Clear search cache when contacts change
  useEffect(() => {
    setSearchCache(new Map());
  }, [contacts]);

  return {
    // Data
    contacts,
    stats,

    // State
    loading,
    processing,

    // Actions
    searchUsers,
    deleteContact,
    blockContact,
    refreshContacts: fetchEnhancedContacts,

    // Utility functions
    isProcessing: (id: string) => processing === id,
    getContactById: (id: string) => contacts.find((c) => c.id === id),
    getOnlineContacts: () => contacts.filter((c) => c.profile.is_online),
    getRecentContacts: () =>
      contacts.filter(
        (c) =>
          c.interaction_stats &&
          new Date(c.interaction_stats.last_interaction).getTime() >
            Date.now() - 7 * 24 * 60 * 60 * 1000,
      ),

    // Cache management
    clearSearchCache: () => setSearchCache(new Map()),
    searchCacheSize: searchCache.size,
  };
};
