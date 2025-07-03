
import React from 'react';
// Simple analytics without complex hooks
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  BarChart3, 
  Download,
  Calendar,
  Clock,
  Star
} from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const analytics = {
    totalUsers: 0,
    totalMessages: 0,
    totalConversations: 0,
    activeUsers: 0
  };
  const loading = false;
  
  const userMetrics = {
    daily_active_users: 25,
    weekly_active_users: 100,
    monthly_active_users: 250,
    messages_per_user: 15,
    retention_rate: 85.5
  };
  
  const messageAnalytics = {
    messages_today: 145,
    messages_this_week: 890,
    text_messages: 750,
    media_messages: 140,
    total_messages: 890,
    average_message_length: 42
  };
  
  const popularFeatures = [
    { feature_name: 'Wiadomości tekstowe', usage_count: 750 },
    { feature_name: 'Udostępnianie plików', usage_count: 120 },
    { feature_name: 'Połączenia głosowe', usage_count: 85 },
    { feature_name: 'Chat grupowy', usage_count: 65 },
    { feature_name: 'Udostępnianie lokalizacji', usage_count: 45 }
  ];
  
  const generateAnalyticsReport = () => ({
    userMetrics,
    messageAnalytics,
    popularFeatures,
    timestamp: new Date().toISOString()
  });
  
  const refreshAnalytics = () => {
    console.log('Refreshing analytics...');
  };

  const handleDownloadReport = async () => {
    const report = await generateAnalyticsReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-xl">Ładowanie analityki...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Analityka Zaawansowana</h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={refreshAnalytics} variant="outline">
            Odśwież dane
          </Button>
          <Button onClick={handleDownloadReport} className="bg-green-500 hover:bg-green-600">
            <Download className="w-4 h-4 mr-2" />
            Pobierz raport
          </Button>
        </div>
      </div>

      {/* Metryki użytkowników */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Zaangażowanie użytkowników
          </CardTitle>
          <CardDescription>
            Aktywność użytkowników w różnych okresach czasowych
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {userMetrics?.daily_active_users || 0}
              </div>
              <div className="text-gray-400 text-sm">Dzienni użytkownicy</div>
              <Progress value={75} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {userMetrics?.weekly_active_users || 0}
              </div>
              <div className="text-gray-400 text-sm">Tygodniowi użytkownicy</div>
              <Progress value={60} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {userMetrics?.monthly_active_users || 0}
              </div>
              <div className="text-gray-400 text-sm">Miesięczni użytkownicy</div>
              <Progress value={45} className="mt-2" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Wiadomości na użytkownika</span>
                <span className="text-white font-semibold">
                  {userMetrics?.messages_per_user || 0}
                </span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Wskaźnik retencji</span>
                <span className="text-white font-semibold">
                  {(userMetrics?.retention_rate || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analityka wiadomości */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Analityka wiadomości
          </CardTitle>
          <CardDescription>
            Szczegółowe statystyki dotyczące wiadomości
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold text-white">
                {messageAnalytics?.messages_today || 0}
              </div>
              <div className="text-gray-400 text-sm">Dzisiaj</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold text-white">
                {messageAnalytics?.messages_this_week || 0}
              </div>
              <div className="text-gray-400 text-sm">Ten tydzień</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold text-white">
                {messageAnalytics?.text_messages || 0}
              </div>
              <div className="text-gray-400 text-sm">Tekstowe</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold text-white">
                {messageAnalytics?.average_message_length || 0}
              </div>
              <div className="text-gray-400 text-sm">Śr. długość</div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-white font-semibold mb-4">Rozkład typów wiadomości</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Wiadomości tekstowe</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={
                      messageAnalytics?.total_messages ? 
                      (messageAnalytics.text_messages / messageAnalytics.total_messages) * 100 : 0
                    } 
                    className="w-24" 
                  />
                  <span className="text-white font-semibold w-12">
                    {messageAnalytics?.text_messages || 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Pliki i media</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={
                      messageAnalytics?.total_messages ? 
                      (messageAnalytics.media_messages / messageAnalytics.total_messages) * 100 : 0
                    } 
                    className="w-24" 
                  />
                  <span className="text-white font-semibold w-12">
                    {messageAnalytics?.media_messages || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popularne funkcje */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Popularne funkcje
          </CardTitle>
          <CardDescription>
            Najczęściej używane funkcje aplikacji
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularFeatures.slice(0, 5).map((feature, index) => (
              <div key={feature.feature_name} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-white font-semibold">{feature.feature_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{feature.usage_count}</div>
                    <div className="text-gray-400 text-sm">użyć</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
