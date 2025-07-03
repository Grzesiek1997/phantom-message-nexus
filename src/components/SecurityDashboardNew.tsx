
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Key, Trash2, Eye, EyeOff } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
// Simplified without complex hooks
const SecurityDashboardNew: React.FC = () => {
  const { securityEvents, decryptionFailures, clearOldEvents } = useSecurityMonitoring();
  // Simplified profile and devices data
  const profile = { identity_key: true, signed_prekey: true, one_time_prekeys: [] };
  const devices = [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Panel Bezpieczeństwa</h1>
        <Shield className="w-8 h-8 text-green-500" />
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5" />
              Szyfrowanie
            </CardTitle>
            <CardDescription>Status kluczy szyfrowania</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Klucz tożsamości:</span>
                {profile?.identity_key ? (
                  <Badge className="bg-green-500">Aktywny</Badge>
                ) : (
                  <Badge variant="destructive">Brak</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Prekey:</span>
                {profile?.signed_prekey ? (
                  <Badge className="bg-green-500">Aktywny</Badge>
                ) : (
                  <Badge variant="destructive">Brak</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Jednorazowe klucze:</span>
                <Badge className="bg-blue-500">
                  {profile?.one_time_prekeys?.length || 0}
                </Badge>
              </div>
               {false && (
                 <Button
                   onClick={() => console.log('Generate keys')}
                   className="w-full mt-4 bg-green-600 hover:bg-green-700"
                 >
                   Generuj klucze szyfrowania
                 </Button>
               )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zdarzenia
            </CardTitle>
            <CardDescription>Ostatnie zdarzenia bezpieczeństwa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Krytyczne:</span>
                <Badge className="bg-red-500">
                  {securityEvents.filter(e => e.severity === 'critical').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Wysokie:</span>
                <Badge className="bg-orange-500">
                  {securityEvents.filter(e => e.severity === 'high').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Błędy szyfrowania:</span>
                <Badge className="bg-red-500">
                  {decryptionFailures.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Urządzenia</CardTitle>
            <CardDescription>Aktywne urządzenia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Łącznie:</span>
                <Badge className="bg-blue-500">{devices.length}</Badge>
              </div>
              <div className="space-y-1">
                {devices.slice(0, 3).map(device => (
                  <div key={device.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 truncate">{device.device_name}</span>
                    <Badge variant={device.is_primary ? "default" : "secondary"}>
                      {device.platform}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card className="glass border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Ostatnie zdarzenia bezpieczeństwa</CardTitle>
              <CardDescription>Historia działań związanych z bezpieczeństwem</CardDescription>
            </div>
            <Button
              onClick={() => clearOldEvents(30)}
              variant="outline"
              size="sm"
              className="text-gray-300 border-gray-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Wyczyść stare
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {securityEvents.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Brak zdarzeń bezpieczeństwa</p>
            ) : (
              securityEvents.slice(0, 20).map(event => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(event.severity)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">{event.event_type}</h4>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-gray-300 text-sm mt-1">{event.description}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      {formatDate(event.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Decryption Failures */}
      {decryptionFailures.length > 0 && (
        <Card className="glass border-white/20 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Błędy szyfrowania
            </CardTitle>
            <CardDescription>Wiadomości, których nie udało się odszyfrować</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {decryptionFailures.map(failure => (
                <div
                  key={failure.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <EyeOff className="w-4 h-4 text-red-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      Błąd typu: {failure.failure_type}
                    </p>
                    <p className="text-gray-300 text-sm">
                      Konwersacja: {failure.conversation_id}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {formatDate(failure.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityDashboardNew;
