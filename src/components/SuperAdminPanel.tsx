
import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useChannelManagement } from '@/hooks/useChannelManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AdminDashboard from './AdminDashboard';
import SystemHealthDashboard from './SystemHealthDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import { Shield, Activity, BarChart3, Settings, Users, MessageCircle } from 'lucide-react';

const SuperAdminPanel: React.FC = () => {
  const { isAdmin } = useAdmin();
  const { stats, loading } = useChannelManagement();
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="glass border-white/20">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Brak uprawnień administratora
            </h3>
            <p className="text-gray-400">
              Tylko administratorzy mogą uzyskać dostęp do tego panelu
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Shield className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Panel Super Administratora</h1>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            ADMIN
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 border-gray-700">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Przegląd</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Użytkownicy</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>System</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analityka</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Ustawienia</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Szybki przegląd statystyk */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Łączne kanały</p>
                      <p className="text-2xl font-bold text-white">
                        {loading ? '...' : stats?.total_channels || 0}
                      </p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Kanały publiczne</p>
                      <p className="text-2xl font-bold text-white">
                        {loading ? '...' : stats?.public_channels || 0}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Kanały premium</p>
                      <p className="text-2xl font-bold text-white">
                        {loading ? '...' : stats?.premium_channels || 0}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Łączni subskrybenci</p>
                      <p className="text-2xl font-bold text-white">
                        {loading ? '...' : stats?.total_subscribers || 0}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Szybkie akcje */}
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Szybkie akcje administratora</CardTitle>
                <CardDescription>
                  Najczęściej używane funkcje administracyjne
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveTab('users')}
                    className="h-16 bg-blue-500 hover:bg-blue-600"
                  >
                    <div className="text-center">
                      <Users className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-sm">Zarządzaj użytkownikami</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('system')}
                    className="h-16 bg-green-500 hover:bg-green-600"
                  >
                    <div className="text-center">
                      <Activity className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-sm">Sprawdź system</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('analytics')}
                    className="h-16 bg-purple-500 hover:bg-purple-600"
                  >
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-sm">Zobacz analitykę</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="system">
            <SystemHealthDashboard />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Ustawienia systemu</CardTitle>
                <CardDescription>
                  Konfiguracja zaawansowanych opcji systemu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <Settings className="w-5 h-5" />
                    <span className="font-semibold">W trakcie tworzenia</span>
                  </div>
                  <p className="text-gray-400 mt-2">
                    Panel ustawień systemowych będzie dostępny w przyszłych aktualizacjach.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminPanel;
