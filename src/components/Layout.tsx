import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, HelpCircle, LogOut, Bell } from 'lucide-react';
import SettingsPanel from './SettingsPanel';
import NavigationHelp from './NavigationHelp';
import NotificationPanel from './NotificationPanel';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useFriendRequests } from '@/hooks/friends/useFriendRequests';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { signOut, user } = useAuth();
  const { unreadCount } = useNotifications();
  const { receivedRequests } = useFriendRequests();

  // Calculate total unread notifications including friend requests
  const totalUnreadCount = unreadCount + receivedRequests.length;

  // Add keyboard shortcut for help
  React.useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        setShowHelp(true);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🛡️</span>
            </div>
            <h1 className="text-xl font-bold text-white">SecureChat Quantum</h1>
            {user && (
              <div className="text-sm text-gray-300">
                Zalogowany jako: <span className="text-blue-400">{user.email}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Notification Bell */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
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
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="text-white hover:bg-white/10"
              title="Pomoc (Ctrl+H)"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-white hover:bg-white/10"
              title="Ustawienia"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            {/* Prominent Logout Button */}
            <Button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg transition-colors shadow-lg border-2 border-red-500 hover:border-red-400"
              title="Wyloguj się"
            >
              <LogOut className="w-4 h-4 mr-2" />
              WYLOGUJ
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {children}
      </main>

      {/* Modals */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <NavigationHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
};

export default Layout;
