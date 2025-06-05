
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, Plus, Send, TrendingUp, CreditCard, Smartphone, QrCode } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface WalletData {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  description: string;
  created_at: string;
  from_user: {
    display_name: string;
  };
  to_user: {
    display_name: string;
  };
}

const WalletInterface: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      fetchWallet();
    }
  }, [user, isOpen]);

  const fetchWallet = async () => {
    if (!user) return;

    try {
      // Use localStorage temporarily until database is ready
      const walletData = localStorage.getItem(`wallet_${user.id}`);
      if (walletData) {
        setWallet(JSON.parse(walletData));
      } else {
        // Create initial wallet
        const newWallet = {
          id: crypto.randomUUID(),
          user_id: user.id,
          balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        localStorage.setItem(`wallet_${user.id}`, JSON.stringify(newWallet));
        setWallet(newWallet);
      }

      // Load transactions
      const transactionsData = localStorage.getItem(`transactions_${user.id}`);
      if (transactionsData) {
        setTransactions(JSON.parse(transactionsData));
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFunds = async () => {
    if (!user || !wallet || !addAmount) return;

    const amount = parseFloat(addAmount);
    if (amount <= 0) {
      toast({
        title: 'Błąd',
        description: 'Kwota musi być większa od 0',
        variant: 'destructive'
      });
      return;
    }

    try {
      const updatedWallet = {
        ...wallet,
        balance: wallet.balance + amount,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(`wallet_${user.id}`, JSON.stringify(updatedWallet));
      setWallet(updatedWallet);
      setAddAmount('');

      toast({
        title: '💰 Środki dodane',
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

  const sendMoney = async () => {
    if (!user || !wallet || !sendAmount || !recipientEmail) return;

    const amount = parseFloat(sendAmount);
    if (amount <= 0) {
      toast({
        title: 'Błąd',
        description: 'Kwota musi być większa od 0',
        variant: 'destructive'
      });
      return;
    }

    if (wallet.balance < amount) {
      toast({
        title: 'Niewystarczające środki',
        description: 'Nie masz wystarczających środków na koncie',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Update wallet
      const updatedWallet = {
        ...wallet,
        balance: wallet.balance - amount,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(`wallet_${user.id}`, JSON.stringify(updatedWallet));
      setWallet(updatedWallet);

      // Add transaction record
      const newTransaction = {
        id: crypto.randomUUID(),
        from_user_id: user.id,
        to_user_id: 'recipient_id', // This would be looked up by email
        amount: amount,
        description: `Transfer to ${recipientEmail}`,
        created_at: new Date().toISOString(),
        from_user: { display_name: 'You' },
        to_user: { display_name: recipientEmail }
      };

      const currentTransactions = JSON.parse(localStorage.getItem(`transactions_${user.id}`) || '[]');
      const updatedTransactions = [newTransaction, ...currentTransactions];
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);

      setSendAmount('');
      setRecipientEmail('');

      toast({
        title: '💸 Pieniądze wysłane',
        description: `Wysłano ${amount} PLN do ${recipientEmail}`
      });
    } catch (error) {
      console.error('Error sending money:', error);
      toast({
        title: 'Błąd wysyłania',
        description: 'Nie udało się wysłać pieniędzy',
        variant: 'destructive'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>💰 Quantum Wallet - Wirtualny Portfel</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallet Balance */}
          <Card className="p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-emerald-500/30">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">Saldo Portfela</h3>
              <div className="text-4xl font-bold text-white mb-4">
                {wallet ? `${wallet.balance.toFixed(2)} PLN` : '0.00 PLN'}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="bg-blue-900/20 border-blue-500/30 text-blue-300"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Karta
                </Button>
                <Button 
                  variant="outline"
                  className="bg-purple-900/20 border-purple-500/30 text-purple-300"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  BLIK
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">⚡ Szybkie Akcje</h3>
            
            {/* Add Funds */}
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium">💳 Doładuj portfel</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Kwota w PLN"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addFunds} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Send Money */}
            <div className="space-y-3">
              <label className="text-sm font-medium">💸 Wyślij pieniądze</label>
              <Input
                type="email"
                placeholder="Email odbiorcy"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Kwota"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={sendMoney} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Payment Options */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">🚀 Szybkie Płatności</h3>
          <div className="grid grid-cols-4 gap-3">
            {[10, 25, 50, 100].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => setAddAmount(amount.toString())}
                className="h-16 text-lg font-semibold"
              >
                {amount} PLN
              </Button>
            ))}
          </div>
        </Card>

        {/* Transaction History */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            📊 Historia Transakcji
          </h3>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.from_user_id === user?.id ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {transaction.from_user_id === user?.id ? '-' : '+'}
                      {transaction.amount.toFixed(2)} PLN
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Brak transakcji</p>
              </div>
            )}
          </div>
        </Card>

        {/* Crypto Integration */}
        <Card className="p-6 bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border-orange-500/30">
          <h3 className="text-lg font-semibold mb-4 text-orange-300">🪙 Integracja Crypto</h3>
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="h-16 flex flex-col">
              <span className="text-2xl mb-1">₿</span>
              <span className="text-xs">Bitcoin</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col">
              <span className="text-2xl mb-1">Ξ</span>
              <span className="text-xs">Ethereum</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col">
              <QrCode className="w-6 h-6 mb-1" />
              <span className="text-xs">QR Pay</span>
            </Button>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Zamknij
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletInterface;
