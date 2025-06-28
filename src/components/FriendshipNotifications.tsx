import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  UserCheck,
  UserX,
  MessageCircle,
  X,
  Bell,
  Heart,
  Sparkles,
  Gift,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEnhancedFriendRequests } from "@/hooks/useEnhancedFriendRequests";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NotificationData {
  id: string;
  type:
    | "friend_request"
    | "friend_accepted"
    | "friend_rejected"
    | "new_message"
    | "celebration";
  title: string;
  message: string;
  user?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  timestamp: Date;
  read: boolean;
  actionable: boolean;
  celebrationType?: "milestone" | "achievement" | "special";
}

const FriendshipNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();
  const {
    receivedRequests,
    stats,
    acceptFriendRequest,
    rejectFriendRequest,
    isProcessing,
  } = useEnhancedFriendRequests();

  // Generate notifications based on friend requests and achievements
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: NotificationData[] = [];

      // Friend request notifications
      receivedRequests.forEach((request) => {
        if (request.sender_profile) {
          newNotifications.push({
            id: `request-${request.id}`,
            type: "friend_request",
            title: "Nowe zaproszenie do znajomych!",
            message: `${request.sender_profile.display_name || request.sender_profile.username} chce dodać Cię do znajomych`,
            user: request.sender_profile,
            timestamp: new Date(request.created_at),
            read: false,
            actionable: true,
          });
        }
      });

      // Achievement notifications - only if changed
      if (stats.total_contacts > 0) {
        const milestones = [1, 5, 10, 25, 50, 100];
        milestones.forEach((milestone) => {
          if (stats.total_contacts === milestone) {
            const milestoneId = `milestone-${milestone}`;
            // Check if this milestone notification already exists
            const existingMilestone = notifications.find(
              (n) => n.id === milestoneId,
            );
            if (!existingMilestone) {
              newNotifications.push({
                id: milestoneId,
                type: "celebration",
                title: "🎉 Kamień milowy osiągnięty!",
                message: `Gratulacje! Masz już ${milestone} znajomych`,
                timestamp: new Date(),
                read: false,
                actionable: false,
                celebrationType: "milestone",
              });
            }
          }
        });
      }

      // Success rate achievements - only if changed
      if (stats.success_rate >= 80 && stats.total_sent >= 5) {
        const achievementId = "achievement-social";
        const existingAchievement = notifications.find(
          (n) => n.id === achievementId,
        );
        if (!existingAchievement) {
          newNotifications.push({
            id: achievementId,
            type: "celebration",
            title: "👑 Mistrz społeczności!",
            message: `Twoja skuteczność zaproszeń wynosi ${stats.success_rate.toFixed(0)}%`,
            timestamp: new Date(),
            read: false,
            actionable: false,
            celebrationType: "achievement",
          });
        }
      }

      return newNotifications;
    };

    // Only update if there are actual changes
    const newNotifications = generateNotifications();
    const requestIds = receivedRequests.map((r) => r.id);
    const currentRequestIds = notifications
      .filter((n) => n.type === "friend_request")
      .map((n) => n.id.replace("request-", ""));

    // Check if requests have changed
    const requestsChanged =
      JSON.stringify(requestIds.sort()) !==
      JSON.stringify(currentRequestIds.sort());

    if (
      requestsChanged ||
      newNotifications.some((n) => n.type === "celebration")
    ) {
      setNotifications(newNotifications);
    }
  }, [receivedRequests.length, stats.total_contacts, stats.success_rate]);

  const handleAccept = useCallback(
    async (requestId: string) => {
      try {
        const success = await acceptFriendRequest(requestId);
        if (success) {
          // Remove the request notification and add celebration
          setNotifications((prev) => {
            const filtered = prev.filter(
              (n) => n.id !== `request-${requestId}`,
            );
            return [
              ...filtered,
              {
                id: `accepted-${requestId}-${Date.now()}`,
                type: "friend_accepted",
                title: "✨ Nowy znajomy!",
                message:
                  "Zaproszenie zostało zaakceptowane. Możesz teraz rozpocząć czat!",
                timestamp: new Date(),
                read: false,
                actionable: false,
              },
            ];
          });
        }
      } catch (error) {
        console.error("Error accepting friend request:", error);
      }
    },
    [acceptFriendRequest],
  );

  const handleReject = useCallback(
    async (requestId: string) => {
      try {
        const success = await rejectFriendRequest(requestId);
        if (success) {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== `request-${requestId}`),
          );
        }
      } catch (error) {
        console.error("Error rejecting friend request:", error);
      }
    },
    [rejectFriendRequest],
  );

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string, celebrationType?: string) => {
    switch (type) {
      case "friend_request":
        return <UserPlus className="w-5 h-5" />;
      case "friend_accepted":
        return <UserCheck className="w-5 h-5" />;
      case "friend_rejected":
        return <UserX className="w-5 h-5" />;
      case "new_message":
        return <MessageCircle className="w-5 h-5" />;
      case "celebration":
        if (celebrationType === "achievement")
          return <Crown className="w-5 h-5" />;
        if (celebrationType === "special") return <Gift className="w-5 h-5" />;
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "friend_request":
        return "from-blue-500 to-cyan-600";
      case "friend_accepted":
        return "from-green-500 to-emerald-600";
      case "friend_rejected":
        return "from-red-500 to-pink-600";
      case "celebration":
        return "from-purple-500 to-pink-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Przed chwilą";
    if (diffInMinutes < 60) return `${diffInMinutes}m temu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h temu`;
    return `${Math.floor(diffInMinutes / 1440)}d temu`;
  };

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Notification Bell */}
      <motion.div
        className="fixed top-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Button
          onClick={() => setShowNotifications(!showNotifications)}
          className={cn(
            "relative w-12 h-12 rounded-full shadow-lg transition-all duration-300",
            unreadCount > 0
              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              : "bg-white/10 hover:bg-white/20",
          )}
          size="icon"
        >
          <Bell className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-xs font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", duration: 0.5 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 shadow-2xl border-l border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Powiadomienia
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-gray-300 text-sm">
                  {unreadCount > 0
                    ? `${unreadCount} nowych powiadomień`
                    : "Wszystkie przeczytane"}
                </p>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "relative p-4 rounded-xl border transition-all duration-300 cursor-pointer",
                        notification.read
                          ? "bg-white/5 border-white/10 hover:bg-white/10"
                          : "bg-white/10 border-white/20 hover:bg-white/15",
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      {/* Notification Icon */}
                      <div className="flex items-start space-x-3">
                        <div
                          className={cn(
                            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r",
                            getNotificationColor(notification.type),
                          )}
                        >
                          {getNotificationIcon(
                            notification.type,
                            notification.celebrationType,
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-white font-semibold text-sm mb-1">
                                {notification.title}
                              </h3>
                              <p className="text-gray-300 text-sm leading-relaxed">
                                {notification.message}
                              </p>

                              {notification.user && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                                      {notification.user.display_name?.charAt(
                                        0,
                                      ) ||
                                        notification.user.username?.charAt(0) ||
                                        "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-gray-400 text-xs">
                                    {notification.user.display_name ||
                                      notification.user.username}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 ml-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notification.id);
                                }}
                                className="w-6 h-6 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Action Buttons for Friend Requests */}
                          {notification.actionable &&
                            notification.type === "friend_request" && (
                              <div className="flex space-x-2 mt-3">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const requestId = notification.id.replace(
                                      "request-",
                                      "",
                                    );
                                    handleAccept(requestId);
                                  }}
                                  disabled={isProcessing(
                                    notification.id.replace("request-", ""),
                                  )}
                                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs py-2"
                                >
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Akceptuj
                                </Button>

                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const requestId = notification.id.replace(
                                      "request-",
                                      "",
                                    );
                                    handleReject(requestId);
                                  }}
                                  disabled={isProcessing(
                                    notification.id.replace("request-", ""),
                                  )}
                                  variant="outline"
                                  className="flex-1 border-white/20 text-gray-300 hover:text-white hover:bg-white/10 text-xs py-2"
                                >
                                  <UserX className="w-3 h-3 mr-1" />
                                  Odrzuć
                                </Button>
                              </div>
                            )}

                          {/* Timestamp */}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-gray-500 text-xs">
                              {formatTimeAgo(notification.timestamp)}
                            </span>

                            {notification.celebrationType && (
                              <Badge
                                variant="outline"
                                className="text-purple-400 border-purple-400/50 bg-purple-400/10 text-xs"
                              >
                                {notification.celebrationType ===
                                  "milestone" && (
                                  <Sparkles className="w-3 h-3 mr-1" />
                                )}
                                {notification.celebrationType ===
                                  "achievement" && (
                                  <Crown className="w-3 h-3 mr-1" />
                                )}
                                {notification.celebrationType === "special" && (
                                  <Gift className="w-3 h-3 mr-1" />
                                )}
                                {notification.celebrationType === "milestone"
                                  ? "Kamień milowy"
                                  : notification.celebrationType ===
                                      "achievement"
                                    ? "Osiągnięcie"
                                    : "Specjalne"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <Button
                  onClick={() => setNotifications([])}
                  variant="outline"
                  className="w-full border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
                >
                  Wyczyść wszystkie
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FriendshipNotifications;
