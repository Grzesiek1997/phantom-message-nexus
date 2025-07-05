
import React from 'react';
import { UserStatus } from '@/hooks/useUserStatus';

interface UserStatusIndicatorProps {
  status: UserStatus;
  size?: 'sm' | 'md' | 'lg';
}

const UserStatusIndicator: React.FC<UserStatusIndicatorProps> = ({ 
  status, 
  size = 'md' 
}) => {
  const getStatusColor = () => {
    switch (status.status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-2 h-2';
      case 'md': return 'w-3 h-3';
      case 'lg': return 'w-4 h-4';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'online': return 'Online';
      case 'away': return 'Zaraz wracam';
      case 'busy': return 'Zajęty';
      default: return 'Offline';
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <div className={`${getSizeClass()} ${getStatusColor()} rounded-full border border-gray-700`} />
      {size === 'lg' && (
        <span className="text-xs text-gray-400">{getStatusText()}</span>
      )}
    </div>
  );
};

export default UserStatusIndicator;
