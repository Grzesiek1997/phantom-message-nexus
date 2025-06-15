
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AppHeaderProps {
  totalUnreadCount: number;
  onNotificationClick: () => void;
  onSignOut: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  totalUnreadCount,
  onNotificationClick,
  onSignOut
}) => {
  const { user } = useAuth();

  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">🛡️</span>
          </div>
          <h1 className="text-xl font-bold text-white">SecureChat Quantum - Make Gibek</h1>
          {user && (
            <div className="text-sm text-gray-300">
              Zalogowany jako: <span className="text-blue-400">{user.email || user.user_metadata?.username}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNotificationClick}
            className={`text-white hover:bg-white/10 relative ${
              totalUnreadCount > 0 ? 'animate-pulse' : ''
            }`}
            title="Powiadomienia"
          >
            <Bell className={`w-4 h-4 ${totalUnreadCount > 0 ? 'text-red-400' : 'text-white'}`} />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </Button>
          
          <Button
            onClick={onSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg transition-colors shadow-lg border-2 border-red-500 hover:border-red-400"
            title="Wyloguj się"
          >
            <LogOut className="w-4 h-4 mr-2" />
            WYLOGUJ
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
