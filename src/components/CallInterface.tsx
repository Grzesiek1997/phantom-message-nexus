
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Star,
  Clock,
  Users
} from 'lucide-react';
import { useCalls } from '@/hooks/useCalls';
import { useAuth } from '@/hooks/useAuth';

interface CallInterfaceProps {
  conversationId?: string;
}

const CallInterface: React.FC<CallInterfaceProps> = ({ conversationId }) => {
  const { calls, activeCall, startCall, endCall, answerCall, rejectCall, rateCall } = useCalls();
  const { user } = useAuth();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  // Update call duration for active call
  useEffect(() => {
    if (activeCall?.status === 'connected') {
      const interval = setInterval(() => {
        const duration = Math.floor((Date.now() - new Date(activeCall.connected_at || activeCall.started_at).getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = async (type: 'voice' | 'video') => {
    if (!conversationId) return;
    setIsVideoEnabled(type === 'video');
    await startCall(conversationId, type);
  };

  const handleEndCall = async () => {
    if (!activeCall) return;
    await endCall(activeCall.id, 'user_ended');
    setShowRating(true);
  };

  const handleRateCall = async (callRating: number) => {
    if (!activeCall) return;
    await rateCall(activeCall.id, callRating);
    setShowRating(false);
    setRating(0);
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'ringing': return 'bg-yellow-500';
      case 'ended': return 'bg-gray-500';
      case 'missed': return 'bg-red-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  if (showRating && activeCall) {
    return (
      <Card className="glass border-white/20 max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-white text-center">Oceń jakość połączenia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`p-2 rounded ${rating >= star ? 'text-yellow-500' : 'text-gray-400'}`}
              >
                <Star className="w-6 h-6" fill={rating >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleRateCall(rating)}
              disabled={rating === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Oceń
            </Button>
            <Button
              onClick={() => setShowRating(false)}
              variant="outline"
              className="flex-1"
            >
              Pomiń
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active call interface
  if (activeCall) {
    const isIncoming = activeCall.caller_id !== user?.id && activeCall.status === 'ringing';
    
    return (
      <Card className="glass border-white/20 max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* Call status */}
            <Badge className={getCallStatusColor(activeCall.status)}>
              {activeCall.status === 'ringing' && isIncoming ? 'Połączenie przychodzące' : 
               activeCall.status === 'ringing' ? 'Dzwoni...' :
               activeCall.status === 'connecting' ? 'Łączenie...' :
               activeCall.status === 'connected' ? 'Połączony' : activeCall.status}
            </Badge>

            {/* Call type icon */}
            <div className="flex justify-center">
              {activeCall.type.includes('video') ? (
                <Video className="w-16 h-16 text-blue-500" />
              ) : (
                <Phone className="w-16 h-16 text-green-500" />
              )}
            </div>

            {/* Call duration */}
            {activeCall.status === 'connected' && (
              <div className="flex items-center justify-center gap-2 text-white">
                <Clock className="w-4 h-4" />
                <span className="text-lg font-mono">{formatDuration(callDuration)}</span>
              </div>
            )}

            {/* Call controls */}
            <div className="flex justify-center gap-4">
              {isIncoming ? (
                <>
                  <Button
                    onClick={() => answerCall(activeCall.id)}
                    className="bg-green-600 hover:bg-green-700 rounded-full p-4"
                  >
                    <Phone className="w-6 h-6" />
                  </Button>
                  <Button
                    onClick={() => rejectCall(activeCall.id)}
                    className="bg-red-600 hover:bg-red-700 rounded-full p-4"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                </>
              ) : (
                <>
                  {/* Mute button */}
                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    variant={isMuted ? "destructive" : "outline"}
                    className="rounded-full p-3"
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>

                  {/* Video toggle (if video call) */}
                  {activeCall.type.includes('video') && (
                    <Button
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                      variant={!isVideoEnabled ? "destructive" : "outline"}
                      className="rounded-full p-3"
                    >
                      {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                  )}

                  {/* End call */}
                  <Button
                    onClick={handleEndCall}
                    className="bg-red-600 hover:bg-red-700 rounded-full p-3"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Call controls when no active call
  return (
    <div className="space-y-6">
      {/* Start call buttons */}
      {conversationId && (
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Rozpocznij połączenie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                onClick={() => handleStartCall('voice')}
                className="flex-1 bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Głos
              </Button>
              <Button
                onClick={() => handleStartCall('video')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Wideo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent calls */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Ostatnie połączenia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {calls.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Brak połączeń</p>
            ) : (
              calls.slice(0, 10).map(call => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    {call.type.includes('video') ? (
                      <Video className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Phone className="w-4 h-4 text-green-500" />
                    )}
                    <div>
                      <p className="text-white text-sm">
                        {call.caller_id === user?.id ? 'Wychodzące' : 'Przychodzące'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {new Date(call.started_at).toLocaleString('pl-PL')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getCallStatusColor(call.status)}>
                      {call.status}
                    </Badge>
                    {call.duration_seconds > 0 && (
                      <span className="text-gray-400 text-xs">
                        {formatDuration(call.duration_seconds)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallInterface;
