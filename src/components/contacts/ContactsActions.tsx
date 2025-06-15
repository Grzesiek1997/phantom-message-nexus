
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import ContactsQuickActions from './ContactsQuickActions';
import FriendSearchDialog from './FriendSearchDialog';

interface ContactsActionsProps {
  showFriendSearchDialog: boolean;
  onShowFriendSearch: () => void;
  onCloseFriendSearch: () => void;
}

const ContactsActions: React.FC<ContactsActionsProps> = ({
  showFriendSearchDialog,
  onShowFriendSearch,
  onCloseFriendSearch
}) => {
  return (
    <>
      <div className="flex justify-center pb-4">
        <Button
          onClick={onShowFriendSearch}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-700 hover:to-purple-800 text-white font-semibold py-2 px-6 rounded-lg text-lg shadow"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Dodaj znajomego
        </Button>
      </div>

      <ContactsQuickActions onAddContact={onShowFriendSearch} />

      <FriendSearchDialog
        isOpen={showFriendSearchDialog}
        onClose={onCloseFriendSearch}
      />
    </>
  );
};

export default ContactsActions;
