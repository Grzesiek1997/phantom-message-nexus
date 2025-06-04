
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Shield, Palette, Bell, Eye, EyeOff, Upload, Smartphone, Bot, Gamepad2, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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
  aiAssistant: boolean;
  smartReply: boolean;
  moodAnalysis: boolean;
  quantumEncryption: boolean;
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
    fontSize: 'medium',
    aiAssistant: false,
    smartReply: false,
    moodAnalysis: false,
    quantumEncryption: false
  });

  const isAdmin = user?.email === '97gibek@gmail.com';

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      // Use localStorage temporarily until database is ready
      const savedSettings = localStorage.getItem(`settings_${user.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      // Use localStorage temporarily until database is ready
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(settings));

      toast({
        title: 'Ustawienia zapisane',
        description: 'Twoje ustawienia zostały pomyślnie zapisane'
      });

      // Apply ghost mode effect
      if (settings.isGhostMode) {
        document.title = '';
        document.body.style.opacity = '0.05';
        updateFavicon('');
        toast({
          title: '👻 TRYB DUCHOWY AKTYWNY',
          description: '⚠️ Aplikacja stała się przezroczysta! Kliknij w to samo miejsce aby ją odnaleźć.',
          duration: 10000
        });
      } else {
        document.title = settings.appName;
        document.body.style.opacity = '1';
        updateFavicon(settings.appIcon);
      }
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
    if (settings.isGhostMode || !icon) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = 'data:,';
      return;
    }

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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>🚀 SecureChat - Centrum Sterowania</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="stealth" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="stealth">🥷 Ukrywanie</TabsTrigger>
            <TabsTrigger value="ai">🤖 AI</TabsTrigger>
            <TabsTrigger value="crypto">🔮 Crypto</TabsTrigger>
            <TabsTrigger value="appearance">🎨 Wygląd</TabsTrigger>
            <TabsTrigger value="notifications">🔔 Powiadomienia</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">👑 Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="stealth" className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-300">
                <Eye className="w-5 h-5 mr-2" />
                🥷 STEALTH MODE - Ukrywanie Aplikacji
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <div>
                    <label className="font-medium text-yellow-300">👻 TRYB DUCHOWY (GHOST MODE)</label>
                    <p className="text-sm text-yellow-200 mt-2">
                      ⚠️ <strong>UWAGA:</strong> W trybie duchowym aplikacja pozostaje w tym samym miejscu na ekranie, 
                      ale staje się <strong>PRZEZROCZYSTA</strong> (opacity: 0.05). Ikona i nazwa znikają, 
                      ale aplikacja nadal działa i odbiera powiadomienia w tle.
                      <br/>
                      <strong>Aby ją odnaleźć - kliknij w miejscu gdzie była wcześniej.</strong>
                    </p>
                  </div>
                  <Switch
                    checked={settings.isGhostMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isGhostMode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">🎭 Tryb ukryty</label>
                    <p className="text-sm text-gray-400">Zmienia nazwę i ikonę aplikacji</p>
                  </div>
                  <Switch
                    checked={settings.isHidden}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isHidden: checked }))}
                    disabled={settings.isGhostMode}
                  />
                </div>

                {!settings.isGhostMode && (
                  <>
                    <div>
                      <label className="font-medium">📝 Nazwa aplikacji</label>
                      <Input
                        value={settings.appName}
                        onChange={(e) => setSettings(prev => ({ ...prev, appName: e.target.value }))}
                        placeholder="Wpisz nazwę aplikacji"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <label className="font-medium">🎯 Ikona aplikacji</label>
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
                            <span className="text-sm text-blue-400 hover:underline">
                              📱 Załaduj własną ikonę z telefonu
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

          <TabsContent value="ai" className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-cyan-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-cyan-300">
                <Bot className="w-5 h-5 mr-2" />
                🤖 SZTUCZNA INTELIGENCJA
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-cyan-300">🧠 AI Assistant</label>
                    <p className="text-sm text-gray-400">Inteligentny asystent GPT w czacie</p>
                  </div>
                  <Switch
                    checked={settings.aiAssistant}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, aiAssistant: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-cyan-300">💬 Smart Reply</label>
                    <p className="text-sm text-gray-400">Sugestie inteligentnych odpowiedzi</p>
                  </div>
                  <Switch
                    checked={settings.smartReply}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smartReply: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-cyan-300">😊 Analiza nastrojów</label>
                    <p className="text-sm text-gray-400">Rozpoznawanie emocji w rozmowach</p>
                  </div>
                  <Switch
                    checked={settings.moodAnalysis}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, moodAnalysis: checked }))}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="crypto" className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-emerald-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-emerald-300">
                <Zap className="w-5 h-5 mr-2" />
                🔮 QUANTUM & BLOCKCHAIN
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-emerald-300">🔬 Quantum Encryption</label>
                    <p className="text-sm text-gray-400">Kwantowo-odporny algorytm szyfrowania</p>
                  </div>
                  <Switch
                    checked={settings.quantumEncryption}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, quantumEncryption: checked }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Button variant="outline" className="h-20 flex flex-col bg-purple-900/20 border-purple-500/30">
                    <span className="text-2xl mb-2">💎</span>
                    <span className="text-sm">NFT Avatars</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col bg-orange-900/20 border-orange-500/30">
                    <span className="text-2xl mb-2">🪙</span>
                    <span className="text-sm">Crypto Rewards</span>
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                🎨 Personalizacja
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium">🌙 Tryb ciemny</label>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))}
                  />
                </div>

                <div>
                  <label className="font-medium">📏 Rozmiar czcionki</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                    className="mt-2 w-full p-2 border rounded bg-gray-800 border-gray-600"
                  >
                    <option value="small">Mała</option>
                    <option value="medium">Średnia</option>
                    <option value="large">Duża</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium">🌐 Język</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="mt-2 w-full p-2 border rounded bg-gray-800 border-gray-600"
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
                🔔 Powiadomienia
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium">🔊 Dźwięki powiadomień</label>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
                  />
                </div>

                <div>
                  <label className="font-medium">🎵 Rodzaj dźwięku</label>
                  <select
                    value={settings.notificationSound}
                    onChange={(e) => setSettings(prev => ({ ...prev, notificationSound: e.target.value }))}
                    className="mt-2 w-full p-2 border rounded bg-gray-800 border-gray-600"
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
                  <label className="font-medium">📳 Wibracje</label>
                  <Switch
                    checked={settings.vibrationEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, vibrationEnabled: checked }))}
                  />
                </div>
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
          <Button onClick={saveSettings} className="bg-gradient-to-r from-purple-500 to-blue-600">
            💾 Zapisz ustawienia
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminPanel = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-red-900/20 to-purple-900/20 border-red-500/30">
        <h3 className="text-lg font-semibold mb-4 text-red-400">
          👑 QUANTUM ADMIN CENTRUM - 97gibek@gmail.com
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Witaj, Administratorze! Masz dostęp do najwyższego poziomu sterowania SecureChat.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-20 flex flex-col bg-blue-900/20 border-blue-500/30">
            <span className="text-2xl mb-2">👥</span>
            <span>Zarządzaj użytkownikami</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col bg-green-900/20 border-green-500/30">
            <span className="text-2xl mb-2">📊</span>
            <span>Analytics Dashboard</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col bg-purple-900/20 border-purple-500/30">
            <span className="text-2xl mb-2">🔧</span>
            <span>Server Config</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col bg-orange-900/20 border-orange-500/30">
            <span className="text-2xl mb-2">🚫</span>
            <span>Moderacja AI</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col bg-cyan-900/20 border-cyan-500/30">
            <span className="text-2xl mb-2">⚡</span>
            <span>Quantum Monitor</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col bg-yellow-900/20 border-yellow-500/30">
            <span className="text-2xl mb-2">💰</span>
            <span>Revenue Analytics</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPanel;
