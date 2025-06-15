
import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Trash2, Plus, Send, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { isAdmin, testContacts, createTestContact, deleteTestContact, sendTestMessage, createDefaultTestContacts } = useAdmin();
  const [newContactUsername, setNewContactUsername] = useState('');
  const [newContactDisplayName, setNewContactDisplayName] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const { toast } = useToast();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="glass border-white/20">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Brak uprawnień administratora
            </h3>
            <p className="text-gray-400">
              Tylko administratorzy mogą uzyskać dostęp do tego panelu
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateContact = async () => {
    if (!newContactUsername.trim() || !newContactDisplayName.trim()) {
      toast({
        title: 'Błąd',
        description: 'Wypełnij wszystkie pola',
        variant: 'destructive'
      });
      return;
    }

    await createTestContact(newContactUsername.trim(), newContactDisplayName.trim());
    setNewContactUsername('');
    setNewContactDisplayName('');
  };

  const handleSendTestMessage = async (contactId: string) => {
    if (!testMessage.trim()) {
      toast({
        title: 'Błąd',
        description: 'Wpisz treść wiadomości',
        variant: 'destructive'
      });
      return;
    }

    await sendTestMessage(contactId, testMessage.trim());
    setTestMessage('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="w-8 h-8 text-blue-400" />
        <h1 className="text-3xl font-bold text-white">Panel Administratora</h1>
      </div>

      {/* Szybkie akcje */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Szybkie akcje
          </CardTitle>
          <CardDescription>
            Zarządzaj kontaktami testowymi i funkcjami testowymi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={createDefaultTestContacts}
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Stwórz domyślne kontakty testowe
          </Button>
        </CardContent>
      </Card>

      {/* Tworzenie nowego kontaktu testowego */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Stwórz nowy kontakt testowy</CardTitle>
          <CardDescription>
            Dodaj nowy kontakt testowy do systemu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Nazwa użytkownika
              </label>
              <Input
                placeholder="test_user_4"
                value={newContactUsername}
                onChange={(e) => setNewContactUsername(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Nazwa wyświetlana
              </label>
              <Input
                placeholder="Użytkownik Testowy 4"
                value={newContactDisplayName}
                onChange={(e) => setNewContactDisplayName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          <Button 
            onClick={handleCreateContact}
            className="w-full bg-green-500 hover:bg-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Stwórz kontakt testowy
          </Button>
        </CardContent>
      </Card>

      {/* Lista kontaktów testowych */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Kontakty testowe</CardTitle>
          <CardDescription>
            Lista wszystkich kontaktów testowych w systemie
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">Brak kontaktów testowych</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testContacts.map((contact) => (
                <div key={contact.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{contact.display_name}</h3>
                      <p className="text-gray-400 text-sm">@{contact.username}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Testowy
                      </Badge>
                      <Button
                        onClick={() => deleteTestContact(contact.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Wpisz wiadomość testową..."
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="flex-1 bg-gray-700 border-gray-600 text-white text-sm"
                      rows={2}
                    />
                    <Button
                      onClick={() => handleSendTestMessage(contact.id)}
                      className="bg-blue-500 hover:bg-blue-600"
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
