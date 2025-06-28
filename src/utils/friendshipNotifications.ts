// Enhanced Friendship Push Notifications System

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

interface FriendshipNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class EnhancedFriendshipNotifications {
  private static instance: EnhancedFriendshipNotifications;
  private permission: NotificationPermission = {
    granted: false,
    denied: false,
    default: true,
  };
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.initializePermissions();
    this.registerServiceWorker();
  }

  public static getInstance(): EnhancedFriendshipNotifications {
    if (!EnhancedFriendshipNotifications.instance) {
      EnhancedFriendshipNotifications.instance =
        new EnhancedFriendshipNotifications();
    }
    return EnhancedFriendshipNotifications.instance;
  }

  private initializePermissions(): void {
    if ("Notification" in window) {
      const permission = Notification.permission;
      this.permission = {
        granted: permission === "granted",
        denied: permission === "denied",
        default: permission === "default",
      };
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if ("serviceWorker" in navigator) {
      try {
        this.serviceWorkerRegistration =
          await navigator.serviceWorker.register("/sw.js");
        console.log(
          "✅ Service Worker registered for friendship notifications",
        );
      } catch (error) {
        console.error("❌ Service Worker registration failed:", error);
      }
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("⚠️ This browser does not support notifications");
      return false;
    }

    if (this.permission.granted) {
      return true;
    }

    if (this.permission.denied) {
      console.warn(
        "⚠️ Notifications are blocked. Please enable them in browser settings.",
      );
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = {
        granted: permission === "granted",
        denied: permission === "denied",
        default: permission === "default",
      };

      if (this.permission.granted) {
        console.log("✅ Notification permission granted");
        this.showWelcomeNotification();
      }

      return this.permission.granted;
    } catch (error) {
      console.error("❌ Error requesting notification permission:", error);
      return false;
    }
  }

  private showWelcomeNotification(): void {
    this.show({
      title: "🎉 Powiadomienia włączone!",
      body: "Będziesz otrzymywać powiadomienia o nowych zaproszeniach do znajomych",
      icon: "/icon-192x192.png",
      tag: "welcome",
      silent: true,
    });
  }

  public async show(options: FriendshipNotificationOptions): Promise<void> {
    if (!this.permission.granted) {
      console.warn("⚠️ Cannot show notification: permission not granted");
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/icon-192x192.png",
        badge: options.badge || "/icon-72x72.png",
        image: options.image,
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction,
        silent: options.silent,
        vibrate: options.vibrate || [200, 100, 200],
        actions: options.actions,
      });

      // Add click handler
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Handle notification data
        if (options.data?.action) {
          this.handleNotificationAction(options.data.action, options.data);
        }

        notification.close();
      };

      // Auto-close after 10 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

      console.log("✅ Notification shown:", options.title);
    } catch (error) {
      console.error("❌ Error showing notification:", error);
    }
  }

  private handleNotificationAction(action: string, data: any): void {
    switch (action) {
      case "view_request":
        // Navigate to friend requests
        window.location.hash = "#/contacts?tab=received";
        break;
      case "accept_request":
        // Handle accept action
        this.handleAcceptRequest(data.requestId);
        break;
      case "view_profile":
        // Navigate to user profile
        window.location.hash = `#/profile/${data.userId}`;
        break;
      case "start_chat":
        // Navigate to chat
        window.location.hash = `#/chat/${data.conversationId}`;
        break;
      default:
        console.log("Unknown notification action:", action);
    }
  }

  private async handleAcceptRequest(requestId: string): Promise<void> {
    try {
      // This would typically call your friend request acceptance API
      console.log("🤝 Accepting friend request from notification:", requestId);

      // Show success notification
      this.show({
        title: "✅ Zaproszenie zaakceptowane!",
        body: "Nowy znajomy został dodany do Twojej listy",
        icon: "/icon-192x192.png",
        tag: "friend_accepted",
        silent: false,
        vibrate: [200, 100, 200, 100, 200],
      });
    } catch (error) {
      console.error("❌ Error accepting friend request:", error);
    }
  }

  // Specific notification methods for different friendship events
  public showFriendRequestNotification(
    senderName: string,
    senderId: string,
    requestId: string,
  ): void {
    this.show({
      title: "👋 Nowe zaproszenie do znajomych!",
      body: `${senderName} chce dodać Cię do znajomych`,
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      tag: `friend_request_${requestId}`,
      requireInteraction: true,
      vibrate: [300, 100, 300],
      data: {
        action: "view_request",
        requestId,
        senderId,
        senderName,
      },
      actions: [
        {
          action: "accept",
          title: "✅ Akceptuj",
          icon: "/icons/accept.png",
        },
        {
          action: "view",
          title: "👀 Zobacz profil",
          icon: "/icons/view.png",
        },
      ],
    });
  }

  public showFriendAcceptedNotification(
    friendName: string,
    friendId: string,
  ): void {
    this.show({
      title: "🎉 Nowy znajomy!",
      body: `${friendName} zaakceptował/a Twoje zaproszenie do znajomych`,
      icon: "/icon-192x192.png",
      tag: `friend_accepted_${friendId}`,
      vibrate: [200, 100, 200, 100, 200],
      data: {
        action: "start_chat",
        friendId,
        friendName,
      },
    });
  }

  public showFriendOnlineNotification(
    friendName: string,
    friendId: string,
  ): void {
    this.show({
      title: "🟢 Znajomy online",
      body: `${friendName} jest teraz dostępny/a`,
      icon: "/icon-192x192.png",
      tag: `friend_online_${friendId}`,
      silent: true,
      data: {
        action: "start_chat",
        friendId,
        friendName,
      },
    });
  }

  public showMilestoneNotification(milestone: number): void {
    const milestoneEmojis = {
      1: "🥳",
      5: "🎊",
      10: "🏆",
      25: "🌟",
      50: "👑",
      100: "🎯",
    } as const;

    const emoji =
      milestoneEmojis[milestone as keyof typeof milestoneEmojis] || "🎉";

    this.show({
      title: `${emoji} Kamień milowy osiągnięty!`,
      body: `Gratulacje! Masz już ${milestone} znajomych`,
      icon: "/icon-192x192.png",
      tag: `milestone_${milestone}`,
      vibrate: [300, 200, 300, 200, 300],
      data: {
        action: "view_stats",
        milestone,
      },
    });
  }

  public showBirthdayNotification(friendName: string, friendId: string): void {
    this.show({
      title: "🎂 Urodziny znajomego!",
      body: `${friendName} ma dziś urodziny. Złóż życzenia!`,
      icon: "/icon-192x192.png",
      tag: `birthday_${friendId}`,
      requireInteraction: true,
      vibrate: [500, 200, 500],
      data: {
        action: "start_chat",
        friendId,
        friendName,
        special: "birthday",
      },
    });
  }

  public showGroupInviteNotification(
    groupName: string,
    inviterName: string,
    groupId: string,
  ): void {
    this.show({
      title: "👥 Zaproszenie do grupy",
      body: `${inviterName} zaprasza Cię do grupy "${groupName}"`,
      icon: "/icon-192x192.png",
      tag: `group_invite_${groupId}`,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        action: "view_group",
        groupId,
        groupName,
        inviterName,
      },
    });
  }

  // Batch notifications for multiple events
  public showBatchNotification(
    events: Array<{ type: string; data: any }>,
  ): void {
    if (events.length === 0) return;

    const friendRequests = events.filter(
      (e) => e.type === "friend_request",
    ).length;
    const friendAccepted = events.filter(
      (e) => e.type === "friend_accepted",
    ).length;
    const messages = events.filter((e) => e.type === "message").length;

    let title = "📱 Nowe aktywności";
    let body = "";

    const activities = [];
    if (friendRequests > 0)
      activities.push(`${friendRequests} nowych zaproszeń`);
    if (friendAccepted > 0)
      activities.push(`${friendAccepted} zaakceptowanych znajomych`);
    if (messages > 0) activities.push(`${messages} nowych wiadomości`);

    body = activities.join(", ");

    this.show({
      title,
      body,
      icon: "/icon-192x192.png",
      tag: "batch_activities",
      vibrate: [200, 100, 200],
      data: {
        action: "view_activities",
        events,
      },
    });
  }

  // Utility methods
  public isSupported(): boolean {
    return "Notification" in window;
  }

  public isPermissionGranted(): boolean {
    return this.permission.granted;
  }

  public async clearNotifications(tag?: string): Promise<void> {
    if (this.serviceWorkerRegistration) {
      const notifications =
        await this.serviceWorkerRegistration.getNotifications(
          tag ? { tag } : undefined,
        );
      notifications.forEach((notification) => notification.close());
    }
  }

  // Test notification
  public showTestNotification(): void {
    this.show({
      title: "🧪 Test powiadomienia",
      body: "To jest testowe powiadomienie systemu znajomości",
      icon: "/icon-192x192.png",
      tag: "test",
      vibrate: [200, 100, 200],
    });
  }
}

