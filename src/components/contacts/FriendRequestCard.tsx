
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface FriendRequest {
  id: string;
  sender_profile?: {
    display_name?: string;
    username?: string;
  };
}

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onDelete?: (requestId: string) => void;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  request,
  onAccept,
  onReject,
  onDelete
}) => {
  return (
    <div className="flex items-center p-4 hover:bg-white/5 transition-colors">
      {/* Avatar */}
      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-4">
        <span className="text-white font-bold">
          {request.sender_profile?.display_name?.charAt(0) || '?'}
        </span>
      </div>

      {/* Request Info */}
      <div className="flex-1">
        <h3 className="font-medium text-white">
          {request.sender_profile?.display_name || request.sender_profile?.username || 'Unknown'}
        </h3>
        <p className="text-sm text-gray-400">Chce dodać Cię do znajomych</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          onClick={() => onAccept(request.id)}
          className="bg-green-600 hover:bg-green-700"
        >
          Akceptuj
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onReject(request.id)}
          className="border-red-500 text-red-400 hover:bg-red-500/20"
        >
          Odrzuć
        </Button>
        {onDelete && (
          <button
            onClick={() => onDelete(request.id)}
            className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendRequestCard;
