
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

interface FriendRequest {
  id: string;
  status?: 'pending' | 'accepted' | 'rejected';
  sender_profile?: {
    display_name?: string;
    username?: string;
  };
  receiver_profile?: {
    display_name?: string;
    username?: string;
  };
  attempt_count?: number;
  created_at?: string;
}

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onDelete?: (requestId: string) => void;
  type: 'received' | 'sent';
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  request,
  onAccept,
  onReject,
  onDelete,
  type
}) => {
  const getDisplayName = () => {
    if (type === 'received') {
      return request.sender_profile?.display_name || request.sender_profile?.username || 'Unknown';
    } else {
      return request.receiver_profile?.display_name || request.receiver_profile?.username || 'Unknown';
    }
  };

  const getDisplayChar = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const getStatusIcon = () => {
    if (request.status === 'accepted') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (request.status === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (type === 'received') {
      return 'Chce dodać Cię do znajomych';
    } else {
      if (request.status === 'pending') return 'Oczekuje na odpowiedź';
      if (request.status === 'accepted') return 'Zaakceptowane';
      if (request.status === 'rejected') return `Odrzucone (próba ${request.attempt_count || 1}/3)`;
    }
    return '';
  };

  return (
    <div className="flex items-center p-4 hover:bg-white/5 transition-colors">
      {/* Avatar */}
      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-4">
        <span className="text-white font-bold">{getDisplayChar()}</span>
      </div>

      {/* Request Info */}
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-white">{getDisplayName()}</h3>
          {getStatusIcon()}
        </div>
        <p className="text-sm text-gray-400">{getStatusText()}</p>
        {type === 'sent' && request.status === 'rejected' && (
          <p className="text-xs text-red-400">
            Pozostałe próby: {3 - (request.attempt_count || 1)}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {type === 'received' && request.status === 'pending' && (
          <>
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
          </>
        )}
        
        {onDelete && (
          <button
            onClick={() => onDelete(request.id)}
            className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
            title="Usuń zaproszenie"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendRequestCard;
