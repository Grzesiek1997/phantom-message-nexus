
import React from 'react';
import Layout from '@/components/Layout';
import SecureAuthForm from '@/components/SecureAuthForm';
import RealTimeChatInterface from '@/components/RealTimeChatInterface';
import AdminDashboard from '@/components/AdminDashboard';
import PWAComponents from '@/components/PWAComponents';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const Index = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Sprawdź czy użytkownik jest administratorem
  const isAdmin = user?.email === '97gibek@gmail.com';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-white text-xl">Ładowanie SecureChat...</div>
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

  // Jeśli administrator chce dostęp do panelu admina, pokaż specjalną opcję
  if (isAdmin && window.location.search.includes('admin=true')) {
    return <AdminDashboard />;
  }

  return (
    <>
      <Layout>
        <RealTimeChatInterface />
      </Layout>
      <PWAComponents />
    </>
  );
};

export default Index;
