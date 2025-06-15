
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface SystemHealthMetrics {
  database_status: 'healthy' | 'warning' | 'critical';
  active_users: number;
  messages_last_hour: number;
  storage_usage: number;
  api_response_time: number;
  error_rate: number;
  last_backup: string | null;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  created_at: string;
  resolved: boolean;
}

export const useSystemHealth = () => {
  const [metrics, setMetrics] = useState<SystemHealthMetrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkDatabaseHealth = async (): Promise<'healthy' | 'warning' | 'critical'> => {
    try {
      const startTime = Date.now();
      const { error } = await supabase.from('profiles').select('count').limit(1);
      const responseTime = Date.now() - startTime;

      if (error) return 'critical';
      if (responseTime > 2000) return 'warning';
      return 'healthy';
    } catch {
      return 'critical';
    }
  };

  const getActiveUsersCount = async (): Promise<number> => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('is_online', true)
        .gte('last_seen', oneHourAgo);

      if (error) throw error;
      return count || 0;
    } catch {
      return 0;
    }
  };

  const getMessagesLastHour = async (): Promise<number> => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .gte('created_at', oneHourAgo);

      if (error) throw error;
      return count || 0;
    } catch {
      return 0;
    }
  };

  const calculateApiResponseTime = async (): Promise<number> => {
    try {
      const startTime = Date.now();
      await supabase.from('profiles').select('id').limit(1);
      return Date.now() - startTime;
    } catch {
      return 5000; // Return high response time if failed
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const [
        databaseStatus,
        activeUsers,
        messagesLastHour,
        apiResponseTime
      ] = await Promise.all([
        checkDatabaseHealth(),
        getActiveUsersCount(),
        getMessagesLastHour(),
        calculateApiResponseTime()
      ]);

      const metrics: SystemHealthMetrics = {
        database_status: databaseStatus,
        active_users: activeUsers,
        messages_last_hour: messagesLastHour,
        storage_usage: 0, // Placeholder - would need to implement storage checking
        api_response_time: apiResponseTime,
        error_rate: 0, // Placeholder - would need error tracking
        last_backup: null // Placeholder - would need backup tracking
      };

      setMetrics(metrics);

      // Generate alerts based on metrics
      const newAlerts: SystemAlert[] = [];

      if (databaseStatus === 'critical') {
        newAlerts.push({
          id: crypto.randomUUID(),
          type: 'critical',
          title: 'Błąd bazy danych',
          message: 'Baza danych nie odpowiada lub zwraca błędy',
          created_at: new Date().toISOString(),
          resolved: false
        });
      }

      if (apiResponseTime > 3000) {
        newAlerts.push({
          id: crypto.randomUUID(),
          type: 'warning',
          title: 'Powolne API',
          message: `Czas odpowiedzi API: ${apiResponseTime}ms`,
          created_at: new Date().toISOString(),
          resolved: false
        });
      }

      if (activeUsers === 0) {
        newAlerts.push({
          id: crypto.randomUUID(),
          type: 'info',
          title: 'Brak aktywnych użytkowników',
          message: 'Żaden użytkownik nie jest obecnie online',
          created_at: new Date().toISOString(),
          resolved: false
        });
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać metryk systemu',
        variant: 'destructive'
      });
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const runSystemDiagnostics = async () => {
    toast({
      title: 'Diagnostyka',
      description: 'Uruchamianie diagnostyki systemu...'
    });

    try {
      // Test połączenia z bazą danych
      const dbTest = await supabase.from('profiles').select('count').limit(1);
      
      // Test autoryzacji
      const authTest = await supabase.auth.getSession();
      
      // Test funkcji RPC (jeśli dostępne)
      const rpcTest = await supabase.rpc('are_users_friends', { 
        user1_id: '00000000-0000-0000-0000-000000000000',
        user2_id: '00000000-0000-0000-0000-000000000000'
      });

      let diagnosticsResult = 'Diagnostyka zakończona:\n';
      diagnosticsResult += `✅ Baza danych: ${dbTest.error ? 'BŁĄD' : 'OK'}\n`;
      diagnosticsResult += `✅ Autoryzacja: ${authTest.error ? 'BŁĄD' : 'OK'}\n`;
      diagnosticsResult += `✅ Funkcje RPC: ${rpcTest.error ? 'BŁĄD' : 'OK'}`;

      toast({
        title: 'Diagnostyka zakończona',
        description: diagnosticsResult
      });
    } catch (error) {
      toast({
        title: 'Błąd diagnostyki',
        description: 'Wystąpił błąd podczas diagnostyki systemu',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchSystemHealth();
      setLoading(false);
    };

    loadData();

    // Odświeżaj metryki co 30 sekund
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    alerts,
    loading,
    resolveAlert,
    runSystemDiagnostics,
    refreshMetrics: fetchSystemHealth
  };
};
