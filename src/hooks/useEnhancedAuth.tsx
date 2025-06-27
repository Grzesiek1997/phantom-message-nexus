import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EnhancedAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signUpWithUsername: (
    username: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithUsername: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  checkEmailAvailability: (email: string) => Promise<boolean>;
  refreshSession: () => Promise<void>;
  createProfile: (
    userId: string,
    username: string,
    displayName?: string,
  ) => Promise<void>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(
  undefined,
);

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error(
      "useEnhancedAuth must be used within an EnhancedAuthProvider",
    );
  }
  return context;
};

export const EnhancedAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!session;

  // Enhanced session initialization
  useEffect(() => {
    let isMounted = true;

    const getSession = async () => {
      try {
        console.log("🔄 Initializing enhanced auth session...");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Session error:", error);
          throw error;
        }

        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            console.log("✅ User authenticated:", session.user.email);
            await ensureProfile(session.user);
          } else {
            console.log("ℹ️ No active session found");
          }
        }
      } catch (error) {
        console.error("💥 Error getting session:", error);
        if (isMounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Enhanced auth state listener
  useEffect(() => {
    console.log("🔄 Setting up enhanced auth listener...");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "🔔 Enhanced auth state changed:",
        event,
        session?.user?.email,
      );

      try {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === "SIGNED_IN" && session?.user) {
          console.log("✅ User signed in successfully");
          await ensureProfile(session.user);
          toast({
            title: "🎉 Witamy z powrotem!",
            description: "Zostałeś pomyślnie zalogowany",
            duration: 3000,
          });
        }

        if (event === "SIGNED_OUT") {
          console.log("👋 User signed out");
          setSession(null);
          setUser(null);
        }

        if (event === "TOKEN_REFRESHED") {
          console.log("🔄 Token refreshed successfully");
        }

        if (event === "USER_UPDATED") {
          console.log("📝 User updated");
        }
      } catch (error) {
        console.error("💥 Error in auth state change:", error);
      }
    });

    return () => {
      console.log("🔌 Cleaning up enhanced auth listener");
      subscription.unsubscribe();
    };
  }, [toast]);

  // Ensure user profile exists
  const ensureProfile = async (user: User) => {
    try {
      console.log("🔍 Checking user profile...");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Profile doesn't exist, create it
        console.log("🆕 Creating new profile...");
        await createProfile(
          user.id,
          user.user_metadata?.username || user.email?.split("@")[0] || "user",
          user.user_metadata?.display_name || user.user_metadata?.full_name,
        );
      } else if (error) {
        console.error("❌ Error checking profile:", error);
      } else {
        console.log("✅ Profile found:", profile.username);
      }
    } catch (error) {
      console.error("💥 Error ensuring profile:", error);
    }
  };

  // Enhanced profile creation
  const createProfile = async (
    userId: string,
    username: string,
    displayName?: string,
  ) => {
    try {
      console.log("🔄 Creating profile for user:", userId);

      const { error } = await supabase.from("profiles").insert({
        id: userId,
        username: username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
        display_name: displayName || username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("❌ Error creating profile:", error);
        throw error;
      }

      console.log("✅ Profile created successfully");
    } catch (error) {
      console.error("💥 Error creating profile:", error);
      throw error;
    }
  };

  // Enhanced username availability check
  const checkUsernameAvailability = async (
    username: string,
  ): Promise<boolean> => {
    try {
      if (!username || username.length < 3) {
        return false;
      }

      console.log("🔍 Checking username availability:", username);

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .single();

      if (error && error.code === "PGRST116") {
        // No user found - username is available
        console.log("✅ Username available:", username);
        return true;
      }

      if (error) {
        console.error("❌ Error checking username:", error);
        return false;
      }

      console.log("⚠️ Username taken:", username);
      return false;
    } catch (error) {
      console.error("💥 Error checking username availability:", error);
      return false;
    }
  };

  // Enhanced email availability check
  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    try {
      console.log("🔍 Checking email availability:", email);

      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.toLowerCase())
        .single();

      if (error && error.code === "PGRST116") {
        console.log("✅ Email available:", email);
        return true;
      }

      console.log("⚠️ Email taken:", email);
      return false;
    } catch (error) {
      console.error("💥 Error checking email availability:", error);
      return true; // Assume available on error
    }
  };

  // Enhanced sign up with email
  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      console.log("🔄 Enhanced sign up with email:", email);

      // Check if username is available
      const isUsernameAvailable = await checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
        throw new Error("Nazwa użytkownika jest już zajęta");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.toLowerCase(),
            display_name: username,
          },
        },
      });

      if (error) {
        console.error("❌ Sign up error:", error);
        throw error;
      }

      if (data.user && !data.session) {
        toast({
          title: "📧 Potwierdź adres email",
          description:
            "Sprawdź swoją skrzynkę pocztową i kliknij link aktywacyjny",
          duration: 10000,
        });
      }

      console.log("✅ Sign up successful");
    } catch (error: any) {
      console.error("💥 Enhanced sign up error:", error);
      toast({
        title: "Błąd rejestracji",
        description: error.message || "Nie udało się zarejestrować",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign up with username
  const signUpWithUsername = async (
    username: string,
    password: string,
    displayName?: string,
  ) => {
    try {
      setLoading(true);
      console.log("🔄 Enhanced sign up with username:", username);

      // Create a temporary email for username-based signup
      const tempEmail = `${username.toLowerCase()}@temp.securechat.app`;

      await signUp(tempEmail, password, username);
    } catch (error) {
      console.error("💥 Enhanced username sign up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign in with email
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("🔄 Enhanced sign in with email:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Sign in error:", error);
        throw error;
      }

      console.log("✅ Sign in successful");
    } catch (error: any) {
      console.error("💥 Enhanced sign in error:", error);
      toast({
        title: "Błąd logowania",
        description: error.message || "Nieprawidłowy email lub hasło",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign in with username
  const signInWithUsername = async (username: string, password: string) => {
    try {
      setLoading(true);
      console.log("🔄 Enhanced sign in with username:", username);

      // First, find the user by username
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .single();

      if (profileError || !profile) {
        throw new Error("Nie znaleziono użytkownika o tej nazwie");
      }

      // Try to sign in with temp email format
      const tempEmail = `${username.toLowerCase()}@temp.securechat.app`;
      await signIn(tempEmail, password);
    } catch (error: any) {
      console.error("💥 Enhanced username sign in error:", error);
      toast({
        title: "Błąd logowania",
        description:
          error.message || "Nieprawidłowa nazwa użytkownika lub hasło",
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign out
  const signOut = async () => {
    try {
      console.log("🔄 Enhanced sign out...");

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Sign out error:", error);
        throw error;
      }

      setSession(null);
      setUser(null);

      console.log("✅ Sign out successful");

      toast({
        title: "👋 Do zobaczenia!",
        description: "Zostałeś pomyślnie wylogowany",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("💥 Enhanced sign out error:", error);
      toast({
        title: "Błąd wylogowania",
        description: error.message || "Nie udało się wylogować",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      console.log("🔄 Refreshing session...");

      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("❌ Refresh session error:", error);
        throw error;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        console.log("✅ Session refreshed successfully");
      }
    } catch (error) {
      console.error("💥 Error refreshing session:", error);
      throw error;
    }
  };

  const value: EnhancedAuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    signUp,
    signUpWithUsername,
    signIn,
    signInWithUsername,
    signOut,
    checkUsernameAvailability,
    checkEmailAvailability,
    refreshSession,
    createProfile,
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

// Hook to check if user needs to complete profile
export const useProfileCompletion = () => {
  const { user } = useEnhancedAuth();
  const [profileComplete, setProfileComplete] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("username, display_name")
          .eq("id", user.id)
          .single();

        if (error || !profile) {
          setProfileComplete(false);
        } else {
          setProfileComplete(!!profile.username && !!profile.display_name);
        }
      } catch (error) {
        console.error("Error checking profile completion:", error);
        setProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [user]);

  return { profileComplete, loading };
};
