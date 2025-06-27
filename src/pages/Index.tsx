import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import LandingPage from "@/components/LandingPage";
import EnhancedAuthForm from "@/components/EnhancedAuthForm";
import MainApp from "@/components/MainApp";
import { useAuth } from "@/hooks/useAuth";
import { databaseUtils } from "@/utils/databaseTroubleshoot";

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { user, loading } = useAuth();

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse mx-auto mb-4">
            <span className="text-white font-bold text-2xl">🛡️</span>
          </div>
          <p className="text-white text-xl">SecureChat Quantum</p>
          <p className="text-gray-300">Inicjalizowanie...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show the main app
  if (user) {
    return <MainApp />;
  }

  // If user is not logged in, show landing page
  return (
    <>
      <LandingPage onGetStarted={() => setShowAuth(true)} />
      {showAuth && <EnhancedAuthForm onClose={() => setShowAuth(false)} />}
    </>
  );
};

export default Index;
