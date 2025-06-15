
import React from 'react';
import { X } from 'lucide-react';
import AnimatedSearchBar from './AnimatedSearchBar';

interface SearchOverlayProps {
  isVisible: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  results?: any[];
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isVisible,
  searchQuery,
  onSearchChange,
  onClose,
  results = []
}) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className={`w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <h2 className="text-xl font-semibold text-white">Wyszukaj czaty</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4">
            <AnimatedSearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Wpisz aby wyszukać czaty..."
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto p-4">
            {searchQuery.trim() === '' ? (
              <div className="text-center text-gray-400 py-8">
                Rozpocznij wpisywanie aby wyszukać czaty
              </div>
            ) : results.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                Nie znaleziono czatów pasujących do "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {result.name?.[0] || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{result.name || 'Nieznany czat'}</h3>
                        <p className="text-gray-400 text-sm">{result.lastMessage || 'Brak wiadomości'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
