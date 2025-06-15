
import React, { useState } from 'react';
import { Plus, UserPlus, X } from 'lucide-react';
import FriendSearchDialog from "./contacts/FriendSearchDialog";

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);

  const handleOpenSearch = () => {
    setShowAddFriend(true);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Tylko jeden przycisk - Dodaj znajomego */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3">
          <div className="transform transition-all duration-300 delay-100 translate-y-0 opacity-100 scale-100">
            <div className="flex items-center space-x-3">
              <span className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
                Dodaj znajomego
              </span>
              <button
                onClick={handleOpenSearch}
                className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200"
              >
                <UserPlus className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ${
          isOpen ? 'rotate-45 scale-110' : 'rotate-0 scale-100'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>

      {/* FRIEND SEARCH DIALOG */}
      {showAddFriend && (
        <FriendSearchDialog isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} />
      )}

      {/* Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FloatingActionButton;
