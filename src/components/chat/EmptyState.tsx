
import React from 'react';
import { MessageCircle } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
        <h3 className="text-xl font-medium text-white mb-2">Wybierz czat</h3>
        <p className="text-gray-400">Wybierz konwersację z listy lub utwórz nową</p>
      </div>
    </div>
  );
};

export default EmptyState;
