
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { Contact } from '@/hooks/useContacts';

interface DeleteContactDialogProps {
  contact: Contact;
  onDeleteContact: (contactId: string) => void;
}

const DeleteContactDialog: React.FC<DeleteContactDialogProps> = ({ contact, onDeleteContact }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          className="bg-red-600 hover:bg-red-700"
          title="Usuń znajomego"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-900 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Usuń znajomego
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Czy na pewno chcesz usunąć {contact.profile.display_name} z listy znajomych? 
            Tej operacji nie można cofnąć.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
            Anuluj
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => onDeleteContact(contact.id)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Usuń
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteContactDialog;
