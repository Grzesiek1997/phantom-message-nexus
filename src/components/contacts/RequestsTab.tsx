import React from 'react';
import { UserX, Clock, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { FriendRequest } from '@/hooks/friends/useFriendRequests';

interface RequestsTabProps {
  type: 'received' | 'sent';
  requests: FriendRequest[];
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onDeleteRequest: (requestId: string) => void;
}

const RequestsTab: React.FC<RequestsTabProps> = ({
  type,
  requests,
  onAcceptRequest,
  onRejectRequest,
  onDeleteRequest
}) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        {type === 'received' ? (
          <>
            <UserX className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-400">Brak oczekujących zaproszeń</p>
          </>
        ) : (
          <>
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-400">Brak wysłanych zaproszeń</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => (
        <div key={request.id} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-r ${
                type === 'received' ? 'from-orange-500 to-red-600' : 'from-yellow-500 to-orange-600'
              } rounded-full flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">
                  {type === 'received' 
                    ? request.sender_profile?.display_name?.charAt(0).toUpperCase() || '?'
                    : request.receiver_profile?.display_name?.charAt(0).toUpperCase() || '?'
                  }
                </span>
              </div>
              <div>
                <h3 className="font-medium text-white">
                  {type === 'received' 
                    ? request.sender_profile?.display_name 
                    : request.receiver_profile?.display_name
                  }
                </h3>
                <p className="text-sm text-gray-400">
                  @{type === 'received' 
                    ? request.sender_profile?.username 
                    : request.receiver_profile?.username
                  }
                </p>
                {type === 'received' && (
                  <p className="text-xs text-gray-500">Próba {request.attempt_count}/3</p>
                )}
                {type === 'sent' && (
                  <p className="text-xs text-yellow-500">
                    {request.status === 'pending' ? 'Oczekuje' : 
                     request.status === 'rejected' ? 'Odrzucone' : 'Zaakceptowane'}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {type === 'received' ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => onAcceptRequest(request.id)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                          Odrzuć zaproszenie
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          Czy na pewno chcesz odrzucić zaproszenie od {request.sender_profile?.display_name}?
                          Ta osoba będzie mogła wysłać jeszcze {3 - request.attempt_count} zaproszenia.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                          Anuluj
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onRejectRequest(request.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Odrzuć
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-yellow-500" />
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                          Usuń zaproszenie
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          Czy na pewno chcesz usunąć zaproszenie wysłane do {request.receiver_profile?.display_name}?
                          Tej operacji nie można cofnąć.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                          Anuluj
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDeleteRequest(request.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Usuń
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequestsTab;
