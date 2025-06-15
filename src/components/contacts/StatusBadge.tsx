
import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import type { Contact } from '@/hooks/useContacts';

interface StatusBadgeProps {
  contact: Contact;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ contact }) => {
  if (contact.friend_request_status === 'accepted') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
        <Check className="w-3 h-3 mr-1" />
        Zaakceptowany
      </span>
    );
  } else if (contact.friend_request_status === 'pending') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
        <Clock className="w-3 h-3 mr-1" />
        Oczekuje
      </span>
    );
  } else if (contact.friend_request_status === 'rejected') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
        <AlertCircle className="w-3 h-3 mr-1" />
        Odrzucony
      </span>
    );
  }
  return null;
};

export default StatusBadge;
