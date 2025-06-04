
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface WalletData {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWallet = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching wallet:', error);
        return;
      }

      if (!data) {
        // Utwórz portfel jeśli nie istnieje
        await createWallet();
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error in fetchWallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          balance: 0
        })
        .select()
        .single();

      if (error) throw error;

      setWallet(data);
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast({
        title: 'Błąd tworzenia portfela',
        description: 'Nie udało się utworzyć portfela',
        variant: 'destructive'
      });
    }
  };

  const addFunds = async (amount: number) => {
    if (!user || !wallet) return;

    try {
      const { data, error } = await supabase
        .from('wallets')
        .update({ 
          balance: wallet.balance + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setWallet(data);
      toast({
        title: 'Środki dodane',
        description: `Dodano ${amount} PLN do portfela`
      });
    } catch (error) {
      console.error('Error adding funds:', error);
      toast({
        title: 'Błąd doładowania',
        description: 'Nie udało się doładować portfela',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  return {
    wallet,
    loading,
    fetchWallet,
    addFunds
  };
};
