
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Settings, UserMinus, Crown, Shield, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GroupManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, participants: string[]) => void;
  contacts: Array<{
    id: string;
    contact_user_id: string;
    profile: {
      username: string;
      display_name: string;
    };
  }>;
}

const GroupManagement: React.FC<GroupManagementProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
  contacts
}) => {
  const [step, setStep] = useState<'create' | 'manage'>('create');
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toast } = useToast();

  const filteredContacts = contacts.filter(contact =>
    contact.profile.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.profile.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: 'Błąd',
        description: 'Wprowadź nazwę grupy',
        variant: 'destructive'
      });
      return;
    }

    if (selectedContacts.length === 0) {
      toast({
        title: 'Błąd',
        description: 'Wybierz co najmniej jedną osobę do grupy',
        variant: 'destructive'
      });
      return;
    }

    onCreateGroup(groupName, selectedContacts);
    
    toast({
      title: 'Sukces',
      description: 'Grupa została utworzona',
    });
    
    // Reset form
    setGroupName('');
    setSelectedContacts([]);
    setStep('manage');
  };

  const resetForm = () => {
    setStep('create');
    setGroupName('');
    setSelectedContacts([]);
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { onClose(); resetForm(); }}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <DialogTitle className="text-xl font-bold">
                {step === 'create' ? 'Utwórz grupę' : 'Zarządzaj grupą'}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { onClose(); resetForm(); }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {step === 'create' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Nazwa grupy</Label>
              <Input
                placeholder="Wprowadź nazwę grupy..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Dodaj członków</Label>
              <Input
                placeholder="Szukaj kontaktów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactToggle(contact.contact_user_id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedContacts.includes(contact.contact_user_id)
                      ? 'bg-blue-600/30 border border-blue-500/50'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {contact.profile.display_name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{contact.profile.display_name}</p>
                    <p className="text-xs text-gray-400">@{contact.profile.username}</p>
                  </div>
                  {selectedContacts.includes(contact.contact_user_id) && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-gray-400">
                Wybrano: {selectedContacts.length} członków
              </p>
              <Button
                onClick={handleCreateGroup}
                className="bg-blue-500 hover:bg-blue-600"
                disabled={!groupName.trim() || selectedContacts.length === 0}
              >
                Utwórz grupę
              </Button>
            </div>
          </div>
        )}

        {step === 'manage' && (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-green-300 font-semibold mb-2">✅ Grupa utworzona!</h3>
              <p className="text-sm text-gray-300 mb-4">
                Grupa "{groupName}" została pomyślnie utworzona. Jako administrator masz następujące uprawnienia:
              </p>
              
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span>Zarządzanie członkami grupy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span>Zmiana nazwy i ustawień grupy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Kontrola uprawnień użytkowników</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserMinus className="w-4 h-4 text-red-400" />
                  <span>Usuwanie członków z grupy</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => setStep('create')}
                variant="outline"
                className="w-full bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
              >
                Utwórz kolejną grupę
              </Button>
              
              <Button
                onClick={() => { onClose(); resetForm(); }}
                className="w-full bg-gray-600 hover:bg-gray-700"
              >
                Zamknij
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GroupManagement;
