
import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, User, Video, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContacts } from '@/hooks/useContacts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CallData {
  id: string;
  caller_id: string;
  conversation_id: string | null;
  type: string;
  status: string;
  started_at: string;
  ended_at?: string | null;
  duration_seconds?: number;
  caller_profile?: {
    display_name: string;
    username: string;
    avatar_url?: string;
  };
}

interface Call {
  id: string;
  caller_id: string;
  conversation_id: string | null;
  type: 'voice' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'missed' | 'declined';
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  caller_profile?: {
    display_name: string;
    username: string;
    avatar_url?: string;
  };
}

const CallsScreen: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'missed'>('all');
  const [loading, setLoading] = useState(true);
  const { contacts } = useContacts();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCalls = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data: callsData, error } = await supabase
        .from('calls')
        .select(`
          *,
          call_participants!inner(user_id)
        `)
        .or(`caller_id.eq.${user.id},call_participants.user_id.eq.${user.id}`)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching calls:', error);
        return;
      }

      if (callsData && callsData.length > 0) {
        const callerIds = [...new Set(callsData.map(call => call.caller_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', callerIds);

        const transformedCalls: Call[] = callsData.map((call: CallData) => ({
          ...call,
          type: (call.type === 'video' || call.type === 'voice') ? call.type : 'voice',
          status: ['ringing', 'connected', 'ended', 'missed', 'declined'].includes(call.status) 
            ? call.status as Call['status'] 
            : 'ended',
          caller_profile: profiles?.find(p => p.id === call.caller_id)
        }));

        setCalls(transformedCalls);
      }
    } catch (error) {
      console.error('Error in fetchCalls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCalls();
    }
  }, [user]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Brak połączenia';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Dzisiaj';
    if (diffDays === 2) return 'Wczoraj';
    if (diffDays <= 7) return `${diffDays} dni temu`;
    
    return date.toLocaleDateString('pl-PL');
  };

  const getCallIcon = (call: Call) => {
    const isOutgoing = call.caller_id === user?.id;
    
    if (call.status === 'missed') {
      return <PhoneMissed className="w-5 h-5 text-red-500" />;
    }
    
    if (isOutgoing) {
      return <PhoneOutgoing className="w-5 h-5 text-green-500" />;
    }
    
    return <PhoneIncoming className="w-5 h-5 text-blue-500" />;
  };

  const getCallStatusText = (call: Call) => {
    const isOutgoing = call.caller_id === user?.id;
    
    switch (call.status) {
      case 'missed':
        return isOutgoing ? 'Nieodebrane wychodzące' : 'Nieodebrane przychodzące';
      case 'declined':
        return isOutgoing ? 'Odrzucone' : 'Odrzucone przez Ciebie';
      case 'ended':
        return formatDuration(call.duration_seconds);
      default:
        return call.status;
    }
  };

  const initiateCall = async (contactId: string, type: 'voice' | 'video' = 'voice') => {
    try {
      const contact = contacts.find(c => c.contact_user_id === contactId);
      if (!contact) {
        toast({
          title: 'Błąd',
          description: 'Nie znaleziono kontaktu',
          variant: 'destructive'
        });
        return;
      }

      const { data: newCall, error } = await supabase
        .from('calls')
        .insert({
          caller_id: user!.id,
          conversation_id: null,
          type,
          status: 'ringing'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating call:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się rozpocząć połączenia',
          variant: 'destructive'
        });
        return;
      }

      await supabase
        .from('call_participants')
        .insert({
          call_id: newCall.id,
          user_id: contactId
        });

      toast({
        title: 'Połączenie rozpoczęte',
        description: `Dzwonisz do ${contact.profile.display_name}`,
      });
      
    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się rozpocząć połączenia',
        variant: 'destructive'
      });
    }
  };

  const filteredCalls = activeTab === 'missed' 
    ? calls.filter(call => call.status === 'missed')
    : calls;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white mb-4">Połączenia</h1>
        
        {/* Quick Call Actions */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Szybkie połączenia:</h3>
          <div className="grid grid-cols-2 gap-2">
            {contacts.filter(c => c.can_chat).slice(0, 4).map((contact) => (
              <Button
                key={contact.id}
                onClick={() => initiateCall(contact.contact_user_id, 'voice')}
                className="bg-white/10 hover:bg-white/20 text-white border-none justify-start"
                variant="outline"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">
                    {contact.profile.display_name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium truncate">{contact.profile.display_name}</p>
                </div>
                <Phone className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <PhoneCall className="w-4 h-4 inline mr-1" />
            Wszystkie ({calls.length})
          </button>
          <button
            onClick={() => setActiveTab('missed')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'missed'
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <PhoneMissed className="w-4 h-4 inline mr-1" />
            Nieodebrane ({calls.filter(c => c.status === 'missed').length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Ładowanie połączeń...</div>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="text-center py-8">
            <Phone className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-400">
              {activeTab === 'missed' ? 'Brak nieodebranych połączeń' : 'Brak połączeń'}
            </p>
            <p className="text-sm text-gray-500">
              Użyj szybkich połączeń powyżej, aby zadzwonić do znajomych
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCalls.map((call) => (
              <div key={call.id} className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getCallIcon(call)}
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {call.caller_profile?.display_name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white">
                        {call.caller_profile?.display_name || 'Nieznany'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {call.type === 'video' ? 'Połączenie wideo' : 'Połączenie głosowe'}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(call.started_at)}</span>
                        <span>•</span>
                        <span>{getCallStatusText(call)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => initiateCall(call.caller_id, 'voice')}
                      className="bg-green-500 hover:bg-green-600"
                      title="Oddzwoń"
                    >
                      <Phone className="w-4 h-4" />
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
