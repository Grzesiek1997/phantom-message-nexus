
import React, { useState, useEffect } from 'react';
import { Bell, Volume2, VolumeX, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    messages: true,
    friendRequests: true,
    calls: true,
    sounds: true,
    push: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_settings')
        .select('setting_key, setting_value')
        .eq('user_id', user.id)
        .in('setting_key', ['notifications_messages', 'notifications_friend_requests', 'notifications_calls', 'notifications_sounds', 'notifications_push']);

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.setting_key] = item.setting_value === 'true';
          return acc;
        }, {} as any);

        setSettings({
          messages: settingsMap.notifications_messages ?? true,
          friendRequests: settingsMap.notifications_friend_requests ?? true,
          calls: settingsMap.notifications_calls ?? true,
          sounds: settingsMap.notifications_sounds ?? true,
          push: settingsMap.notifications_push ?? true
        });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_key: `notifications_${key}`,
          setting_value: value.toString()
        });

      if (error) {
        throw error;
      }

      setSettings(prev => ({ ...prev, [key]: value }));
      toast({
        title: 'Ustawienia zapisane',
        description: 'Preferencje powiadomień zostały zaktualizowane'
      });
    } catch (error: any) {
      console.error('Error updating notification settings:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować ustawień',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    value, 
    onChange, 
    settingKey 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    value: boolean;
    onChange: (value: boolean) => void;
    settingKey: string;
  }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <h3 className="text-white font-medium">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
      <Button
        onClick={() => {
          onChange(!value);
          updateSetting(settingKey, !value);
        }}
        disabled={saving}
        variant={value ? "default" : "outline"}
        className={
          value
            ? "bg-blue-600 hover:bg-blue-700"
            : "border-gray-500 text-gray-400 hover:bg-white/10"
        }
      >
        {value ? 'Włączone' : 'Wyłączone'}
      </Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Bell className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">Powiadomienia</h2>
      </div>

      <div className="space-y-4">
        <SettingItem
          icon={<Bell className="w-5 h-5 text-blue-400" />}
          title="Wiadomości"
          description="Powiadomienia o nowych wiadomościach"
          value={settings.messages}
          onChange={(value) => setSettings(prev => ({ ...prev, messages: value }))}
          settingKey="messages"
        />

        <SettingItem
          icon={<Bell className="w-5 h-5 text-green-400" />}
          title="Zaproszenia do znajomych"
          description="Powiadomienia o nowych zaproszeniach"
          value={settings.friendRequests}
          onChange={(value) => setSettings(prev => ({ ...prev, friendRequests: value }))}
          settingKey="friendRequests"
        />

        <SettingItem
          icon={<Bell className="w-5 h-5 text-purple-400" />}
          title="Połączenia"
          description="Powiadomienia o przychodzących połączeniach"
          value={settings.calls}
          onChange={(value) => setSettings(prev => ({ ...prev, calls: value }))}
          settingKey="calls"
        />

        <SettingItem
          icon={settings.sounds ? <Volume2 className="w-5 h-5 text-yellow-400" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          title="Dźwięki"
          description="Odtwarzaj dźwięki powiadomień"
          value={settings.sounds}
          onChange={(value) => setSettings(prev => ({ ...prev, sounds: value }))}
          settingKey="sounds"
        />

        <SettingItem
          icon={<Smartphone className="w-5 h-5 text-indigo-400" />}
          title="Powiadomienia push"
          description="Powiadomienia gdy aplikacja jest zamknięta"
          value={settings.push}
          onChange={(value) => setSettings(prev => ({ ...prev, push: value }))}
          settingKey="push"
        />
      </div>
    </div>
  );
};

export default NotificationSettings;
