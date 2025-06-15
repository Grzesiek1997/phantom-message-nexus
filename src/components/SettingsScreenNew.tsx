
import React, { useState } from 'react';
import { 
  User, Shield, Bell, Globe, Crown, Info, LogOut, 
  ChevronRight, Moon, Sun, Palette, Database, 
  Smartphone, Headphones, Lock, Eye, UserCheck
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface SettingsItem {
  id: string;
  label: string;
  icon: any;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  badge?: string;
  premium?: boolean;
  section?: string;
}

const SettingsScreenNew: React.FC = () => {
  const { t, changeLanguage, getAvailableLanguages, currentLanguage } = useTranslation();
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);

  const settingsItems: SettingsItem[] = [
    // Profile Section
    {
      id: 'profile',
      label: t('profile'),
      icon: User,
      type: 'navigation',
      section: 'account'
    },
    {
      id: 'privacy',
      label: t('privacy'),
      icon: Shield,
      type: 'navigation',
      section: 'account'
    },
    {
      id: 'notifications',
      label: t('notifications'),
      icon: Bell,
      type: 'toggle',
      value: notifications,
      section: 'account'
    },

    // Premium Section
    {
      id: 'premium',
      label: t('premiumZone'),
      icon: Crown,
      type: 'navigation',
      badge: 'NEW',
      premium: true,
      section: 'premium'
    },
    {
      id: 'themes',
      label: t('customThemes'),
      icon: Palette,
      type: 'navigation',
      premium: true,
      section: 'premium'
    },
    {
      id: 'backup',
      label: t('unlimitedBackup'),
      icon: Database,
      type: 'navigation',
      premium: true,
      section: 'premium'
    },
    {
      id: 'support',
      label: t('prioritySupport'),
      icon: Headphones,
      type: 'navigation',
      premium: true,
      section: 'premium'
    },

    // App Section
    {
      id: 'language',
      label: t('language'),
      icon: Globe,
      type: 'navigation',
      section: 'app'
    },
    {
      id: 'darkmode',
      label: 'Tryb ciemny',
      icon: darkMode ? Moon : Sun,
      type: 'toggle',
      value: darkMode,
      section: 'app'
    },
    {
      id: 'devices',
      label: 'Urządzenia',
      icon: Smartphone,
      type: 'navigation',
      section: 'app'
    },

    // Security Section
    {
      id: 'encryption',
      label: t('advancedEncryption'),
      icon: Lock,
      type: 'navigation',
      premium: true,
      section: 'security'
    },
    {
      id: 'visibility',
      label: 'Widoczność online',
      icon: Eye,
      type: 'toggle',
      value: onlineStatus,
      section: 'security'
    },
    {
      id: 'verification',
      label: 'Weryfikacja dwuetapowa',
      icon: UserCheck,
      type: 'navigation',
      section: 'security'
    },

    // About Section
    {
      id: 'about',
      label: t('about'),
      icon: Info,
      type: 'navigation',
      section: 'about'
    }
  ];

  const sections = [
    { id: 'account', title: 'Konto', items: settingsItems.filter(item => item.section === 'account') },
    { id: 'premium', title: 'Premium', items: settingsItems.filter(item => item.section === 'premium') },
    { id: 'app', title: 'Aplikacja', items: settingsItems.filter(item => item.section === 'app') },
    { id: 'security', title: 'Bezpieczeństwo', items: settingsItems.filter(item => item.section === 'security') },
    { id: 'about', title: 'Informacje', items: settingsItems.filter(item => item.section === 'about') }
  ];

  const handleToggle = (id: string, value: boolean) => {
    switch (id) {
      case 'darkmode':
        setDarkMode(value);
        break;
      case 'notifications':
        setNotifications(value);
        break;
      case 'visibility':
        setOnlineStatus(value);
        break;
    }
  };

  const handleNavigation = (id: string) => {
    console.log(`Navigate to ${id}`);
    // Implement navigation logic
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getUserInitial = () => {
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name.charAt(0).toUpperCase();
    }
    if (user?.user_metadata?.username) {
      return user.user_metadata.username.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.display_name || 
           user?.user_metadata?.username || 
           user?.email || 
           'Usuario';
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header with User Profile */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white mb-6">{t('settings')}</h1>
        
        {/* User Profile Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">{getUserInitial()}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{getUserDisplayName()}</h3>
              <p className="text-gray-300 text-sm">
                {user?.user_metadata?.username ? `@${user.user_metadata.username}` : user?.email}
              </p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-400 text-sm">{t('online')}</span>
              </div>
            </div>
            <button
              onClick={() => handleNavigation('profile')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.id} className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-6 mb-3">
              {section.title}
            </h2>
            
            {section.id === 'premium' && (
              <div className="mx-6 mb-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Crown className="w-8 h-8 text-yellow-400" />
                  <div>
                    <h3 className="text-white font-semibold">SecureChat Premium</h3>
                    <p className="text-gray-300 text-sm">Odblokuj wszystkie funkcje premium</p>
                  </div>
                </div>
                <Button className="w-full mt-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold">
                  Uaktualnij do Premium
                </Button>
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                
                return (
                  <div
                    key={item.id}
                    className={`flex items-center px-6 py-4 hover:bg-white/5 transition-colors ${
                      item.premium ? 'opacity-60' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      item.premium ? 'bg-yellow-500/20' : 'bg-white/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${item.premium ? 'text-yellow-400' : 'text-white'}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{item.label}</span>
                        {item.premium && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                        {item.badge && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.type === 'toggle' ? (
                      <Switch
                        checked={item.value || false}
                        onCheckedChange={(checked) => handleToggle(item.id, checked)}
                        disabled={item.premium}
                      />
                    ) : item.type === 'navigation' ? (
                      <button
                        onClick={() => handleNavigation(item.id)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        disabled={item.premium}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Language Selection */}
        <div className="px-6 mb-6">
          <h3 className="text-white font-medium mb-3">Wybierz język</h3>
          <div className="space-y-2">
            {getAvailableLanguages().map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  currentLanguage === lang.code 
                    ? 'bg-blue-500/20 border border-blue-500/30' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-white font-medium">{lang.name}</span>
                {currentLanguage === lang.code && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <div className="px-6 pb-24">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Wyloguj się
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreenNew;
