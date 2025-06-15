
import React, { useState } from 'react';
import { Phone, Video, Clock, PhoneCall, PhoneMissed, PhoneIncoming, PhoneOutgoing, MoreVertical, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
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

interface CallRecord {
  id: string;
  contactName: string;
  contactAvatar?: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  duration: number;
  timestamp: Date;
  quality: 'HD' | 'SD';
}

const CallsScreen: React.FC = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'missed' | 'incoming' | 'outgoing'>('all');

  // Mock data - replace with real data from your backend
  const [callHistory, setCallHistory] = useState<CallRecord[]>([
    {
      id: '1',
      contactName: 'Anna Kowalska',
      type: 'video',
      direction: 'outgoing',
      duration: 1250, // seconds
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      quality: 'HD'
    },
    {
      id: '2',
      contactName: 'Jan Nowak',
      type: 'voice',
      direction: 'missed',
      duration: 0,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      quality: 'HD'
    },
    {
      id: '3',
      contactName: 'Maria Wiśniewska',
      type: 'voice',
      direction: 'incoming',
      duration: 890,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      quality: 'HD'
    }
  ]);

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return timestamp.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    } else {
      return timestamp.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    }
  };

  const getCallIcon = (direction: string, type: string) => {
    if (direction === 'missed') return PhoneMissed;
    if (direction === 'incoming') return PhoneIncoming;
    if (direction === 'outgoing') return PhoneOutgoing;
    return PhoneCall;
  };

  const getCallColor = (direction: string) => {
    switch (direction) {
      case 'missed': return 'text-red-500';
      case 'incoming': return 'text-green-500';
      case 'outgoing': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };

  const filteredCalls = callHistory.filter(call => {
    if (filter === 'all') return true;
    return call.direction === filter;
  });

  const handleNewCall = (type: 'voice' | 'video') => {
    console.log(`Starting new ${type} call`);
    // Implement call initiation logic
  };

  const handleRedial = (call: CallRecord) => {
    console.log(`Redialing ${call.contactName}`);
    // Implement redial logic
  };

  const handleDeleteCall = (callId: string) => {
    setCallHistory(prev => prev.filter(call => call.id !== callId));
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white mb-6">{t('calls')}</h1>
        
        {/* New Call Buttons */}
        <div className="flex space-x-4 mb-6">
          <Button
            onClick={() => handleNewCall('voice')}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            <Phone className="w-5 h-5 mr-2" />
            {t('voiceCall')}
          </Button>
          <Button
            onClick={() => handleNewCall('video')}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Video className="w-5 h-5 mr-2" />
            {t('videoCall')}
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {(['all', 'missed', 'incoming', 'outgoing'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {filterType === 'all' ? 'Wszystkie' : t(filterType)}
            </button>
          ))}
        </div>
      </div>

      {/* Call History */}
      <div className="flex-1 overflow-y-auto">
        {filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <PhoneCall className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Brak połączeń</p>
            <p className="text-sm">Połączenia pojawią się tutaj</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredCalls.map((call) => {
              const CallIcon = getCallIcon(call.direction, call.type);
              
              return (
                <div
                  key={call.id}
                  className="flex items-center p-4 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => handleRedial(call)}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">
                      {call.contactName.charAt(0)}
                    </span>
                  </div>

                  {/* Call Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-white">{call.contactName}</h3>
                      {call.type === 'video' && (
                        <Video className="w-4 h-4 text-blue-400" />
                      )}
                      {call.quality === 'HD' && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          HD
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <CallIcon className={`w-4 h-4 ${getCallColor(call.direction)}`} />
                      <span>{formatTimestamp(call.timestamp)}</span>
                      {call.duration > 0 && (
                        <>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(call.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewCall('voice');
                      }}
                      className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewCall('video');
                      }}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">
                            Usuń połączenie
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300">
                            Czy na pewno chcesz usunąć to połączenie z historii? Tej operacji nie można cofnąć.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                            Anuluj
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteCall(call.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Usuń
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallsScreen;
