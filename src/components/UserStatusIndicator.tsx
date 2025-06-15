
import React from 'react';
import { UserStatus } from '@/hooks/useUserStatus';

interface UserStatusIndicatorProps {
  status?: UserStatus;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({ 
  status, 
  size = 'md',
  showText = false 
}) => {
  const getStatusColor = (userStatus: string) => {
    switch (userStatus) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (userStatus: string) => {
    switch (userStatus) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-2 h-2';
      case 'md': return 'w-3 h-3';
      case 'lg': return 'w-4 h-4';
      default: return 'w-3 h-3';
    }
  };

  const userStatus = status?.status || 'offline';
  const lastSeen = status?.last_seen;
  const isRecent = lastSeen && new Date(lastSeen) > new Date(Date.now() - 5 * 60 * 1000); // 5 minutes

  const finalStatus = userStatus === 'offline' && isRecent ? 'away' : userStatus;

  return (
    <div className="flex items-center space-x-2">
      <div className={`rounded-full ${getSizeClasses()} ${getStatusColor(finalStatus)} flex-shrink-0`} />
      {showText && (
        <span className="text-sm text-gray-400">
          {getStatusText(finalStatus)}
          {status?.custom_status && (
            <span className="ml-1 text-gray-500">- {status.custom_status}</span>
          )}
        </span>
      )}
    </div>
  );
};

export default UserStatusIndicator;
