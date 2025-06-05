
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Eye, EyeOff, Volume2, Bell, Palette, Smartphone, Zap, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AppSettings {
  ghostMode: boolean;
  stealthLevel: number;
  customIcon: string;
  customName: string;
  notifications: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  autoEncrypt: boolean;
  quantumSecurity: boolean;
  biometricAuth: boolean;
}

const SettingsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AppSettings>({
    ghostMode: false,
    stealthLevel: 0,
    customIcon: '',
    customName: 'SecureChat',
    notifications: true,
    soundEnabled: true,
    darkMode: true,
    autoEncrypt: true,
    quantumSecurity: true,
    biometricAuth: false
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = async () => {
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      
      // Apply ghost mode if enabled
      if (settings.ghostMode) {
        applyGhostMode();
      } else {
        removeGhostMode();
      }

      toast({
        title: '⚙️ Ustawienia zapisane',
        description: 'Wszystkie zmiany zostały zastosowane'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Błąd zapisywania',
        description: 'Nie udało się zapisać ustawień',
        variant: 'destructive'
      });
    }
  };

  const applyGhostMode = () => {
    const app = document.body;
    
    if (settings.stealthLevel === 100) {
      // Complete invisibility (Ghost Mode)
      app.style.opacity = '0.01';
      app.style.pointerEvents = 'auto';
      document.title = '';
      
      // Change favicon to transparent
      const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (favicon) {
        favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
      }
      
      toast({
        title: '👻 Ghost Mode Aktywny',
        description: '⚠️ UWAGA: Aplikacja jest teraz NIEWIDOCZNA (opacity: 0.01). Kliknij w tym samym miejscu aby ją odnaleźć.',
        duration: 10000
      });
    } else {
      // Partial stealth
      const opacity = Math.max(0.1, (100 - settings.stealthLevel) / 100);
      app.style.opacity = opacity.toString();
      document.title = settings.customName || 'SecureChat';
    }
  };

  const removeGhostMode = () => {
    const app = document.body;
    app.style.opacity = '1';
    app.style.pointerEvents = 'auto';
    document.title = settings.customName || 'SecureChat';
    
    // Restore favicon
    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = '/favicon.ico';
    }
  };

  const predefinedIcons = [
    { name: 'Calculator', icon: '🔢', desc: 'Ukryj jako kalkulator' },
    { name: 'Notes', icon: '📝', desc: 'Ukryj jako notatki' },
    { name: 'Weather', icon: '🌤️', desc: 'Ukryj jako pogoda' },
    { name: 'Music', icon: '🎵', desc: 'Ukryj jako muzyka' },
    { name: 'Calendar', icon: '📅', desc: 'Ukryj jako kalendarz' },
    { name: 'Clock', icon: '⏰', desc: 'Ukryj jako zegar' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">⚙️ Zaawansowane Ustawienia</h2>
            </div>
            <Button variant="outline" onClick={onClose}>
              Zamknij
            </Button>
          </div>

          <Tabs defaultValue="stealth" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="stealth">👻 Ukrywanie</TabsTrigger>
              <TabsTrigger value="security">🛡️ Bezpieczeństwo</TabsTrigger>
              <TabsTrigger value="general">⚙️ Ogólne</TabsTrigger>
              <TabsTrigger value="quantum">⚡ Quantum</TabsTrigger>
            </TabsList>

            <TabsContent value="stealth" className="mt-6">
              <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
                <div className="flex items-center mb-4">
                  <Eye className="w-5 h-5 text-purple-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">👻 Tryb Ukrywania Aplikacji</h3>
                </div>

                <div className="space-y-6">
                  {/* Ghost Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Ghost Mode</label>
                      <p className="text-sm text-gray-400">
                        Sprawia, że aplikacja staje się niewidoczna
                      </p>
                    </div>
                    <Switch
                      checked={settings.ghostMode}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, ghostMode: checked }))}
                    />
                  </div>

                  {/* Stealth Level */}
                  <div className="space-y-3">
                    <label className="text-white font-medium">
                      Poziom Niewidoczności: {settings.stealthLevel}%
                    </label>
                    <Slider
                      value={[settings.stealthLevel]}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, stealthLevel: value[0] }))}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-400">
                      {settings.stealthLevel === 100 ? 
                        '⚠️ UWAGA: 100% = Kompletna niewidoczność (opacity: 0.01)' :
                        `Aplikacja będzie widoczna w ${100 - settings.stealthLevel}%`
                      }
                    </div>
                  </div>

                  {/* Custom App Name */}
                  <div className="space-y-2">
                    <label className="text-white font-medium">Nazwa Aplikacji</label>
                    <input
                      type="text"
                      value={settings.customName}
                      onChange={(e) => setSettings(prev => ({ ...prev, customName: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded text-white placeholder:text-gray-400"
                      placeholder="Wpisz nową nazwę aplikacji..."
                    />
                  </div>

                  {/* Predefined Icons */}
                  <div className="space-y-3">
                    <label className="text-white font-medium">Wybierz Ikonę Ukrywającą</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {predefinedIcons.map((icon, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-16 flex flex-col bg-white/10 border-white/20 hover:bg-white/20"
                          onClick={() => setSettings(prev => ({ 
                            ...prev, 
                            customIcon: icon.icon,
                            customName: icon.name 
                          }))}
                        >
                          <span className="text-2xl mb-1">{icon.icon}</span>
                          <span className="text-xs">{icon.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Warning Box */}
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-center text-red-400 mb-2">
                      <EyeOff className="w-4 h-4 mr-2" />
                      <span className="font-semibold">Ostrzeżenie Ghost Mode</span>
                    </div>
                    <p className="text-sm text-red-300">
                      W trybie duchowym (100%) aplikacja staje się PRZEZROCZYSTA (opacity: 0.01). 
                      Ikona i nazwa znikają, ale aplikacja nadal działa i odbiera powiadomienia. 
                      Aby ją odnaleźć - kliknij w miejscu gdzie była wcześniej.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card className="p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30">
                <div className="flex items-center mb-4">
                  <Shield className="w-5 h-5 text-green-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">🛡️ Bezpieczeństwo</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Auto-szyfrowanie</label>
                      <p className="text-sm text-gray-400">Automatyczne szyfrowanie wszystkich wiadomości</p>
                    </div>
                    <Switch
                      checked={settings.autoEncrypt}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoEncrypt: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Autoryzacja biometryczna</label>
                      <p className="text-sm text-gray-400">Odcisk palca lub FaceID</p>
                    </div>
                    <Switch
                      checked={settings.biometricAuth}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, biometricAuth: checked }))}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="general" className="mt-6">
              <Card className="p-6 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-500/30">
                <div className="flex items-center mb-4">
                  <Smartphone className="w-5 h-5 text-blue-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">⚙️ Ustawienia Ogólne</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <label className="text-white font-medium">Powiadomienia</label>
                    </div>
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-blue-400" />
                      <label className="text-white font-medium">Dźwięki</label>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-blue-400" />
                      <label className="text-white font-medium">Tryb ciemny</label>
                    </div>
                    <Switch
                      checked={settings.darkMode}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="quantum" className="mt-6">
              <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-violet-900/20 border-purple-500/30">
                <div className="flex items-center mb-4">
                  <Zap className="w-5 h-5 text-purple-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">⚡ Quantum Security</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Post-Quantum Encryption</label>
                      <p className="text-sm text-gray-400">CRYSTALS-Kyber & Dilithium</p>
                    </div>
                    <Switch
                      checked={settings.quantumSecurity}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, quantumSecurity: checked }))}
                    />
                  </div>

                  <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center text-purple-400 mb-2">
                      <Brain className="w-4 h-4 mr-2" />
                      <span className="font-semibold">AI-Powered Security</span>
                    </div>
                    <div className="space-y-2 text-sm text-purple-300">
                      <div>• Zero-knowledge authentication</div>
                      <div>• Homomorphic encryption</div>
                      <div>• Quantum threat detection</div>
                      <div>• Adaptive security protocols</div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button 
              onClick={saveSettings}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              💾 Zapisz Ustawienia
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPanel;
