
import React from 'react';
import { Shield, Lock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark">
      {showHeader && (
        <header className="glass border-b border-white/10 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SecureChat</h1>
                <p className="text-xs text-gray-300">End-to-End Encrypted</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Encrypted</span>
            </div>
          </div>
        </header>
      )}
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
