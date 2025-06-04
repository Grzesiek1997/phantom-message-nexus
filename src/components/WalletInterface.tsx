
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, Send, Plus, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  description: string;
  created_at: string;
  from_user: { display_name: string };
  to_user: { display_name: string };
}

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

const WalletInterface: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, transactions: [] });
  const [sendAmount, setSendAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [description, setDescription] = useState('');
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadWalletData();
    }
  }, [isOpen, user]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      // Pobierz saldo
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') {
        console.error('Error loading wallet:', walletError);
        return;
      }

      // Pobierz transakcje
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select(`
          *,
          from_user:profiles!transactions_from_user_id_fkey(display_name),
          to_user:profiles!transactions_to_user_id_fkey(display_name)
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transError) {
        console.error('Error loading transactions:', transError);
        return;
      }

      setWallet({
        balance: walletData?.balance || 0,
        transactions: transactions || []
      });
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  const sendMoney = async () => {
    if (!user || !sendAmount || !recipientEmail) return;

    setLoading(true);
    try {
      // Znajdź odbiorcę
      const { data: recipient, error: recipientError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', recipientEmail)
        .single();

      if (recipientError) {
        toast({
          title: 'Błąd',
          description: 'Nie znaleziono użytkownika',
          variant: 'destructive'
        });
        return;
      }

      const amount = parseFloat(sendAmount);
      if (amount <= 0 || amount > wallet.balance) {
        toast({
          title: 'Błąd',
          description: 'Nieprawidłowa kwota lub niewystarczające środki',
          variant: 'destructive'
        });
        return;
      }

      // Wykonaj transakcję
      const { error } = await supabase.rpc('transfer_money', {
        from_user_id: user.id,
        to_user_id: recipient.id,
        amount: amount,
        description: description || 'Przelew'
      });

      if (error) {
        toast({
          title: 'Błąd transakcji',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Przelew wykonany',
        description: `Wysłano ${amount} PLN do ${recipientEmail}`
      });

      setSendAmount('');
      setRecipientEmail('');
      setDescription('');
      setShowSendMoney(false);
      loadWalletData();
    } catch (error) {
      console.error('Error sending money:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się wykonać przelewu',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addFunds = async () => {
    toast({
      title: 'Doładowanie konta',
      description: 'Funkcja w przygotowaniu - integracja z systemem płatności'
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Portfel SecureChat</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Saldo */}
          <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="text-center">
              <p className="text-sm opacity-80">Dostępne środki</p>
              <p className="text-3xl font-bold">{wallet.balance.toFixed(2)} PLN</p>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button 
                onClick={() => setShowSendMoney(true)}
                className="flex-1 bg-white/20 hover:bg-white/30"
              >
                <Send className="w-4 h-4 mr-2" />
                Wyślij
              </Button>
              <Button 
                onClick={addFunds}
                className="flex-1 bg-white/20 hover:bg-white/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Doładuj
              </Button>
            </div>
          </Card>

          {/* Historia transakcji */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <History className="w-5 h-5 mr-2" />
              Historia transakcji
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {wallet.transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Brak transakcji</p>
              ) : (
                wallet.transactions.map((transaction) => {
                  const isSent = transaction.from_user_id === user?.id;
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {isSent ? (
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {isSent ? `Do: ${transaction.to_user.display_name}` : `Od: ${transaction.from_user.display_name}`}
                          </p>
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.created_at).toLocaleString('pl-PL')}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${isSent ? 'text-red-500' : 'text-green-500'}`}>
                        {isSent ? '-' : '+'}{transaction.amount.toFixed(2)} PLN
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Formularz wysyłania pieniędzy */}
          {showSendMoney && (
            <Card className="p-6 border-blue-200">
              <h3 className="text-lg font-semibold mb-4">Wyślij pieniądze</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Odbiorca (username)</label>
                  <Input
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Wpisz username odbiorcy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kwota (PLN)</label>
                  <Input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    max={wallet.balance}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Opis (opcjonalny)</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Za co płacisz?"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={sendMoney} 
                    disabled={loading || !sendAmount || !recipientEmail}
                    className="flex-1"
                  >
                    {loading ? 'Wysyłanie...' : 'Wyślij pieniądze'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSendMoney(false)}
                  >
                    Anuluj
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletInterface;
