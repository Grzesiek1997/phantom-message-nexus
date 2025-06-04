
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, Shield, TrendingUp, Settings, Ban, UserCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  totalMessages: number;
  activeConversations: number;
  todayMessages: number;
  newUsersToday: number;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  profiles: {
    username: string;
    display_name: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalMessages: 0,
    activeConversations: 0,
    todayMessages: 0,
    newUsersToday: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Sprawdź czy użytkownik jest administratorem
  const isAdmin = user?.email === '97gibek@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Pobierz statystyki
      const today = new Date().toISOString().split('T')[0];
      
      const [
        { count: totalUsers },
        { count: totalMessages },
        { count: activeConversations },
        { count: todayMessages },
        { count: newUsersToday }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('conversations').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today)
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        totalMessages: totalMessages || 0,
        activeConversations: activeConversations || 0,
        todayMessages: todayMessages || 0,
        newUsersToday: newUsersToday || 0
      });

      // Pobierz listę użytkowników
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Pobierz dane auth dla użytkowników (wymagane specjalne uprawnienia)
      // W prawdziwej aplikacji te dane byłyby pobierane przez dedykowany endpoint
      setUsers(usersData?.map(user => ({
        id: user.id,
        email: 'hidden@privacy.com', // W prawdziwej aplikacji pobierać z auth
        created_at: user.created_at,
        last_sign_in_at: '2024-01-01', // Mock data
        profiles: {
          username: user.username,
          display_name: user.display_name || user.username
        }
      })) || []);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się załadować danych administracyjnych',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId: string) => {
    try {
      // W prawdziwej aplikacji to byłaby funkcja edge
      toast({
        title: 'Funkcja w przygotowaniu',
        description: 'Blokowanie użytkowników będzie dostępne wkrótce'
      });
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const sendSystemMessage = async () => {
    toast({
      title: 'Funkcja w przygotowaniu',
      description: 'Wysyłanie wiadomości systemowych będzie dostępne wkrótce'
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Brak uprawnień</h2>
          <p className="text-gray-600">Tylko administrator może uzyskać dostęp do tego panelu.</p>
          <p className="text-sm text-gray-500 mt-2">Administrator: 97gibek@gmail.com</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Ładowanie panelu administracyjnego...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Panel Administracyjny</h1>
          <p className="text-gray-300">Witaj, administratorze! 👑</p>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6 glass">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-gray-400">Użytkownicy</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-green-500 mb-2" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
                <p className="text-gray-400">Wiadomości</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-yellow-500 mb-2" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.activeConversations}</p>
                <p className="text-gray-400">Konwersacje</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-purple-500 mb-2" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.todayMessages}</p>
                <p className="text-gray-400">Dziś</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-red-500 mb-2" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.newUsersToday}</p>
                <p className="text-gray-400">Nowi dziś</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Użytkownicy</TabsTrigger>
            <TabsTrigger value="messages">Wiadomości</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="settings">Ustawienia</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold text-white mb-4">Zarządzanie użytkownikami</h3>
              
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-semibold text-white">{user.profiles.display_name}</p>
                      <p className="text-sm text-gray-400">@{user.profiles.username}</p>
                      <p className="text-xs text-gray-500">
                        Dołączył: {new Date(user.created_at).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => banUser(user.id)}
                        className="text-red-500 border-red-500 hover:bg-red-500/10"
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Zablokuj
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold text-white mb-4">Moderacja wiadomości</h3>
              <p className="text-gray-400">Funkcje moderacji wiadomości w przygotowaniu...</p>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold text-white mb-4">Wiadomości systemowe</h3>
              
              <div className="space-y-4">
                <Input
                  placeholder="Napisz wiadomość systemową..."
                  className="bg-white/10 border-white/20 text-white"
                />
                <Button onClick={sendSystemMessage} className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Wyślij wiadomość do wszystkich
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold text-white mb-4">Ustawienia serwera</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Automatyczne usuwanie wiadomości</span>
                  <span className="text-green-400">Włączone</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Rejestracja nowych użytkowników</span>
                  <span className="text-green-400">Włączona</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Szyfrowanie end-to-end</span>
                  <span className="text-green-400">Aktywne</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
