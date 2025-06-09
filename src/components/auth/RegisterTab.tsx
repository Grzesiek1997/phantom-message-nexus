
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Fingerprint } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useBiometric } from '@/hooks/useBiometric';

interface RegisterTabProps {
  onClose: () => void;
}

const RegisterTab: React.FC<RegisterTabProps> = ({ onClose }) => {
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    agreeTerms: false,
    agreePrivacy: false,
    enableBiometric: false
  });
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const { setupBiometric, isSupported } = useBiometric();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: 'Błąd',
        description: 'Hasła nie są identyczne',
        variant: 'destructive'
      });
      return;
    }

    if (!registerData.agreeTerms || !registerData.agreePrivacy) {
      toast({
        title: 'Błąd',
        description: 'Musisz zaakceptować regulamin i politykę prywatności',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      await signUp(registerData.email, registerData.password, registerData.username);
      
      if (registerData.enableBiometric && isSupported) {
        try {
          await setupBiometric(registerData.username);
          toast({
            title: 'Sukces',
            description: 'Konto utworzone z logowaniem biometrycznym',
          });
        } catch (error) {
          toast({
            title: 'Ostrzeżenie',
            description: 'Konto utworzone, ale nie udało się skonfigurować biometrii',
            variant: 'destructive'
          });
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white">Nazwa użytkownika</Label>
        <Input
          type="text"
          placeholder="twoja_nazwa"
          value={registerData.username}
          onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Email</Label>
        <Input
          type="email"
          placeholder="twoj@email.com"
          value={registerData.email}
          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Hasło</Label>
        <Input
          type="password"
          placeholder="Silne hasło"
          value={registerData.password}
          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Potwierdź hasło</Label>
        <Input
          type="password"
          placeholder="Powtórz hasło"
          value={registerData.confirmPassword}
          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={registerData.agreeTerms}
            onCheckedChange={(checked) => setRegisterData({...registerData, agreeTerms: checked as boolean})}
          />
          <Label htmlFor="terms" className="text-sm text-gray-300">
            Akceptuję <span className="text-blue-400">Regulamin</span>
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="privacy"
            checked={registerData.agreePrivacy}
            onCheckedChange={(checked) => setRegisterData({...registerData, agreePrivacy: checked as boolean})}
          />
          <Label htmlFor="privacy" className="text-sm text-gray-300">
            Akceptuję <span className="text-blue-400">Politykę Prywatności</span>
          </Label>
        </div>

        {isSupported && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="biometric"
              checked={registerData.enableBiometric}
              onCheckedChange={(checked) => setRegisterData({...registerData, enableBiometric: checked as boolean})}
            />
            <Label htmlFor="biometric" className="text-sm text-gray-300 flex items-center">
              <Fingerprint className="w-4 h-4 mr-1" />
              Włącz logowanie biometryczne
            </Label>
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
        disabled={loading}
      >
        {loading ? 'Tworzenie konta...' : 'Utwórz Konto'}
      </Button>
    </form>
  );
};

export default RegisterTab;
