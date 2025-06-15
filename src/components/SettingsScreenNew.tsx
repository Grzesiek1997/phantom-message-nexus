
import React, { useState } from 'react';
import { ArrowLeft, User, Shield, Bell, Key, Info, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import ProfileSettings from './settings/ProfileSettings';
import PrivacySettings from './settings/PrivacySettings';
import NotificationSettings from './settings/NotificationSettings';
import TwoFactorSettings from './settings/TwoFactorSettings';
import AboutSettings from './settings/AboutSettings';

type SettingsView = 'main' | 'profile' | 'privacy' | 'notifications' | 'two-factor' | 'about';

interface SettingsScreenNewProps {
  onGoBack?: () => void;
}

const SettingsScreenNew: React.FC<SettingsScreenNewProps> = ({ onGoBack }) => {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGoBack = () => {
    if (currentView !== 'main') {
      setCurrentView('main');
    } else if (onGoBack) {
      onGoBack();
    }
  };

  const renderSettingsView = () => {
    switch (currentView) {
      case 'profile':
        return <ProfileSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'two-factor':
        return <TwoFactorSettings />;
      case 'about':
        return <AboutSettings />;
      default:
        return (
          <div className="p-6 space-y-6">
            {/* Profile Section */}
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user?.user_metadata?.display_name?.charAt(0) || user?.user_metadata?.username?.charAt(0) || '?'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">
                  {user?.user_metadata?.display_name || user?.user_metadata?.username || 'Użytkownik'}
                </h3>
                <p className="text-gray-400 text-sm">
                  @{user?.user_metadata?.username || 'username'}
                </p>
              </div>
              <Button
                onClick={() => setCurrentView('profile')}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Edytuj
              </Button>
            </div>

            {/* Settings Menu */}
            <div className="space-y-2">
              <SettingsMenuItem
                icon={<User className="w-5 h-5 text-blue-400" />}
                title="Profil"
                description="Zarządzaj swoimi danymi osobowymi"
                onClick={() => setCurrentView('profile')}
              />
              
              <SettingsMenuItem
                icon={<Shield className="w-5 h-5 text-green-400" />}
                title="Prywatność"
                description="Kontroluj widoczność i prywatność"
                onClick={() => setCurrentView('privacy')}
              />
              
              <SettingsMenuItem
                icon={<Bell className="w-5 h-5 text-yellow-400" />}
                title="Powiadomienia"
                description="Konfiguruj powiadomienia"
                onClick={() => setCurrentView('notifications')}
              />
              
              <SettingsMenuItem
                icon={<Key className="w-5 h-5 text-purple-400" />}
                title="Weryfikacja dwuetapowa"
                description="Dodatkowe zabezpieczenie konta"
                onClick={() => setCurrentView('two-factor')}
              />
              
              <SettingsMenuItem
                icon={<Info className="w-5 h-5 text-indigo-400" />}
                title="O aplikacji"
                description="Informacje o SecureChat"
                onClick={() => setCurrentView('about')}
              />
            </div>

            {/* Sign Out */}
            <div className="pt-4 border-t border-white/10">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full border-red-500 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Wyloguj się
              </Button>
            </div>
          </div>
        );
    }
  };

  const SettingsMenuItem = ({ 
    icon, 
    title, 
    description, 
    onClick 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left"
    >
      {icon}
      <div className="flex-1">
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="flex items-center p-6 border-b border-white/10">
        <Button
          onClick={handleGoBack}
          variant="ghost"
          size="icon"
          className="mr-3 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">
          {currentView === 'main' ? 'Ustawienia' : 
           currentView === 'profile' ? 'Profil' :
           currentView === 'privacy' ? 'Prywatność' :
           currentView === 'notifications' ? 'Powiadomienia' :
           currentView === 'two-factor' ? 'Weryfikacja 2FA' :
           currentView === 'about' ? 'O aplikacji' : 'Ustawienia'}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderSettingsView()}
      </div>
    </div>
  );
};

export default SettingsScreenNew;
