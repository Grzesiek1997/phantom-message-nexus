import { supabase } from "@/integrations/supabase/client";

// Database troubleshooting and repair utilities
export class DatabaseTroubleshoot {
  // Test database connection
  static async testConnection(): Promise<boolean> {
    try {
      console.log("🔍 Testing database connection...");

      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      if (error) {
        console.error("❌ Database connection error:", error);
        return false;
      }

      console.log("✅ Database connection successful");
      return true;
    } catch (error) {
      console.error("💥 Database connection failed:", error);
      return false;
    }
  }

  // Check if user profile exists and create if missing
  static async ensureUserProfile(
    userId: string,
    email?: string,
  ): Promise<boolean> {
    try {
      console.log("🔍 Checking user profile for:", userId);

      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("❌ Error checking profile:", checkError);
        throw checkError;
      }

      if (!existingProfile) {
        console.log("🆕 Creating missing profile...");

        // Generate username from email or fallback
        const username = email
          ? email
              .split("@")[0]
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, "")
          : `user_${userId.slice(0, 8)}`;

        const { error: createError } = await supabase.from("profiles").insert({
          id: userId,
          username,
          display_name: username,
          email: email || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (createError) {
          console.error("❌ Error creating profile:", createError);
          throw createError;
        }

        console.log("✅ Profile created successfully");
      } else {
        console.log("✅ Profile already exists");
      }

      return true;
    } catch (error) {
      console.error("💥 Error ensuring user profile:", error);
      return false;
    }
  }

  // Repair missing conversations table data
  static async repairConversationsTable(): Promise<boolean> {
    try {
      console.log("🔧 Checking conversations table...");

      const { error } = await supabase
        .from("conversations")
        .select("count")
        .limit(1);

      if (error) {
        console.error("❌ Conversations table error:", error);
        return false;
      }

      console.log("✅ Conversations table accessible");
      return true;
    } catch (error) {
      console.error("💥 Error checking conversations table:", error);
      return false;
    }
  }

  // Check and repair RLS policies
  static async checkRLSPolicies(): Promise<boolean> {
    try {
      console.log("🔍 Checking RLS policies...");

      // Test profiles access
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (error) {
        console.error("❌ RLS policy error:", error);
        return false;
      }

      console.log("✅ RLS policies working");
      return true;
    } catch (error) {
      console.error("💥 Error checking RLS policies:", error);
      return false;
    }
  }

  // Full database health check
  static async performHealthCheck(): Promise<{
    connection: boolean;
    rls: boolean;
    conversations: boolean;
    overall: boolean;
  }> {
    console.log("🏥 Starting database health check...");

    const results = {
      connection: false,
      rls: false,
      conversations: false,
      overall: false,
    };

    try {
      results.connection = await this.testConnection();
      results.rls = await this.checkRLSPolicies();
      results.conversations = await this.repairConversationsTable();

      results.overall =
        results.connection && results.rls && results.conversations;

      console.log("📊 Health check results:", results);

      return results;
    } catch (error) {
      console.error("💥 Health check failed:", error);
      return results;
    }
  }

  // Fix authentication issues
  static async fixAuthenticationIssues(): Promise<boolean> {
    try {
      console.log("🔧 Fixing authentication issues...");

      // Get current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Session error:", error);
        return false;
      }

      if (session?.user) {
        // Ensure profile exists
        const profileFixed = await this.ensureUserProfile(
          session.user.id,
          session.user.email || undefined,
        );

        if (!profileFixed) {
          console.error("❌ Failed to fix user profile");
          return false;
        }
      }

      console.log("✅ Authentication issues fixed");
      return true;
    } catch (error) {
      console.error("💥 Error fixing authentication:", error);
      return false;
    }
  }

  // Clear and rebuild user session
  static async rebuildUserSession(): Promise<boolean> {
    try {
      console.log("🔄 Rebuilding user session...");

      // Sign out and refresh
      await supabase.auth.signOut();

      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get fresh session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Error rebuilding session:", error);
        return false;
      }

      console.log("✅ Session rebuilt successfully");
      return true;
    } catch (error) {
      console.error("💥 Error rebuilding session:", error);
      return false;
    }
  }

  // Emergency database repair
  static async emergencyRepair(): Promise<boolean> {
    try {
      console.log("🚨 Starting emergency database repair...");

      // 1. Health check
      const health = await this.performHealthCheck();

      if (health.overall) {
        console.log("✅ Database is healthy, no repair needed");
        return true;
      }

      // 2. Fix authentication
      if (!health.connection || !health.rls) {
        const authFixed = await this.fixAuthenticationIssues();
        if (!authFixed) {
          console.error("❌ Failed to fix authentication");
          return false;
        }
      }

      // 3. Final health check
      const finalHealth = await this.performHealthCheck();

      if (finalHealth.overall) {
        console.log("✅ Emergency repair successful");
        return true;
      } else {
        console.error("❌ Emergency repair failed");
        return false;
      }
    } catch (error) {
      console.error("💥 Emergency repair error:", error);
      return false;
    }
  }
}

// Auto-fix database issues on app load
export const initializeDatabaseFix = async () => {
  try {
    console.log("🚀 Initializing database auto-fix...");

    const health = await DatabaseTroubleshoot.performHealthCheck();

    if (!health.overall) {
      console.log("⚠️ Database issues detected, attempting auto-repair...");
      const repaired = await DatabaseTroubleshoot.emergencyRepair();

      if (repaired) {
        console.log("✅ Database auto-repair successful");
      } else {
        console.error("❌ Database auto-repair failed");
      }
    } else {
      console.log("✅ Database is healthy");
    }
  } catch (error) {
    console.error("💥 Database initialization error:", error);
  }
};

// Export utilities
export const databaseUtils = {
  testConnection: DatabaseTroubleshoot.testConnection,
  ensureProfile: DatabaseTroubleshoot.ensureUserProfile,
  healthCheck: DatabaseTroubleshoot.performHealthCheck,
  emergencyRepair: DatabaseTroubleshoot.emergencyRepair,
  fixAuth: DatabaseTroubleshoot.fixAuthenticationIssues,
};
