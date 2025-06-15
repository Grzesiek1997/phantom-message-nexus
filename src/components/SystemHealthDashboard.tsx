
import React from 'react';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Users, MessageCircle, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';

const SystemHealthDashboard: React.FC = () => {
  const { metrics, alerts, loading, resolveAlert, runSystemDiagnostics, refreshMetrics } = useSystemHealth();

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <X className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-xl">Ładowanie metryk systemu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Zdrowie Systemu</h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={refreshMetrics} variant="outline">
            Odśwież
          </Button>
          <Button onClick={runSystemDiagnostics} className="bg-blue-500 hover:bg-blue-600">
            Uruchom diagnostykę
          </Button>
        </div>
      </div>

      {/* Status główny */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Status główny
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${getStatusColor(metrics?.database_status || 'critical')}`}>
              {getStatusIcon(metrics?.database_status || 'critical')}
              <span className="font-semibold">
                Baza danych: {metrics?.database_status === 'healthy' ? 'Zdrowa' : 
                            metrics?.database_status === 'warning' ? 'Ostrzeżenie' : 'Krytyczna'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metryki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Aktywni użytkownicy</p>
                <p className="text-2xl font-bold text-white">{metrics?.active_users || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Wiadomości/godzina</p>
                <p className="text-2xl font-bold text-white">{metrics?.messages_last_hour || 0}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Czas odpowiedzi API</p>
                <p className="text-2xl font-bold text-white">{metrics?.api_response_time || 0}ms</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Wskaźnik błędów</p>
                <p className="text-2xl font-bold text-white">{(metrics?.error_rate || 0).toFixed(2)}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerty */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Alerty systemowe</CardTitle>
          <CardDescription>
            Aktualne problemy i ostrzeżenia systemowe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <p className="text-gray-400">Brak aktywnych alertów</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
                    alert.type === 'critical' ? 'border-red-500' :
                    alert.type === 'warning' ? 'border-yellow-500' :
                    alert.type === 'error' ? 'border-red-400' : 'border-blue-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={alert.type === 'critical' ? 'destructive' : 'secondary'}
                        className={
                          alert.type === 'critical' ? 'bg-red-500/20 text-red-400' :
                          alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                          alert.type === 'error' ? 'bg-red-400/20 text-red-300' :
                          'bg-blue-500/20 text-blue-400'
                        }
                      >
                        {alert.type.toUpperCase()}
                      </Badge>
                      <div>
                        <h4 className="text-white font-semibold">{alert.title}</h4>
                        <p className="text-gray-400 text-sm">{alert.message}</p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button
                        onClick={() => resolveAlert(alert.id)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        Rozwiąż
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;
