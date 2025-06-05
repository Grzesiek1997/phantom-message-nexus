
import React from 'react';
import Layout from '@/components/Layout';
import LandingPage from '@/components/LandingPage';
import SecureAuthForm from '@/components/SecureAuthForm';
import RealTimeChatInterface from '@/components/RealTimeChatInterface';
import AdminDashboard from '@/components/AdminDashboard';
import QuantumSecurityDashboard from '@/components/QuantumSecurityDashboard';
import SwarmSecurityDashboard from '@/components/SwarmSecurityDashboard';
import NeuromorphicSecurityDashboard from '@/components/NeuromorphicSecurityDashboard';
import SecurityDashboard from '@/components/SecurityDashboard';
import QuantumVault from '@/components/QuantumVault';
import PWAComponents from '@/components/PWAComponents';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'admin'>('main');

  // Check if user is administrator
  const isAdmin = user?.email === '97gibek@gmail.com';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-white text-xl">🔐 Loading SecureChat Quantum...</div>
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return (
        <div className="relative">
          {/* Back button for auth form */}
          <Button
            variant="ghost"
            onClick={() => setShowAuth(false)}
            className="absolute top-4 left-4 z-50 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót
          </Button>
          <SecureAuthForm 
            mode={authMode}
            onModeChange={setAuthMode}
          />
          <PWAComponents />
        </div>
      );
    }

    return (
      <>
        <LandingPage onGetStarted={() => setShowAuth(true)} />
        <PWAComponents />
      </>
    );
  }

  // If admin wants access to admin panel
  if (isAdmin && window.location.search.includes('admin=true')) {
    return <AdminDashboard />;
  }

  // Admin view toggle
  if (currentView === 'admin' && isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('main')}
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót do aplikacji
          </Button>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <>
      <Layout>
        <div className="container mx-auto p-4">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-7 bg-gray-800 mb-6">
              <TabsTrigger value="chat">💬 Chat</TabsTrigger>
              <TabsTrigger value="security">🛡️ Security</TabsTrigger>
              <TabsTrigger value="quantum">⚛️ Quantum</TabsTrigger>
              <TabsTrigger value="neural">🧠 Neural</TabsTrigger>
              <TabsTrigger value="swarm">🐜 Swarm</TabsTrigger>
              <TabsTrigger value="vault">🔐 Vault</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin">👑 Admin</TabsTrigger>}
            </TabsList>

            <TabsContent value="chat">
              <RealTimeChatInterface />
            </TabsContent>

            <TabsContent value="security">
              <SecurityDashboard />
            </TabsContent>

            <TabsContent value="quantum">
              <QuantumSecurityDashboard />
            </TabsContent>

            <TabsContent value="neural">
              <NeuromorphicSecurityDashboard />
            </TabsContent>

            <TabsContent value="swarm">
              <SwarmSecurityDashboard />
            </TabsContent>

            <TabsContent value="vault">
              <QuantumVault />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin">
                <div className="flex justify-center">
                  <Button
                    onClick={() => setCurrentView('admin')}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                  >
                    👑 Otwórz Panel Administracyjny
                  </Button>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </Layout>
      <PWAComponents />
    </>
  );
};

export default Index;
