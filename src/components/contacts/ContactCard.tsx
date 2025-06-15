
import React from 'react';
import { MessageCircle, Phone, Video, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Contact {
  id: string;
  profile?: {
    display_name?: string;
    username?: string;
  };
}

interface ContactCardProps {
  contact: Contact;
  onQuickAction: (action: string, contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onQuickAction, onDeleteContact }) => {
  const handleChatClick = () => {
    console.log('Starting chat with contact:', contact.id);
    onQuickAction('chat', contact);
  };

  return (
    <div className="flex items-center p-4 hover:bg-white/5 transition-colors rounded-lg">
      {/* Avatar */}
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
        <span className="text-white font-bold text-lg">
          {contact.profile?.display_name?.charAt(0)?.toUpperCase() || 
           contact.profile?.username?.charAt(0)?.toUpperCase() || '?'}
        </span>
      </div>

      {/* Contact Info */}
      <div className="flex-1">
        <h3 className="font-medium text-white">
          {contact.profile?.display_name || contact.profile?.username || 'Unknown'}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-1">
        <Button
          onClick={handleChatClick}
          size="sm"
          className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
          title="Rozpocznij czat"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => onQuickAction('call', contact)}
          size="sm"
          className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-colors"
          title="Zadzwoń"
        >
          <Phone className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => onQuickAction('video', contact)}
          size="sm"
          className="p-2 bg-purple-500/20 text-purple-400 rounded-full hover:bg-purple-500/30 transition-colors"
          title="Rozmowa wideo"
        >
          <Video className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => onQuickAction('info', contact)}
          size="sm"
          variant="ghost"
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Informacje"
        >
          <Info className="w-4 h-4" />
        </Button>
        {onDeleteContact && (
          <Button
            onClick={() => onDeleteContact(contact.id)}
            size="sm"
            className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
            title="Usuń kontakt"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
