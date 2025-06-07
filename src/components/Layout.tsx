
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Settings, 
  Shield, 
  Users, 
  Phone,
  Video,
  Search,
  Menu,
  X,
  Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import AdminDashboard from './AdminDashboard';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeView, setActiveView] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { isAdmin, isModerator, loading: adminLoading } = useAdminCheck();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const sidebarItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'contacts', label: 'Kontakty', icon: Users },
    { id: 'calls', label: 'Połączenia', icon: Phone },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'search', label: 'Szukaj', icon: Search },
    { id: 'settings', label: 'Ustawienia', icon: Settings },
  ];

  // Only add admin panel for actual admins
  if (isAdmin && !adminLoading) {
    sidebarItems.push({
      id: 'admin',
      label: 'Panel Administratora',
      icon: Crown
    });
  }

  if (activeView === 'admin' && isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-black/30 backdrop-blur-lg border-r border-white/10
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200
      `}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <span className="text-white font-bold">SecureChat</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Button
                    variant={activeView === item.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start text-white hover:bg-white/10"
                    onClick={() => {
                      setActiveView(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                    {item.id === 'admin' && (
                      <Crown className="w-4 h-4 ml-auto text-yellow-400" />
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {isAdmin ? '👑 Administrator' : isModerator ? '🛡️ Moderator' : '👤 Użytkownik'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full text-white border-white/20 hover:bg-white/10"
            onClick={handleSignOut}
          >
            Wyloguj się
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="lg:hidden flex items-center justify-between p-4 bg-black/20 backdrop-blur-lg border-b border-white/10">
          <Button
            variant="ghost"
            size="sm"
            className="text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-white font-semibold">SecureChat Quantum</h1>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
