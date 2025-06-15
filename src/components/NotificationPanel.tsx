
import React from 'react';
import { Bell, Check, CheckCheck, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useFriendRequests } from '@/hooks/friends/useFriendRequests';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const { acceptFriendRequest, rejectFriendRequest, receivedRequests } = useFriendRequests();

  const handleAcceptFriendRequest = async (requestId: string, notificationId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await markAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectFriendRequest = async (requestId: string, notificationId: string) => {
    try {
      await rejectFriendRequest(requestId);
      await markAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  // Create notifications for pending friend requests
  const friendRequestNotifications = receivedRequests.map(request => ({
    id: `friend_request_${request.id}`,
    user_id: request.receiver_id,
    type: 'friend_request' as const,
    title: 'Nowe zaproszenie do znajomych',
    message: `${request.sender_profile?.display_name || request.sender_profile?.username || 'Użytkownik'} chce dodać Cię do znajomych`,
    data: { friend_request_id: request.id, sender_id: request.sender_id },
    is_read: false,
    created_at: request.created_at || new Date().toISOString()
  }));

  // Combine regular notifications with friend request notifications
  const allNotifications = [...notifications, ...friendRequestNotifications].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Powiadomienia</h2>
          </div>
          <div className="flex items-center space-x-2">
            {allNotifications.some(n => !n.is_read) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-gray-400 hover:text-white"
              >
                <CheckCheck className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {allNotifications.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Brak powiadomień</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {allNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.is_read
                      ? 'bg-white/5 border-white/10'
                      : 'bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {notification.type === 'friend_request' && (
                          <UserPlus className="w-4 h-4 text-green-400" />
                        )}
                        <h3 className="text-white font-medium text-sm">
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-2">
                        {notification.message}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: pl
                        })}
                      </p>
                    </div>
                    {!notification.is_read && notification.type !== 'friend_request' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Friend request actions */}
                  {notification.type === 'friend_request' && !notification.is_read && (
                    <div className="flex space-x-2 mt-3">
                      <Button
                        onClick={() => handleAcceptFriendRequest(
                          notification.data?.friend_request_id,
                          notification.id
                        )}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        Akceptuj
                      </Button>
                      <Button
                        onClick={() => handleRejectFriendRequest(
                          notification.data?.friend_request_id,
                          notification.id
                        )}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        Odrzuć
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
