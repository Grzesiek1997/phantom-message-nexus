
import React from 'react';
import { Bell, Check, CheckCheck, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { acceptFriendRequest, rejectFriendRequest } = useFriendRequests();

  const handleAcceptFriendRequest = async (requestId: string, notificationId: string) => {
    await acceptFriendRequest(requestId);
    await markAsRead(notificationId);
  };

  const handleRejectFriendRequest = async (requestId: string, notificationId: string) => {
    await rejectFriendRequest(requestId);
    await markAsRead(notificationId);
  };

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
            {notifications.some(n => !n.is_read) && (
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
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Brak powiadomień</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {notifications.map((notification) => (
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
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
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
