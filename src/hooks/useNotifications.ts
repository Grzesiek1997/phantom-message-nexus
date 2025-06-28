import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Notification {
  id: string;
  user_id: string;
  type: "friend_request" | "friend_accepted" | "message" | "call";
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      // Map database fields to interface fields with proper type casting
      const mappedNotifications: Notification[] = (data || []).map((item) => ({
        id: item.id,
        user_id: item.user_id,
        type:
          (item.type as
            | "friend_request"
            | "friend_accepted"
            | "message"
            | "call") || "message",
        title: item.title || "Powiadomienie",
        message: item.message || "Masz nowe powiadomienie",
        data: item.data,
        is_read: item.is_read || false,
        created_at: item.created_at || new Date().toISOString(),
      }));

      setNotifications(mappedNotifications);

      // Count unread notifications
      const regularUnreadCount = mappedNotifications.filter(
        (n) => !n.is_read,
      ).length;

      // Add friend requests count
      const { data: friendRequests } = await supabase
        .from("friend_requests")
        .select("id")
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      const friendRequestsCount = friendRequests?.length || 0;

      setUnreadCount(regularUnreadCount + friendRequestsCount);
    } catch (error) {
      console.error("Error in fetchNotifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Skip marking friend request notifications as read (they're handled differently)
      if (notificationId.startsWith("friend_request_")) {
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        return;
      }

      await fetchNotifications();
    } catch (error) {
      console.error("Error in markAsRead:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) {
        console.error("Error marking all notifications as read:", error);
        return;
      }

      await fetchNotifications();
    } catch (error) {
      console.error("Error in markAllAsRead:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(
        `notifications-${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          if (user) {
            fetchNotifications();
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friend_requests",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          if (user) {
            fetchNotifications();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // Only depend on user.id, not fetchNotifications

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };
};
