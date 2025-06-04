
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Wallet } from 'lucide-react';
import SettingsPanel from './SettingsPanel';
import WalletInterface from './WalletInterface';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">💬</span>
            </div>
            <h1 className="text-xl font-bold text-white">SecureChat</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWallet(true)}
              className="text-white hover:bg-white/10"
            >
              <Wallet className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {children}
      </main>

      {/* Modals */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <WalletInterface isOpen={showWallet} onClose={() => setShowWallet(false)} />
    </div>
  );
};

export default Layout;
