
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Globe, 
  Trash2, 
  Plus, 
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
// Simplified device management without complex hooks

const DeviceManagement: React.FC = () => {
  // Simplified device management - static data for demo
  const devices: any[] = [];
  const loading = false;
  const registerDevice = async (device: any) => console.log('Register device:', device);
  const removeDevice = async (deviceId: string) => console.log('Remove device:', deviceId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDevice, setNewDevice] = useState({
    device_name: '',
    platform: 'web' as 'ios' | 'android' | 'desktop' | 'web',
    push_token: ''
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios':
      case 'android':
        return <Smartphone className="w-5 h-5" />;
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      case 'web':
        return <Globe className="w-5 h-5" />;
      default:
        return <Tablet className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'ios': return 'bg-gray-600';
      case 'android': return 'bg-green-600';
      case 'desktop': return 'bg-blue-600';
      case 'web': return 'bg-purple-600';
      default: return 'bg-gray-500';
    }
  };

  const getActivityStatus = (lastActive: string) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) return { status: 'online', text: 'Online', color: 'bg-green-500' };
    if (diffMinutes < 60) return { status: 'recent', text: `${diffMinutes}m temu`, color: 'bg-yellow-500' };
    if (diffMinutes < 1440) return { status: 'today', text: `${Math.floor(diffMinutes / 60)}h temu`, color: 'bg-orange-500' };
    return { status: 'offline', text: `${Math.floor(diffMinutes / 1440)}d temu`, color: 'bg-gray-500' };
  };

  const handleAddDevice = async () => {
    if (!newDevice.device_name.trim()) return;

    // Generate unique device ID
    const deviceId = `${newDevice.platform}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await registerDevice({
      device_id: deviceId,
      device_name: newDevice.device_name,
      platform: newDevice.platform,
      push_token: newDevice.push_token
    });

    setNewDevice({
      device_name: '',
      platform: 'web',
      push_token: ''
    });
    setIsAddDialogOpen(false);
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (confirm('Czy na pewno chcesz usunąć to urządzenie? Zostaniesz wylogowany z tego urządzenia.')) {
      await removeDevice(deviceId);
    }
  };

  if (loading) {
    return (
      <Card className="glass border-white/20">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Ładowanie urządzeń...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Zarządzanie urządzeniami</h2>
          <p className="text-gray-400">Kontroluj dostęp do swojego konta z różnych urządzeń</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj urządzenie
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">Dodaj nowe urządzenie</DialogTitle>
              <DialogDescription>
                Zarejestruj nowe urządzenie aby umożliwić dostęp do swojego konta
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Nazwa urządzenia</label>
                <Input
                  value={newDevice.device_name}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, device_name: e.target.value }))}
                  placeholder="np. iPhone osobisty, Laptop pracy"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Platforma</label>
                <Select
                  value={newDevice.platform}
                  onValueChange={(value: any) => setNewDevice(prev => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ios">iOS</SelectItem>
                    <SelectItem value="android">Android</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Token push (opcjonalny)</label>
                <Input
                  value={newDevice.push_token}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, push_token: e.target.value }))}
                  placeholder="Token dla powiadomień push"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddDevice}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!newDevice.device_name.trim()}
                >
                  Dodaj urządzenie
                </Button>
                <Button
                  onClick={() => setIsAddDialogOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Anuluj
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security warning if too many devices */}
      {devices.length > 5 && (
        <Card className="glass border-orange-500/30 bg-orange-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-white font-medium">Ostrzeżenie bezpieczeństwa</p>
                <p className="text-gray-300 text-sm">
                  Masz wiele zarejestrowanych urządzeń. Usuń nieużywane urządzenia dla lepszego bezpieczeństwa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current devices */}
      <div className="grid gap-4">
        {devices.length === 0 ? (
          <Card className="glass border-white/20">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Nie masz zarejestrowanych urządzeń</p>
              <p className="text-gray-500 text-sm">
                Dodaj urządzenie aby móc korzystać z aplikacji na różnych platformach
              </p>
            </CardContent>
          </Card>
        ) : (
          devices.map(device => {
            const activity = getActivityStatus(device.last_active);
            return (
              <Card key={device.id} className="glass border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getPlatformColor(device.platform)}`}>
                        {getPlatformIcon(device.platform)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium">{device.device_name}</h3>
                          {device.is_primary && (
                            <Badge className="bg-blue-500 text-xs">Główne</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPlatformColor(device.platform)}>
                            {device.platform}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                            <span className="text-gray-400 text-xs">{activity.text}</span>
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">
                          Dodane: {new Date(device.created_at).toLocaleDateString('pl-PL')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.status === 'online' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      <Button
                        onClick={() => handleRemoveDevice(device.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        disabled={device.is_primary}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Device security tips */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Wskazówki bezpieczeństwa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span className="text-gray-300">
                Regularnie sprawdzaj listę urządzeń i usuń te, których już nie używasz
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span className="text-gray-300">
                Jeśli widzisz nieznane urządzenie, natychmiast je usuń i zmień hasło
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span className="text-gray-300">
                Używaj różnych nazw dla urządzeń aby łatwo je rozpoznać
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span className="text-gray-300">
                Główne urządzenie nie może być usunięte - to zwiększa bezpieczeństwo
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceManagement;
