
import React from 'react';
import { MessageCircle, Phone, Video, Info } from 'lucide-react';

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
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onQuickAction }) => {
  return (
    <div className="flex items-center p-4 hover:bg-white/5 transition-colors">
      {/* Avatar */}
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
        <span className="text-white font-bold">
          {contact.profile?.display_name?.charAt(0) || '?'}
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
        <button
          onClick={() => onQuickAction('chat', contact)}
          className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => onQuickAction('call', contact)}
          className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-colors"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          onClick={() => onQuickAction('video', contact)}
          className="p-2 bg-purple-500/20 text-purple-400 rounded-full hover:bg-purple-500/30 transition-colors"
        >
          <Video className="w-4 h-4" />
        </button>
        <button
          onClick={() => onQuickAction('info', contact)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ContactCard;
