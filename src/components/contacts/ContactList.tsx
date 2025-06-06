
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Phone, Video, MessageCircle, MoreVertical, Shield, QrCode } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Contact {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastSeen?: Date;
  isBlocked?: boolean;
  isVerified?: boolean;
  mutualContacts?: number;
  phoneNumber?: string;
}

interface ContactListProps {
  onStartChat: (contactId: string) => void;
  onStartCall: (contactId: string, type: 'voice' | 'video') => void;
}

const ContactList: React.FC<ContactListProps> = ({ onStartChat, onStartCall }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactQuery, setNewContactQuery] = useState('');

  // Mock data
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'Anna Kowalska',
        username: 'anna_k',
        status: 'online',
        isVerified: true,
        mutualContacts: 5,
        phoneNumber: '+48 123 456 789'
      },
      {
        id: '2',
        name: 'Piotr Nowak',
        username: 'piotr_n',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000),
        mutualContacts: 2,
        phoneNumber: '+48 987 654 321'
      },
      {
        id: '3',
        name: 'Maria Wiśniewska',
        username: 'maria_w',
        status: 'busy',
        isVerified: true,
        mutualContacts: 8,
        phoneNumber: '+48 555 123 456'
      },
      {
        id: '4',
        name: 'Tomasz Kowalczyk',
        username: 'tomek',
        status: 'away',
        lastSeen: new Date(Date.now() - 1800000),
        mutualContacts: 1,
        phoneNumber: '+48 111 222 333'
      }
    ];
    
    setContacts(mockContacts);
    setFilteredContacts(mockContacts);
  }, []);

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (contact: Contact) => {
    switch (contact.status) {
      case 'online': return 'Online';
      case 'busy': return 'Zajęty';
      case 'away': return 'Zaraz wracam';
      case 'offline': 
        if (contact.lastSeen) {
          const timeDiff = Date.now() - contact.lastSeen.getTime();
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (hours > 0) {
            return `Ostatnio widziany ${hours}h temu`;
          } else {
            return `Ostatnio widziany ${minutes}min temu`;
          }
        }
        return 'Offline';
      default: return 'Nieznany';
    }
  };

  const handleBlockContact = (contactId: string) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, isBlocked: !contact.isBlocked }
        : contact
    ));
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== contactId));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Kontakty</h2>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddContact(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Dodaj
            </Button>
            <Button size="sm" variant="outline">
              <QrCode className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Szukaj kontaktów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <UserPlus className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">Brak kontaktów</p>
            <p className="text-sm">Dodaj pierwszy kontakt aby rozpocząć</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredContacts.map((contact) => (
              <Card 
                key={contact.id} 
                className={`glass border-white/10 hover:border-white/20 transition-all cursor-pointer ${
                  contact.isBlocked ? 'opacity-50' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Avatar with status */}
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(contact.status)} rounded-full border-2 border-gray-800`} />
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-white truncate">{contact.name}</h3>
                        {contact.isVerified && (
                          <Shield className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>@{contact.username}</span>
                        {contact.mutualContacts && (
                          <>
                            <span>•</span>
                            <span>{contact.mutualContacts} wspólnych</span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {getStatusText(contact)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onStartChat(contact.id)}
                        disabled={contact.isBlocked}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onStartCall(contact.id, 'voice')}
                        disabled={contact.isBlocked || contact.status === 'offline'}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onStartCall(contact.id, 'video')}
                        disabled={contact.isBlocked || contact.status === 'offline'}
                      >
                        <Video className="w-4 h-4" />
                      </Button>

                      {/* More options */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-600">
                          <DropdownMenuItem className="text-white hover:bg-gray-700">
                            Zobacz profil
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-gray-700">
                            Zweryfikuj bezpieczeństwo
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-white hover:bg-gray-700"
                            onClick={() => handleBlockContact(contact.id)}
                          >
                            {contact.isBlocked ? 'Odblokuj' : 'Zablokuj'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-gray-700"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            Usuń kontakt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md glass border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Dodaj Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Numer telefonu, username lub email..."
                value={newContactQuery}
                onChange={(e) => setNewContactQuery(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
              
              <div className="flex space-x-2">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!newContactQuery.trim()}
                >
                  Dodaj
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddContact(false)}
                >
                  Anuluj
                </Button>
              </div>
              
              <div className="text-center">
                <Button variant="ghost" size="sm" className="text-gray-400">
                  <QrCode className="w-4 h-4 mr-2" />
                  Skanuj kod QR
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContactList;