// Export singleton instance
export const friendshipNotifications =
  EnhancedFriendshipNotifications.getInstance();

// Export types for TypeScript
export type {
  FriendshipNotificationOptions,
  NotificationAction,
  NotificationPermission,
};

// Utility functions
export const initializeFriendshipNotifications = async (): Promise<boolean> => {
  const notifications = friendshipNotifications;

  if (!notifications.isSupported()) {
    console.warn("⚠️ Push notifications are not supported in this browser");
    return false;
  }

  if (notifications.isPermissionGranted()) {
    console.log("✅ Friendship notifications already enabled");
    return true;
  }

  console.log("🔔 Requesting notification permissions...");
  return await notifications.requestPermission();
};

export const showFriendshipNotification = (
  type:
    | "friend_request"
    | "friend_accepted"
    | "friend_online"
    | "milestone"
    | "birthday"
    | "group_invite",
  data: any,
): void => {
  const notifications = friendshipNotifications;

  switch (type) {
    case "friend_request":
      notifications.showFriendRequestNotification(
        data.senderName,
        data.senderId,
        data.requestId,
      );
      break;
    case "friend_accepted":
      notifications.showFriendAcceptedNotification(
        data.friendName,
        data.friendId,
      );
      break;
    case "friend_online":
      notifications.showFriendOnlineNotification(
        data.friendName,
        data.friendId,
      );
      break;
    case "milestone":
      notifications.showMilestoneNotification(data.milestone);
      break;
    case "birthday":
      notifications.showBirthdayNotification(data.friendName, data.friendId);
      break;
    case "group_invite":
      notifications.showGroupInviteNotification(
        data.groupName,
        data.inviterName,
        data.groupId,
      );
      break;
    default:
      console.warn("Unknown notification type:", type);
  }
};
