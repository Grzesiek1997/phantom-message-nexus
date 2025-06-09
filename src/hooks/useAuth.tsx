
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithUsername: (username: string, password: string) => Promise<void>;
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

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username
        }
      }
    });

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

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

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

  const signInWithUsername = async (username: string, password: string) => {
    try {
      // First, get the email associated with this username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (profileError || !profile) {
        toast({
          title: 'Błąd logowania',
          description: 'Nie znaleziono użytkownika o podanej nazwie',
          variant: 'destructive'
        });
        throw new Error('User not found');
      }

      // Get user email from auth.users using the profile id
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(profile.id);
      
      if (userError || !user?.email) {
        toast({
          title: 'Błąd logowania',
          description: 'Nie udało się pobrać danych użytkownika',
          variant: 'destructive'
        });
        throw userError;
      }

      // Now sign in with email and password
      await signIn(user.email, password);
    } catch (error) {
      console.error('Username login error:', error);
      // For security reasons, we'll use a generic error message
      toast({
        title: 'Błąd logowania',
        description: 'Nieprawidłowa nazwa użytkownika lub hasło',
        variant: 'destructive'
      });
      throw error;
    }
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
    signInWithUsername,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
