
import React from 'react';
import { MessageCircle, Phone, Users, Settings } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'chats', icon: MessageCircle, label: 'Czaty' },
    { id: 'calls', icon: Phone, label: 'Połączenia' },
    { id: 'contacts', icon: Users, label: 'Kontakty', 'data-tab': 'contacts' },
    { id: 'settings', icon: Settings, label: 'Ustawienia' }
  ];

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm border-t border-gray-700">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              data-tab={tab['data-tab']}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-400' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
