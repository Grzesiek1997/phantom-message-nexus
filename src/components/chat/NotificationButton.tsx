
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface NotificationButtonProps {
  unreadCount: number;
  onShowNotifications: () => void;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  unreadCount,
  onShowNotifications
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onShowNotifications}
      className="text-white hover:bg-white/10 relative"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );
};

export default NotificationButton;
