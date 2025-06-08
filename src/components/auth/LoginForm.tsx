
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Lock, Shield, Fingerprint, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    emailOrUsername: '',
    password: '',
    rememberMe: false
  });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    agreeTerms: false,
    agreePrivacy: false
  });
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Try to login with email first, if it fails, try with username
      let email = loginData.emailOrUsername;
      if (!email.includes('@')) {
        // If it's not an email, we need to find the email by username
        // For now, we'll show an error asking for email
        toast({
          title: 'Błąd logowania',
          description: 'Wprowadź adres email zamiast nazwy użytkownika',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      await signIn(email, loginData.password);
      onClose();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

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
      onClose();
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md glass border-white/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="w-8" />
          </div>
          <CardTitle className="text-white text-2xl">SecureChat Quantum</CardTitle>
          <CardDescription className="text-gray-300">
            Najbezpieczniejszy komunikator na świecie
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Logowanie</TabsTrigger>
              <TabsTrigger value="register">Rejestracja</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Email</Label>
                  <Input
                    type="email"
                    placeholder="twoj@email.com"
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

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
                  >
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Logowanie biometryczne
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
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
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Tworzenie konta...' : 'Utwórz Konto'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t border-gray-600">
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-gray-300 hover:text-white"
            >
              Zamknij
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
