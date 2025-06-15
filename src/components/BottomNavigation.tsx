
import React from 'react';
import { MessageCircle, Phone, Users, Settings } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'chats', label: 'Czaty', icon: MessageCircle },
    { id: 'calls', label: 'Połączenia', icon: Phone },
    { id: 'contacts', label: 'Kontakty', icon: Users },
    { id: 'settings', label: 'Ustawienia', icon: Settings }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 safe-bottom">
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-105' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'animate-bounce' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="w-2 h-2 bg-white rounded-full mt-1 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
