import React from 'react';
import { UserPlus, QrCode, Link, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FriendSearchDialog from "./FriendSearchDialog";

interface ContactsQuickActionsProps {
  onAddContact?: () => void;
}

const ContactsQuickActions: React.FC<ContactsQuickActionsProps> = ({ onAddContact }) => {
  const [showAddFriend, setShowAddFriend] = React.useState(false);

  return (
    <div className="px-6 py-4 border-t border-white/10">
      <div className="flex flex-col space-y-3">
        {/* Główny przycisk wyszukiwania kontaktów */}
        <Button
          onClick={() => setShowAddFriend(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-4 text-lg font-semibold"
          size="lg"
        >
          <UserPlus className="w-5 h-5 mr-3" />
          Dodaj znajomego
        </Button>
        
        {/* Dodatkowe akcje */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10 flex-1"
            onClick={onAddContact}
          >
            <Search className="w-4 h-4 mr-2" />
            Wyszukaj użytkownika
          </Button>
        </div>
      </div>
      {/* MODAL */}
      {showAddFriend && (
        <FriendSearchDialog isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} />
      )}
    </div>
  );
};
export default ContactsQuickActions;
