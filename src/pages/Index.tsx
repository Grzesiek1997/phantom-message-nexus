
import React from 'react';
import Layout from '@/components/Layout';
import SecureAuthForm from '@/components/SecureAuthForm';
import RealTimeChatInterface from '@/components/RealTimeChatInterface';
import AdminDashboard from '@/components/AdminDashboard';
import QuantumSecurityDashboard from '@/components/QuantumSecurityDashboard';
import QuantumVault from '@/components/QuantumVault';
import PWAComponents from '@/components/PWAComponents';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

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
    return (
      <>
        <SecureAuthForm 
          mode={authMode}
          onModeChange={setAuthMode}
        />
        <PWAComponents />
      </>
    );
  }

  // If admin wants access to admin panel
  if (isAdmin && window.location.search.includes('admin=true')) {
    return <AdminDashboard />;
  }

  return (
    <>
      <Layout>
        <div className="container mx-auto p-4">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 mb-6">
              <TabsTrigger value="chat">💬 Chat</TabsTrigger>
              <TabsTrigger value="security">🛡️ Security</TabsTrigger>
              <TabsTrigger value="vault">🔐 Vault</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin">👑 Admin</TabsTrigger>}
            </TabsList>

            <TabsContent value="chat">
              <RealTimeChatInterface />
            </TabsContent>

            <TabsContent value="security">
              <QuantumSecurityDashboard />
            </TabsContent>

            <TabsContent value="vault">
              <QuantumVault />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin">
                <AdminDashboard />
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
