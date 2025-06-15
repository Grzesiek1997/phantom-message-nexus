
import React from 'react';
import { Bell, UserPlus, Share, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactsHeaderProps {
  unreadCount: number;
  onAddContact: () => void;
  onShowNotifications: () => void;
}

const ContactsHeader: React.FC<ContactsHeaderProps> = ({
  unreadCount,
  onAddContact,
  onShowNotifications
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-white">Kontakty</h1>
      <div className="flex items-center space-x-2">
        {/* Add Contact Button */}
        <Button
          onClick={onAddContact}
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <UserPlus className="w-5 h-5" />
        </Button>

        {/* Share Profile Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <Share className="w-5 h-5" />
        </Button>

        {/* QR Code Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
        >
          <QrCode className="w-5 h-5" />
        </Button>

        {/* Notifications Button */}
        <Button
          onClick={onShowNotifications}
          variant="ghost"
          size="icon"
          className="relative text-gray-400 hover:text-white"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ContactsHeader;
