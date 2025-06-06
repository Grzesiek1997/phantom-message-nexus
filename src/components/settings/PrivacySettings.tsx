
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Clock, Users, MessageCircle, Phone, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState({
    // Message Privacy
    readReceipts: true,
    lastSeen: 'everyone',
    profilePhoto: 'contacts',
    about: 'contacts',
    
    // Disappearing Messages
    defaultDisappearing: false,
    disappearingTimer: '7days',
    
    // Contact & Groups
    whoCanAddToGroups: 'contacts',
    whoCanSeeStatus: 'contacts',
    
    // Calls
    whoCanCall: 'everyone',
    callHistory: true,
    
    // Advanced
    incognitoKeyboard: false,
    screenSecurity: true,
    linkPreviews: true,
    
    // Quantum Features
    quantumSafeMode: true,
    zkAuthentication: true,
    homomorphicEncryption: false,
    
    // Biometric
    biometricLock: false,
    biometricTimeout: '5min'
  });

  const { toast } = useToast();

  const handleToggle = (key: string) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key as keyof typeof prev] };
      
      toast({
        title: '🔒 Ustawienia zaktualizowane',
        description: `${key} ${newSettings[key as keyof typeof newSettings] ? 'włączono' : 'wyłączono'}`
      });
      
      return newSettings;
    });
  };

  const handleSelectChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    toast({
      title: '🔒 Ustawienia zaktualizowane',
      description: `${key} zmieniono na: ${value}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Message Privacy */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Prywatność Wiadomości
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Potwierdzenia odczytu</Label>
              <p className="text-sm text-gray-400">Wysyłaj i odbieraj potwierdzenia odczytu</p>
            </div>
            <Switch
              checked={settings.readReceipts}
              onCheckedChange={() => handleToggle('readReceipts')}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Ostatnia aktywność</Label>
            <Select
              value={settings.lastSeen}
              onValueChange={(value) => handleSelectChange('lastSeen', value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="everyone">Wszyscy</SelectItem>
                <SelectItem value="contacts">Tylko kontakty</SelectItem>
                <SelectItem value="nobody">Nikt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Zdjęcie profilowe</Label>
            <Select
              value={settings.profilePhoto}
              onValueChange={(value) => handleSelectChange('profilePhoto', value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="everyone">Wszyscy</SelectItem>
                <SelectItem value="contacts">Tylko kontakty</SelectItem>
                <SelectItem value="nobody">Nikt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Disappearing Messages */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Wiadomości Znikające
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Domyślnie włączone</Label>
              <p className="text-sm text-gray-400">Nowe czaty będą miały włączone znikające wiadomości</p>
            </div>
            <Switch
              checked={settings.defaultDisappearing}
              onCheckedChange={() => handleToggle('defaultDisappearing')}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Domyślny czas znikania</Label>
            <Select
              value={settings.disappearingTimer}
              onValueChange={(value) => handleSelectChange('disappearingTimer', value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="30sec">30 sekund</SelectItem>
                <SelectItem value="1min">1 minuta</SelectItem>
                <SelectItem value="5min">5 minut</SelectItem>
                <SelectItem value="30min">30 minut</SelectItem>
                <SelectItem value="1hour">1 godzina</SelectItem>
                <SelectItem value="6hours">6 godzin</SelectItem>
                <SelectItem value="1day">1 dzień</SelectItem>
                <SelectItem value="7days">7 dni</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Groups & Contacts */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Grupy i Kontakty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Kto może dodawać do grup</Label>
            <Select
              value={settings.whoCanAddToGroups}
              onValueChange={(value) => handleSelectChange('whoCanAddToGroups', value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="everyone">Wszyscy</SelectItem>
                <SelectItem value="contacts">Tylko kontakty</SelectItem>
                <SelectItem value="nobody">Nikt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Kto może widzieć status</Label>
            <Select
              value={settings.whoCanSeeStatus}
              onValueChange={(value) => handleSelectChange('whoCanSeeStatus', value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="everyone">Wszyscy</SelectItem>
                <SelectItem value="contacts">Tylko kontakty</SelectItem>
                <SelectItem value="selected">Wybrani kontakty</SelectItem>
                <SelectItem value="nobody">Nikt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calls */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Połączenia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Kto może dzwonić</Label>
            <Select
              value={settings.whoCanCall}
              onValueChange={(value) => handleSelectChange('whoCanCall', value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="everyone">Wszyscy</SelectItem>
                <SelectItem value="contacts">Tylko kontakty</SelectItem>
                <SelectItem value="nobody">Nikt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Historia połączeń</Label>
              <p className="text-sm text-gray-400">Zapisuj historię połączeń</p>
            </div>
            <Switch
              checked={settings.callHistory}
              onCheckedChange={() => handleToggle('callHistory')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quantum Security */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Quantum Security
            <Badge className="ml-2 bg-purple-500">Zaawansowane</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Quantum-Safe Mode</Label>
              <p className="text-sm text-gray-400">Post-quantum cryptography dla wszystkich komunikacji</p>
            </div>
            <Switch
              checked={settings.quantumSafeMode}
              onCheckedChange={() => handleToggle('quantumSafeMode')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Zero-Knowledge Authentication</Label>
              <p className="text-sm text-gray-400">Uwierzytelnianie bez ujawniania danych</p>
            </div>
            <Switch
              checked={settings.zkAuthentication}
              onCheckedChange={() => handleToggle('zkAuthentication')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Homomorphic Encryption</Label>
              <p className="text-sm text-gray-400">Przetwarzanie zaszyfrowanych danych</p>
            </div>
            <Switch
              checked={settings.homomorphicEncryption}
              onCheckedChange={() => handleToggle('homomorphicEncryption')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Security */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Zaawansowane Bezpieczeństwo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Incognito Keyboard</Label>
              <p className="text-sm text-gray-400">Wyłącz uczenie się klawiatury</p>
            </div>
            <Switch
              checked={settings.incognitoKeyboard}
              onCheckedChange={() => handleToggle('incognitoKeyboard')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Ochrona przed screenshotami</Label>
              <p className="text-sm text-gray-400">Blokuj screenshots w aplikacji</p>
            </div>
            <Switch
              checked={settings.screenSecurity}
              onCheckedChange={() => handleToggle('screenSecurity')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Podgląd linków</Label>
              <p className="text-sm text-gray-400">Generuj podglądy dla linków</p>
            </div>
            <Switch
              checked={settings.linkPreviews}
              onCheckedChange={() => handleToggle('linkPreviews')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Blokada biometryczna</Label>
              <p className="text-sm text-gray-400">Wymagaj odcisku palca/Face ID</p>
            </div>
            <Switch
              checked={settings.biometricLock}
              onCheckedChange={() => handleToggle('biometricLock')}
            />
          </div>

          {settings.biometricLock && (
            <div className="space-y-2">
              <Label className="text-white">Timeout blokady</Label>
              <Select
                value={settings.biometricTimeout}
                onValueChange={(value) => handleSelectChange('biometricTimeout', value)}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="immediately">Natychmiast</SelectItem>
                  <SelectItem value="1min">1 minuta</SelectItem>
                  <SelectItem value="5min">5 minut</SelectItem>
                  <SelectItem value="30min">30 minut</SelectItem>
                  <SelectItem value="1hour">1 godzina</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex space-x-4">
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
          Zapisz ustawienia
        </Button>
        <Button variant="outline" className="flex-1">
          Przywróć domyślne
        </Button>
      </div>
    </div>
  );
};

export default PrivacySettings;
