
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AuthForm from '@/components/AuthForm';
import ChatInterface from '@/components/ChatInterface';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { toast } = useToast();

  const handleAuthSubmit = (formData: any) => {
    console.log('Auth submission:', formData);
    
    // Simulate authentication success
    toast({
      title: authMode === 'login' ? 'Login Successful' : 'Account Created',
      description: authMode === 'login' 
        ? 'Welcome back to SecureChat' 
        : 'Your secure account has been created',
    });
    
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <AuthForm 
          mode={authMode}
          onModeChange={setAuthMode}
          onSubmit={handleAuthSubmit}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <ChatInterface />
    </Layout>
  );
};

export default Index;
