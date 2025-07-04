import React, { useState } from 'react';
import { Phone, Video, Clock, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';

interface CallRecord {
  id: string;
  contactName: string;
  contactId: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'voice' | 'video';
  timestamp: Date;
  duration?: string;
}

const CallsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { createConversation } = useMessages();
  const { toast } = useToast();

  // Przykładowe dane połączeń
  const [callHistory] = useState<CallRecord[]>([
    {
      id: '1',
      contactName: 'Anna Kowalska',
      contactId: 'user-1',
      type: 'outgoing',
      callType: 'voice',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 godziny temu
      duration: '5:32'
    },
    {
      id: '2',
      contactName: 'Jan Nowak',
      contactId: 'user-2',
      type: 'incoming',
      callType: 'video',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 godziny temu
      duration: '12:15'
    },
    {
      id: '3',
      contactName: 'Maria Wiśniewska',
      contactId: 'user-3',
      type: 'missed',
      callType: 'voice',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // wczoraj
    },
    {
      id: '4',
      contactName: 'Piotr Zieliński',
      contactId: 'user-4',
      type: 'outgoing',
      callType: 'video',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dni temu
      duration: '25:43'
    }
  ]);

  const getCallTypeIcon = (type: 'incoming' | 'outgoing' | 'missed') => {
    switch (type) {
      case 'incoming':
        return <Phone className="w-4 h-4 text-green-500 rotate-45" />;
      case 'outgoing':
        return <Phone className="w-4 h-4 text-blue-500 rotate-[135deg]" />;
      case 'missed':
        return <Phone className="w-4 h-4 text-red-500" />;
      default:
        return <Phone className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCallTypeColor = (type: 'incoming' | 'outgoing' | 'missed') => {
    switch (type) {
      case 'incoming':
        return 'text-green-400';
      case 'outgoing':
        return 'text-blue-400';
      case 'missed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return timestamp.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Wczoraj';
    } else if (diffInDays < 7) {
      return `${diffInDays} dni temu`;
    } else {
      return timestamp.toLocaleDateString('pl-PL');
    }
  };

  const handleStartChat = async (contactId: string, contactName: string) => {
    try {
      console.log('Starting chat with contact:', contactId);
      
      const conversationId = await createConversation([contactId]);
      
      if (conversationId !== undefined) {
        navigate('/', {
          state: {
            selectedConversationId: conversationId,
            fromCalls: true
          }
        });
        
        toast({
          title: 'Czat otwarty',
          description: `Rozpoczęto czat z ${contactName}`
        });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się rozpocząć czatu',
        variant: 'destructive'
      });
    }
  };

  const handleCall = (contactId: string, contactName: string, callType: 'voice' | 'video') => {
    // Tutaj będzie logika rozpoczynania połączenia
    toast({
      title: `Dzwonię do ${contactName}`,
      description: `Rozpoczynam połączenie ${callType === 'voice' ? 'głosowe' : 'wideo'}...`
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-white">Połączenia</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Call History */}
      <div className="flex-1 overflow-y-auto">
        {callHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Phone className="w-16 h-16 text-gray-400 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">Brak historii połączeń</h3>
            <p className="text-gray-400">Historie połączeń pojawią się tutaj</p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {callHistory.map((call) => (
              <div
                key={call.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {call.contactName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Call Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white">{call.contactName}</h3>
                        {call.callType === 'video' && (
                          <Video className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        {getCallTypeIcon(call.type)}
                        <span className={getCallTypeColor(call.type)}>
                          {call.type === 'incoming' && 'Przychodzące'}
                          {call.type === 'outgoing' && 'Wychodzące'}
                          {call.type === 'missed' && 'Nieodebrane'}
                        </span>
                        {call.duration && (
                          <>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400">{call.duration}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(call.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleStartChat(call.contactId, call.contactName)}
                      size="sm"
                      className="bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors p-2"
                      title="Wyślij wiadomość"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleCall(call.contactId, call.contactName, 'voice')}
                      size="sm"
                      className="bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-colors p-2"
                      title="Połączenie głosowe"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleCall(call.contactId, call.contactName, 'video')}
                      size="sm"
                      className="bg-purple-500/20 text-purple-400 rounded-full hover:bg-purple-500/30 transition-colors p-2"
                      title="Połączenie wideo"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallsScreen;
