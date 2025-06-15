
import React from 'react';
import { UserPlus, Bell, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ContactsHeaderProps {
  unreadCount: number;
  onAddContact: () => void;
  onShowNotifications: () => void;
  onGoBack?: () => void;
  showBackButton?: boolean;
}

const ContactsHeader: React.FC<ContactsHeaderProps> = ({
  unreadCount,
  onAddContact,
  onShowNotifications,
  onGoBack,
  showBackButton = true
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        {showBackButton && onGoBack && (
          <Button
            onClick={onGoBack}
            variant="ghost"
            size="icon"
            className="mr-3 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-2xl font-bold text-white">Kontakty</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          onClick={onAddContact}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          size="sm"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Dodaj
        </Button>
        
        <div className="relative">
          <Button
            onClick={onShowNotifications}
            variant="outline"
            size="icon"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Bell className="w-4 h-4" />
          </Button>
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[20px] h-5 flex items-center justify-center rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsHeader;
