
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Fingerprint } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useBiometric } from '@/hooks/useBiometric';

interface LoginTabProps {
  onClose: () => void;
}

const LoginTab: React.FC<LoginTabProps> = ({ onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    emailOrUsername: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  
  const { signIn, signInWithUsername } = useAuth();
  const { authenticateWithBiometric, isSupported } = useBiometric();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { emailOrUsername, password } = loginData;
      
      // Check if input contains @ symbol to determine if it's email or username
      if (emailOrUsername.includes('@')) {
        await signIn(emailOrUsername, password);
      } else {
        await signInWithUsername(emailOrUsername, password);
      }
      onClose();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white">Email lub nazwa użytkownika</Label>
        <Input
          type="text"
          placeholder="twoj@email.com lub nazwa_uzytkownika"
          value={loginData.emailOrUsername}
          onChange={(e) => setLoginData({...loginData, emailOrUsername: e.target.value})}
          className="bg-gray-800 border-gray-600 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Hasło</Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Twoje hasło"
            value={loginData.password}
            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            className="bg-gray-800 border-gray-600 text-white pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          checked={loginData.rememberMe}
          onCheckedChange={(checked) => setLoginData({...loginData, rememberMe: checked as boolean})}
        />
        <Label htmlFor="remember" className="text-sm text-gray-300">
          Zapamiętaj mnie
        </Label>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        disabled={loading}
      >
        {loading ? 'Logowanie...' : 'Zaloguj się'}
      </Button>

      {isSupported && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
            onClick={handleBiometricLogin}
          >
            <Fingerprint className="w-4 h-4 mr-2" />
            Logowanie biometryczne
          </Button>
        </div>
      )}
    </form>
  );
};

export default LoginTab;
