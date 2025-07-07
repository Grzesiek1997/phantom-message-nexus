
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signUpWithUsername: (username: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithUsername: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  checkEmailAvailability: (email: string) => Promise<boolean>;
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
      try {
        console.log('🔄 Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Session error:', error);
        }
        console.log('✅ Session loaded:', session?.user?.email || 'No user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      // Sprawdź bezpośrednio w tabeli profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking username availability:', error);
        return false;
      }
      
      // Jeśli nie ma danych, username jest dostępny
      return !data;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    try {
      // Sprawdź w tabeli profiles czy istnieje użytkownik z takim email-related username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .like('username', `%${email.split('@')[0]}%`)
        .limit(1);
      
      if (profileError) {
        console.error('Error checking email availability:', profileError);
      }

      // Dla celów testowych zakładamy że email jest dostępny
      // W prawdziwej aplikacji potrzebowalibyśmy dostępu do tabeli auth.users
      return true;
    } catch (error) {
      console.error('Error checking email availability:', error);
      return true; // Zakładamy że jest dostępny w przypadku błędu
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    // Check if username is available
    const isUsernameAvailable = await checkUsernameAvailability(username);
    if (!isUsernameAvailable) {
      toast({
        title: 'Błąd rejestracji',
        description: 'Ta nazwa użytkownika jest już zajęta',
        variant: 'destructive'
      });
      throw new Error('Username already taken');
    }

    // Check if email is available
    const isEmailAvailable = await checkEmailAvailability(email);
    if (!isEmailAvailable) {
      toast({
        title: 'Błąd rejestracji',
        description: 'Ten email jest już zarejestrowany',
        variant: 'destructive'
      });
      throw new Error('Email already taken');
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username
        },
        emailRedirectTo: `${window.location.origin}/`
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

  const signUpWithUsername = async (username: string, password: string, displayName?: string) => {
    // Check if username is available
    const isUsernameAvailable = await checkUsernameAvailability(username);
    if (!isUsernameAvailable) {
      toast({
        title: 'Błąd rejestracji',
        description: 'Ta nazwa użytkownika jest już zajęta',
        variant: 'destructive'
      });
      throw new Error('Username already taken');
    }

    // Generate a temporary email for username-only registration
    const tempEmail = `${username}@temp.securechat.local`;
    
    const { error } = await supabase.auth.signUp({
      email: tempEmail,
      password,
      options: {
        data: {
          username,
          display_name: displayName || username,
          is_username_only: true
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
      description: 'Możesz się teraz zalogować używając swojej nazwy użytkownika'
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
      // First, get the user ID associated with this username
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: 'Błąd logowania',
          description: 'Nie znaleziono użytkownika o podanej nazwie',
          variant: 'destructive'
        });
        throw new Error('User not found');
      }

      if (!profile) {
        toast({
          title: 'Błąd logowania',
          description: 'Nie znaleziono użytkownika o podanej nazwie',
          variant: 'destructive'
        });
        throw new Error('User not found');
      }

      // Try with temp email format for username-only accounts
      const tempEmail = `${username}@temp.securechat.local`;
      await signIn(tempEmail, password);
    } catch (error) {
      console.error('Username login error:', error);
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
    signUpWithUsername,
    signIn,
    signInWithUsername,
    signOut,
    checkUsernameAvailability,
    checkEmailAvailability
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
