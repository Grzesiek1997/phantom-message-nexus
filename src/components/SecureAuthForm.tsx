
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Shield, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import TurnstileWidget from '@/components/auth/TurnstileWidget';

interface SecureAuthFormProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

const SecureAuthForm: React.FC<SecureAuthFormProps> = ({ mode, onModeChange }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Hasła nie są identyczne');
        }
        if (formData.password.length < 6) {
          throw new Error('Hasło musi mieć co najmniej 6 znaków');
        }
        
        await signUp(formData.email, formData.password, formData.username, captchaToken || undefined);
      } else {
        await signIn(formData.email, formData.password, captchaToken || undefined);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      // Po błędzie pokaż CAPTCHA
      if (!showCaptcha) {
        setShowCaptcha(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    console.log('🔐 CAPTCHA verified successfully');
  };

  const handleCaptchaError = (error: string) => {
    console.error('CAPTCHA error:', error);
    setCaptchaToken(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <Card className="w-full max-w-md glass border-white/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Zaloguj się' : 'Załóż konto'}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {mode === 'login' 
              ? 'Wprowadź swoje dane aby uzyskać dostęp do SecureChat'
              : 'Utwórz bezpieczne konto w SecureChat'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Nazwa użytkownika</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Wprowadź nazwę użytkownika"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Wprowadź swój email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Hasło</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                  placeholder="Wprowadź hasło"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Potwierdź hasło</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Potwierdź hasło"
                />
              </div>
            )}
            
            {showCaptcha && (
              <div className="space-y-2">
                <Label className="text-white">Weryfikacja bezpieczeństwa</Label>
                <TurnstileWidget
                  onVerify={handleCaptchaVerify}
                  onError={handleCaptchaError}
                  className="w-full"
                />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? (
                'Ładowanie...'
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Zaloguj się
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Załóż konto
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              className="text-gray-300 hover:text-white"
              onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' 
                ? 'Nie masz konta? Załóż je tutaj'
                : 'Masz już konto? Zaloguj się'
              }
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              🔒 Twoje dane są chronione szyfrowaniem end-to-end
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureAuthForm;
