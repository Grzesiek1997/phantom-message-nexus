
import { useState, useEffect } from 'react';
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
      // Use localStorage temporarily until database is ready
      const walletData = localStorage.getItem(`wallet_${user.id}`);
      if (walletData) {
        setWallet(JSON.parse(walletData));
      } else {
        await createWallet();
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
      const newWallet = {
        id: crypto.randomUUID(),
        user_id: user.id,
        balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(`wallet_${user.id}`, JSON.stringify(newWallet));
      setWallet(newWallet);
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
      const updatedWallet = {
        ...wallet,
        balance: wallet.balance + amount,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(`wallet_${user.id}`, JSON.stringify(updatedWallet));
      setWallet(updatedWallet);
      
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
