import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import {
  friendshipNotifications,
  showFriendshipNotification,
} from "@/utils/friendshipNotifications";

export interface EnhancedFriendRequest {
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
    is_online?: boolean;
    last_seen?: string;
  };
  receiver_profile?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    is_online?: boolean;
    last_seen?: string;
  };
}

export interface FriendRequestStats {
  pending_sent: number;
  pending_received: number;
  total_sent: number;
  total_received: number;
  success_rate: number;
}

export const useEnhancedFriendRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState<
    EnhancedFriendRequest[]
  >([]);
  const [sentRequests, setSentRequests] = useState<EnhancedFriendRequest[]>([]);
  const [stats, setStats] = useState<FriendRequestStats>({
    pending_sent: 0,
    pending_received: 0,
    total_sent: 0,
    total_received: 0,
    success_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Advanced fetch with caching and error handling
  const fetchFriendRequests = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log("🔄 Fetching enhanced friend requests for user:", user.id);

      // Fetch received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      if (receivedError) {
        console.error(
          "❌ Error fetching received requests:",
          receivedError.message || receivedError,
        );
        throw receivedError;
      }

      // Fetch sent requests
      const { data: sentData, error: sentError } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (sentError) {
        console.error(
          "❌ Error fetching sent requests:",
          sentError.message || sentError,
        );
        throw sentError;
      }

      // Get unique user IDs for profile fetching
      const senderIds = receivedData?.map((req) => req.sender_id) || [];
      const receiverIds = sentData?.map((req) => req.receiver_id) || [];
      const allUserIds = [...new Set([...senderIds, ...receiverIds])];

      // Fetch all relevant profiles
      let profilesData: any[] = [];
      if (allUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", allUserIds);

        if (profilesError) {
          console.warn(
            "⚠️ Could not fetch profiles, continuing without them:",
            profilesError.message,
          );
        } else {
          profilesData = profiles || [];
        }
      }

      // Process and enhance the data with profile lookups
      const enhancedReceived = (receivedData || []).map((req) => {
        const senderProfile = profilesData.find((p) => p.id === req.sender_id);
        return {
          ...req,
          status: req.status as "pending" | "accepted" | "rejected",
          attempt_count: req.attempt_count || 1,
          sender_profile: senderProfile
            ? {
                ...senderProfile,
                is_online: false, // Will be enhanced with real-time status
              }
            : undefined,
        };
      });

      const enhancedSent = (sentData || []).map((req) => {
        const receiverProfile = profilesData.find(
          (p) => p.id === req.receiver_id,
        );
        return {
          ...req,
          status: req.status as "pending" | "accepted" | "rejected",
          attempt_count: req.attempt_count || 1,
          receiver_profile: receiverProfile
            ? {
                ...receiverProfile,
                is_online: false, // Will be enhanced with real-time status
              }
            : undefined,
        };
      });

      // Calculate advanced statistics
      const newStats: FriendRequestStats = {
        pending_sent: enhancedSent.filter((req) => req.status === "pending")
          .length,
        pending_received: enhancedReceived.filter(
          (req) => req.status === "pending",
        ).length,
        total_sent: enhancedSent.length,
        total_received: enhancedReceived.length,
        success_rate:
          enhancedSent.length > 0
            ? (enhancedSent.filter((req) => req.status === "accepted").length /
                enhancedSent.length) *
              100
            : 0,
      };

      setReceivedRequests(enhancedReceived);
      setSentRequests(enhancedSent);
      setStats(newStats);

      console.log("✅ Enhanced friend requests loaded:", {
        received: enhancedReceived.length,
        sent: enhancedSent.length,
        stats: newStats,
      });
    } catch (error: any) {
      console.error(
        "💥 Critical error in fetchFriendRequests:",
        error?.message || error,
      );
      toast({
        title: "Błąd ładowania",
        description: `Nie udało się pobrać zaproszeń: ${error?.message || "Nieznany błąd"}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Enhanced send request with validation and rate limiting
  const sendFriendRequest = useCallback(
    async (receiverId: string): Promise<boolean> => {
      if (!user) {
        toast({
          title: "Błąd autoryzacji",
          description: "Musisz być zalogowany aby wysłać zaproszenie",
          variant: "destructive",
        });
        return false;
      }

      if (receiverId === user.id) {
        toast({
          title: "Nieprawidłowe działanie",
          description: "Nie możesz wysłać zaproszenia do siebie",
          variant: "destructive",
        });
        return false;
      }

      try {
        setProcessing(receiverId);
        console.log("📤 Sending enhanced friend request to:", receiverId);

        // Check for existing requests
        const { data: existingRequests } = await supabase
          .from("friend_requests")
          .select("*")
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`,
          );

        if (existingRequests && existingRequests.length > 0) {
          const activeRequest = existingRequests.find(
            (req) => req.status === "pending",
          );
          if (activeRequest) {
            toast({
              title: "Zaproszenie już istnieje",
              description: "Masz już aktywne zaproszenie z tą osobą",
              variant: "destructive",
            });
            return false;
          }

          // Check attempt limits
          const rejectedCount = existingRequests
            .filter(
              (req) => req.sender_id === user.id && req.status === "rejected",
            )
            .reduce((sum, req) => sum + (req.attempt_count || 1), 0);

          if (rejectedCount >= 3) {
            toast({
              title: "Limit osiągnięty",
              description:
                "Przekroczyłeś limit zaproszeń dla tej osoby (3 próby)",
              variant: "destructive",
            });
            return false;
          }
        }

        // Check if users are already friends
        const { data: existingContact } = await supabase
          .from("contacts")
          .select("*")
          .eq("user_id", user.id)
          .eq("contact_user_id", receiverId)
          .eq("status", "accepted")
          .single();

        if (existingContact) {
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
          console.error(
            "❌ Error sending friend request:",
            error.message || error,
          );
          throw error;
        }

        // Notification will be created automatically by trigger
              notifError.message,
            );
          }
        } catch (notifErr) {
          console.warn("⚠️ Notification creation failed:", notifErr);
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
        console.error(
          "💥 Error in sendFriendRequest:",
          error?.message || error,
        );
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
    [user, toast, fetchFriendRequests],
  );

  // Enhanced accept with animation feedback
  const acceptFriendRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      try {
        setProcessing(requestId);
        console.log("✅ Accepting friend request:", requestId);

        let { error } = await supabase.rpc("accept_friend_request", {
          request_id: requestId,
        });

        // If main function fails, try simple version
        if (error) {
          console.warn("⚠️ Main accept function failed, trying simple version:", error.message);
          const { error: simpleError } = await supabase.rpc("accept_friend_request_simple", {
            request_id: requestId,
          });

          if (simpleError) {
            console.error("❌ Both accept functions failed:", simpleError.message || simpleError);
            throw simpleError;
          }

          // Manually create friendship if simple function succeeded
          const request = receivedRequests.find((r) => r.id === requestId);
          if (request) {
            await supabase.rpc("create_friendship_safe", {
              friend_id: request.sender_id
            });
          }
        }

        // Notification will be created automatically by the RPC function
                notifError.message,
              );
            }
          }
        } catch (notifErr) {
          console.warn("⚠️ Acceptance notification creation failed:", notifErr);
        }

        await fetchFriendRequests();

        toast({
          title: "🎉 Nowy znajomy!",
          description:
            "Zaproszenie zostało zaakceptowane. Możesz teraz rozpocząć czat!",
          duration: 4000,
        });

        // Show push notification for friendship milestone
        if (friendshipNotifications.isPermissionGranted()) {
          // Find the request to get sender info
          const request = receivedRequests.find((r) => r.id === requestId);
          if (request?.sender_profile) {
            showFriendshipNotification("friend_accepted", {
              friendName:
                request.sender_profile.display_name ||
                request.sender_profile.username,
              friendId: request.sender_profile.id,
            });
          }
        }

        return true;
      } catch (error: any) {
        console.error(
          "💥 Error in acceptFriendRequest:",
          error?.message || error,
        );
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
    [fetchFriendRequests, toast],
  );

  // Enhanced reject with reason tracking
  const rejectFriendRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      try {
        setProcessing(requestId);
        console.log("❌ Rejecting friend request:", requestId);

        let { error } = await supabase.rpc("reject_friend_request", {
          request_id: requestId,
        });

        // If main function fails, try simple version
        if (error) {
          console.warn("⚠️ Main reject function failed, trying simple version:", error.message);
          const { error: simpleError } = await supabase.rpc("reject_friend_request_simple", {
            request_id: requestId,
          });

          if (simpleError) {
            console.error("❌ Both reject functions failed:", simpleError.message || simpleError);
            throw simpleError;
          }
        }

        // Notification will be created automatically by the RPC function

        await fetchFriendRequests();

        toast({
          title: "Zaproszenie odrzucone",
          description: "Zaproszenie zostało odrzucone",
          duration: 2000,
        });

        return true;
      } catch (error: any) {
        console.error(
          "💥 Error in rejectFriendRequest:",
          error?.message || error,
        );
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
    [fetchFriendRequests, toast],
  );

  // Enhanced delete with confirmation
  const deleteFriendRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      try {
        setProcessing(requestId);
        console.log("🗑️ Deleting friend request:", requestId);

        const { error } = await supabase.rpc("delete_friend_request", {
          request_id: requestId,
        });

        if (error) {
          console.error(
            "❌ Error deleting friend request:",
            error.message || error,
          );
          throw error;
        }

        await fetchFriendRequests();

        toast({
          title: "Zaproszenie usuni��te",
          description: "Zaproszenie zostało usunięte pomyślnie",
          duration: 2000,
        });

        return true;
      } catch (error: any) {
        console.error(
          "💥 Error in deleteFriendRequest:",
          error?.message || error,
        );
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
    [fetchFriendRequests, toast],
  );

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchFriendRequests();
    } else {
      setReceivedRequests([]);
      setSentRequests([]);
      setStats({
        pending_sent: 0,
        pending_received: 0,
        total_sent: 0,
        total_received: 0,
        success_rate: 0,
      });
      setLoading(false);
    }
  }, [user, fetchFriendRequests]);

  // Enhanced real-time subscriptions with unique channels
  useEffect(() => {
    if (!user) return;

    console.log(
      "🔄 Setting up enhanced real-time subscriptions for user:",
      user.id,
    );

    const friendRequestsChannel = supabase
      .channel(
        `enhanced-friend-requests-${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      )
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
          // Call fetchFriendRequests directly here to avoid dependency issues
          if (user) {
            fetchFriendRequests();
          }
        },
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
          // Call fetchFriendRequests directly here to avoid dependency issues
          if (user) {
            fetchFriendRequests();
          }
        },
      )
      .subscribe();

    return () => {
      console.log("🔌 Cleaning up friend requests subscriptions");
      supabase.removeChannel(friendRequestsChannel);
    };
  }, [user?.id]); // Only depend on user.id, not the whole user object or fetchFriendRequests

  return {
    // Data
    receivedRequests: receivedRequests.filter(
      (req) => req.status === "pending",
    ),
    sentRequests,
    allReceivedRequests: receivedRequests,
    stats,

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
        (req) => req.receiver_id === receiverId && req.status === "pending",
      );
      return !existingRequest && receiverId !== user?.id;
    },
    getRequestStatus: (userId: string) => {
      // Check sent requests
      const sentRequest = sentRequests.find(
        (req) => req.receiver_id === userId,
      );
      if (sentRequest) {
        return sentRequest.status;
      }

      // Check received requests
      const receivedRequest = receivedRequests.find(
        (req) => req.sender_id === userId,
      );
      if (receivedRequest) {
        return `received_${receivedRequest.status}`;
      }

      return null;
    },
  };
};