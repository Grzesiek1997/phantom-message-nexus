
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Shield, Palette, Bell, Wallet, Eye, EyeOff, Upload, Smartphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppSettings {
  appName: string;
  appIcon: string;
  isHidden: boolean;
  isGhostMode: boolean;
  soundEnabled: boolean;
  notificationSound: string;
  vibrationEnabled: boolean;
  autoDeleteMessages: boolean;
  deleteAfterHours: number;
  darkMode: boolean;
  language: string;
  fontSize: string;
}

const predefinedIcons = [
  { name: 'Calculator', icon: '🧮', description: 'Kalkulator' },
  { name: 'Notes', icon: '📝', description: 'Notatki' },
  { name: 'Weather', icon: '🌤️', description: 'Pogoda' },
  { name: 'Calendar', icon: '📅', description: 'Kalendarz' },
  { name: 'Clock', icon: '⏰', description: 'Zegar' },
  { name: 'Camera', icon: '📷', description: 'Aparat' },
  { name: 'Music', icon: '🎵', description: 'Muzyka' },
  { name: 'Maps', icon: '🗺️', description: 'Mapy' },
  { name: 'Settings', icon: '⚙️', description: 'Ustawienia' },
  { name: 'Ghost', icon: '👻', description: 'Tryb duchowy' }
];

const SettingsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>({
    appName: 'SecureChat',
    appIcon: '💬',
    isHidden: false,
    isGhostMode: false,
    soundEnabled: true,
    notificationSound: 'default',
    vibrationEnabled: true,
    autoDeleteMessages: true,
    deleteAfterHours: 24,
    darkMode: true,
    language: 'pl',
    fontSize: 'medium'
  });

  const isAdmin = user?.email === '97gibek@gmail.com';

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Ustawienia zapisane',
        description: 'Twoje ustawienia zostały pomyślnie zapisane'
      });

      // Aktualizuj tytuł aplikacji i favicon
      document.title = settings.isGhostMode ? '' : settings.appName;
      updateFavicon(settings.appIcon);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Błąd zapisywania',
        description: 'Nie udało się zapisać ustawień',
        variant: 'destructive'
      });
    }
  };

  const updateFavicon = (icon: string) => {
    if (settings.isGhostMode) {
      // Usuń favicon w trybie ghost
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = 'data:,';
      return;
    }

    // Utwórz canvas do wygenerowania favicon z emoji
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = '24px Arial';
      ctx.fillText(icon, 4, 24);
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = canvas.toDataURL();
      }
    }
  };

  const handleIconSelect = (icon: string) => {
    setSettings(prev => ({ ...prev, appIcon: icon }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSettings(prev => ({ ...prev, appIcon: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Ustawienia SecureChat</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="privacy">Prywatność</TabsTrigger>
            <TabsTrigger value="appearance">Wygląd</TabsTrigger>
            <TabsTrigger value="notifications">Powiadomienia</TabsTrigger>
            <TabsTrigger value="security">Bezpieczeństwo</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Ukrywanie Aplikacji
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Tryb ukryty</label>
                    <p className="text-sm text-gray-600">Zmienia nazwę i ikonę aplikacji</p>
                  </div>
                  <Switch
                    checked={settings.isHidden}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isHidden: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Tryb duchowy</label>
                    <p className="text-sm text-gray-600">Usuwa nazwę i ikonę aplikacji</p>
                  </div>
                  <Switch
                    checked={settings.isGhostMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isGhostMode: checked }))}
                  />
                </div>

                {!settings.isGhostMode && (
                  <>
                    <div>
                      <label className="font-medium">Nazwa aplikacji</label>
                      <Input
                        value={settings.appName}
                        onChange={(e) => setSettings(prev => ({ ...prev, appName: e.target.value }))}
                        placeholder="Wpisz nazwę aplikacji"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <label className="font-medium">Ikona aplikacji</label>
                      <div className="mt-2 space-y-4">
                        <div className="grid grid-cols-5 gap-2">
                          {predefinedIcons.map((icon) => (
                            <Button
                              key={icon.name}
                              variant={settings.appIcon === icon.icon ? "default" : "outline"}
                              onClick={() => handleIconSelect(icon.icon)}
                              className="h-16 text-2xl"
                              title={icon.description}
                            >
                              {icon.icon}
                            </Button>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Upload className="w-4 h-4" />
                          <label className="cursor-pointer">
                            <span className="text-sm text-blue-600 hover:underline">
                              Załaduj własną ikonę
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Personalizacja
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium">Tryb ciemny</label>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))}
                  />
                </div>

                <div>
                  <label className="font-medium">Rozmiar czcionki</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                    className="mt-2 w-full p-2 border rounded"
                  >
                    <option value="small">Mała</option>
                    <option value="medium">Średnia</option>
                    <option value="large">Duża</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium">Język</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="mt-2 w-full p-2 border rounded"
                  >
                    <option value="pl">Polski</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Powiadomienia
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium">Dźwięki powiadomień</label>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
                  />
                </div>

                <div>
                  <label className="font-medium">Rodzaj dźwięku</label>
                  <select
                    value={settings.notificationSound}
                    onChange={(e) => setSettings(prev => ({ ...prev, notificationSound: e.target.value }))}
                    className="mt-2 w-full p-2 border rounded"
                    disabled={!settings.soundEnabled}
                  >
                    <option value="default">Domyślny</option>
                    <option value="whistle">Gwizdek</option>
                    <option value="bell">Dzwonek</option>
                    <option value="chime">Melodia</option>
                    <option value="silent">Cichy</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="font-medium">Wibracje</label>
                  <Switch
                    checked={settings.vibrationEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, vibrationEnabled: checked }))}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Bezpieczeństwo
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Automatyczne usuwanie wiadomości</label>
                    <p className="text-sm text-gray-600">Wiadomości będą usuwane po określonym czasie</p>
                  </div>
                  <Switch
                    checked={settings.autoDeleteMessages}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoDeleteMessages: checked }))}
                  />
                </div>

                {settings.autoDeleteMessages && (
                  <div>
                    <label className="font-medium">Usuń po (godzinach)</label>
                    <Input
                      type="number"
                      value={settings.deleteAfterHours}
                      onChange={(e) => setSettings(prev => ({ ...prev, deleteAfterHours: parseInt(e.target.value) }))}
                      min="1"
                      max="168"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={saveSettings}>
            Zapisz ustawienia
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminPanel = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-red-600">
          🔒 Panel Administracyjny
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Dostępne tylko dla administratora: 97gibek@gmail.com
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-20 flex flex-col">
            <span className="text-2xl mb-2">👥</span>
            <span>Zarządzaj użytkownikami</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col">
            <span className="text-2xl mb-2">📊</span>
            <span>Statystyki</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col">
            <span className="text-2xl mb-2">🔧</span>
            <span>Konfiguracja serwera</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col">
            <span className="text-2xl mb-2">🚫</span>
            <span>Moderacja</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPanel;
