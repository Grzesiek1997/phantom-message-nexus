
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, UserPlus, X } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';

interface ContactSearchProps {
  onClose: () => void;
}

const ContactSearch: React.FC<ContactSearchProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { searchUsers, addContact } = useContacts();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (userId: string) => {
    try {
      await addContact(userId);
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Add contact error:', error);
    }
  };

  return (
    <Card className="w-96 glass border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Szukaj kontaktów</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4 text-gray-400" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Wpisz nazwę użytkownika..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {searchResults.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.display_name[0]}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{user.display_name}</p>
                  <p className="text-gray-400 text-sm">@{user.username}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleAddContact(user.id)}
                className="bg-green-500 hover:bg-green-600"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          {searchResults.length === 0 && searchQuery && !loading && (
            <p className="text-gray-400 text-center py-4">Nie znaleziono użytkowników</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSearch;
