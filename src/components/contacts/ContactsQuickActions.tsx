
import React from 'react';
import { UserPlus, QrCode, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactsQuickActionsProps {
  onAddContact?: () => void;
}

const ContactsQuickActions: React.FC<ContactsQuickActionsProps> = ({ onAddContact }) => {
  return (
    <div className="px-6 py-4 border-t border-white/10">
      <div className="flex items-center space-x-3">
        {onAddContact && (
          <Button
            onClick={onAddContact}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            size="sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Dodaj kontakt
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Skanuj QR
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Link className="w-4 h-4 mr-2" />
          Udostępnij profil
        </Button>
      </div>
    </div>
  );
};

export default ContactsQuickActions;
