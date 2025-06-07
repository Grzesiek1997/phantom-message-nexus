
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, captchaToken?: string) => Promise<void>;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, captchaToken?: string) => {
    const signUpData: any = {
      email,
      password,
      options: {
        data: {
          username,
          display_name: username
        }
      }
    };

    // Add CAPTCHA token if provided
    if (captchaToken) {
      signUpData.options.captchaToken = captchaToken;
    }

    const { error } = await supabase.auth.signUp(signUpData);

    if (error) {
      toast({
        title: 'Błąd rejestracji',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }

    toast({
      title: 'Konto utworzone',
      description: 'Sprawdź swoją skrzynkę e-mail aby zweryfikować konto'
    });
  };

  const signIn = async (email: string, password: string, captchaToken?: string) => {
    const signInData: any = {
      email,
      password
    };

    // Add CAPTCHA token if provided
    if (captchaToken) {
      signInData.options = {
        captchaToken
      };
    }

    const { error } = await supabase.auth.signInWithPassword(signInData);

    if (error) {
      toast({
        title: 'Błąd logowania',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }

    toast({
      title: 'Zalogowano pomyślnie',
      description: 'Witaj w SecureChat'
    });
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Błąd wylogowania',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
