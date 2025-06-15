
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ContactsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ContactsHeader: React.FC<ContactsHeaderProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="px-6 py-4 border-b border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">Kontakty</h1>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Szukaj kontaktów..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default ContactsHeader;
