import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface FixedFriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  attempt_count: number;
  created_at: string;
  updated_at: string;
  sender_profile?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  receiver_profile?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export const useFixedFriendRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState<FixedFriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FixedFriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  console.log("🔄 useFixedFriendRequests hook initialized for user:", user?.id);

  const fetchFriendRequests = useCallback(async () => {
    if (!user) {
      console.log("❌ No user found, skipping fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("📥 Fetching friend requests for user:", user.id);

      // Fetch received requests (all statuses)
      const { data: receivedData, error: receivedError } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      if (receivedError) {
        console.error("❌ Error fetching received requests:", receivedError);
        throw receivedError;
      }

      console.log("📨 Raw received requests:", receivedData);

      // Fetch sent requests (all statuses)
      const { data: sentData, error: sentError } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (sentError) {
        console.error("❌ Error fetching sent requests:", sentError);
        throw sentError;
      }

      console.log("📤 Raw sent requests:", sentData);

      // Get unique user IDs for profile fetching
      const senderIds = receivedData?.map((req) => req.sender_id) || [];
      const receiverIds = sentData?.map((req) => req.receiver_id) || [];
      const allUserIds = [...new Set([...senderIds, ...receiverIds])];

      console.log("👥 Fetching profiles for users:", allUserIds);

      // Fetch all relevant profiles
      let profilesData: any[] = [];
      if (allUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", allUserIds);

        if (profilesError) {
          console.warn("⚠️ Could not fetch profiles:", profilesError);
        } else {
          profilesData = profiles || [];
          console.log("👤 Fetched profiles:", profilesData);
        }
      }

      // Process received requests
      const enhancedReceived = (receivedData || []).map((req) => {
        const senderProfile = profilesData.find((p) => p.id === req.sender_id);
        return {
          ...req,
          status: req.status as "pending" | "accepted" | "rejected",
          attempt_count: req.attempt_count || 1,
          sender_profile: senderProfile,
        };
      });

      // Process sent requests
      const enhancedSent = (sentData || []).map((req) => {
        const receiverProfile = profilesData.find((p) => p.id === req.receiver_id);
        return {
          ...req,
          status: req.status as "pending" | "accepted" | "rejected",
          attempt_count: req.attempt_count || 1,
          receiver_profile: receiverProfile,
        };
      });

      setReceivedRequests(enhancedReceived);
      setSentRequests(enhancedSent);

      console.log("✅ Friend requests loaded successfully:", {
        received: enhancedReceived.length,
        sent: enhancedSent.length,
        pendingReceived: enhancedReceived.filter(r => r.status === 'pending').length,
        pendingSent: enhancedSent.filter(r => r.status === 'pending').length,
      });

    } catch (error: any) {
      console.error("💥 Critical error in fetchFriendRequests:", error);
      toast({
        title: "Błąd ładowania",
        description: `Nie udało się pobrać zaproszeń: ${error?.message || "Nieznany błąd"}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const sendFriendRequest = useCallback(
    async (receiverId: string): Promise<boolean> => {
      if (!user) {
        console.error("❌ No user found, cannot send request");
        toast({
          title: "Błąd autoryzacji",
          description: "Musisz być zalogowany aby wysłać zaproszenie",
          variant: "destructive",
        });
        return false;
      }

      if (receiverId === user.id) {
        console.error("❌ Cannot send request to self");
        toast({
          title: "Nieprawidłowe działanie",
          description: "Nie możesz wysłać zaproszenia do siebie",
          variant: "destructive",
        });
        return false;
      }

      try {
        setProcessing(receiverId);
        console.log("📤 Sending friend request from", user.id, "to", receiverId);

        // Check for existing requests/friendships
        const { data: existingRequests } = await supabase
          .from("friend_requests")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
          );

        console.log("🔍 Existing requests found:", existingRequests);

        if (existingRequests && existingRequests.length > 0) {
          const activeRequest = existingRequests.find(req => req.status === "pending");
          if (activeRequest) {
            console.warn("⚠️ Active request already exists");
            toast({
              title: "Zaproszenie już istnieje",
              description: "Masz już aktywne zaproszenie z tą osobą",
              variant: "destructive",
            });
            return false;
          }

          // Check attempt limits
          const rejectedCount = existingRequests
            .filter(req => req.sender_id === user.id && req.status === "rejected")
            .reduce((sum, req) => sum + (req.attempt_count || 1), 0);

          if (rejectedCount >= 3) {
            console.warn("⚠️ Too many attempts");
            toast({
              title: "Limit osiągnięty",
              description: "Przekroczyłeś limit zaproszeń dla tej osoby (3 próby)",
              variant: "destructive",
            });
            return false;
          }
        }

        // Check if already friends
        const { data: existingContact } = await supabase
          .from("contacts")
          .select("*")
          .eq("user_id", user.id)
          .eq("contact_user_id", receiverId)
          .eq("status", "accepted")
          .single();

        if (existingContact) {
          console.warn("⚠️ Already friends");
          toast({
            title: "Już jesteście znajomymi",
            description: "Ta osoba jest już w Twojej liście znajomych",
            variant: "destructive",
          });
          return false;
        }

        // Send the request
        const { error } = await supabase.from("friend_requests").insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: "pending",
          attempt_count: 1,
        });

        if (error) {
          console.error("❌ Error sending request:", error);
          throw error;
        }

        // Refresh data
        await fetchFriendRequests();

        toast({
          title: "✨ Zaproszenie wysłane!",
          description: "Zaproszenie do znajomych zostało wysłane pomyślnie",
          duration: 3000,
        });

        console.log("✅ Friend request sent successfully");
        return true;
      } catch (error: any) {
        console.error("💥 Error in sendFriendRequest:", error);
        toast({
          title: "Błąd wysyłania",
          description: `Nie udało się wysłać zaproszenia: ${error?.message || "Nieznany błąd"}`,
          variant: "destructive",
        });
        return false;
      } finally {
        setProcessing(null);
      }
    },
    [user, toast, fetchFriendRequests]
  );

  const acceptFriendRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      try {
        setProcessing(requestId);
        console.log("✅ Accepting friend request:", requestId);

        const { error } = await supabase.rpc("accept_friend_request", {
          request_id: requestId,
        });

        if (error) {
          console.error("❌ Error accepting request:", error);
          throw error;
        }

        await fetchFriendRequests();

        toast({
          title: "🎉 Nowy znajomy!",
          description: "Zaproszenie zostało zaakceptowane. Możesz teraz rozpocząć czat!",
          duration: 4000,
        });

        console.log("✅ Friend request accepted successfully");
        return true;
      } catch (error: any) {
        console.error("💥 Error in acceptFriendRequest:", error);
        toast({
          title: "Błąd akceptacji",
          description: `Nie udało się zaakceptować zaproszenia: ${error?.message || "Nieznany błąd"}`,
          variant: "destructive",
        });
        return false;
      } finally {
        setProcessing(null);
      }
    },
    [fetchFriendRequests, toast]
  );

  const rejectFriendRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      try {
        setProcessing(requestId);
        console.log("❌ Rejecting friend request:", requestId);

        const { error } = await supabase.rpc("reject_friend_request", {
          request_id: requestId,
        });

        if (error) {
          console.error("❌ Error rejecting request:", error);
          throw error;
        }

        await fetchFriendRequests();

        toast({
          title: "Zaproszenie odrzucone",
          description: "Zaproszenie zostało odrzucone",
          duration: 2000,
        });

        console.log("✅ Friend request rejected successfully");
        return true;
      } catch (error: any) {
        console.error("💥 Error in rejectFriendRequest:", error);
        toast({
          title: "Błąd odrzucania",
          description: `Nie udało się odrzucić zaproszenia: ${error?.message || "Nieznany błąd"}`,
          variant: "destructive",
        });
        return false;
      } finally {
        setProcessing(null);
      }
    },
    [fetchFriendRequests, toast]
  );

  const deleteFriendRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      try {
        setProcessing(requestId);
        console.log("🗑️ Deleting friend request:", requestId);

        const { error } = await supabase.rpc("delete_friend_request", {
          request_id: requestId,
        });

        if (error) {
          console.error("❌ Error deleting request:", error);
          throw error;
        }

        await fetchFriendRequests();

        toast({
          title: "Zaproszenie usunięte",
          description: "Zaproszenie zostało usunięte pomyślnie",
          duration: 2000,
        });

        console.log("✅ Friend request deleted successfully");
        return true;
      } catch (error: any) {
        console.error("💥 Error in deleteFriendRequest:", error);
        toast({
          title: "Błąd usuwania",
          description: `Nie udało się usunąć zaproszenia: ${error?.message || "Nieznany błąd"}`,
          variant: "destructive",
        });
        return false;
      } finally {
        setProcessing(null);
      }
    },
    [fetchFriendRequests, toast]
  );

  // Initial fetch
  useEffect(() => {
    if (user) {
      console.log("🚀 User found, fetching friend requests");
      fetchFriendRequests();
    } else {
      console.log("❌ No user, clearing data");
      setReceivedRequests([]);
      setSentRequests([]);
      setLoading(false);
    }
  }, [user, fetchFriendRequests]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    console.log("🔄 Setting up real-time subscriptions for user:", user.id);

    const channel = supabase
      .channel(`friend-requests-${user.id}-${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_requests",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("📨 Received request update:", payload);
          fetchFriendRequests();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_requests",
          filter: `sender_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("📤 Sent request update:", payload);
          fetchFriendRequests();
        }
      )
      .subscribe();

    return () => {
      console.log("🔌 Cleaning up friend requests subscriptions");
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchFriendRequests]);

  return {
    // Data
    receivedRequests: receivedRequests.filter(req => req.status === "pending"),
    sentRequests,
    allReceivedRequests: receivedRequests,
    
    // State
    loading,
    processing,
    
    // Actions
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    deleteFriendRequest,
    refreshRequests: fetchFriendRequests,
    
    // Utility functions
    isProcessing: (id: string) => processing === id,
    canSendRequest: (receiverId: string) => {
      const existingRequest = sentRequests.find(
        req => req.receiver_id === receiverId && req.status === "pending"
      );
      return !existingRequest && receiverId !== user?.id;
    },
    getRequestStatus: (userId: string) => {
      const sentRequest = sentRequests.find(req => req.receiver_id === userId);
      if (sentRequest) return sentRequest.status;
      
      const receivedRequest = receivedRequests.find(req => req.sender_id === userId);
      if (receivedRequest) return `received_${receivedRequest.status}`;
      
      return null;
    },
    
    // Stats
    stats: {
      pending_sent: sentRequests.filter(req => req.status === "pending").length,
      pending_received: receivedRequests.filter(req => req.status === "pending").length,
      total_sent: sentRequests.length,
      total_received: receivedRequests.length,
    }
  };
};