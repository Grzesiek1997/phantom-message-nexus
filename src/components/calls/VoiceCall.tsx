
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCallProps {
  contact: {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'busy';
  };
  callId: string;
  isIncoming?: boolean;
  onEndCall: () => void;
  onAcceptCall?: () => void;
  onDeclineCall?: () => void;
}

const VoiceCall: React.FC<VoiceCallProps> = ({
  contact,
  callId,
  isIncoming = false,
  onEndCall,
  onAcceptCall,
  onDeclineCall
}) => {
  const [callStatus, setCallStatus] = useState<'incoming' | 'outgoing' | 'connected' | 'ended'>('outgoing');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (isIncoming) {
      setCallStatus('incoming');
      playRingtone();
    } else {
      initializeCall();
    }

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (callStatus === 'connected') {
      startTimer();
      startAudioVisualization();
    }
  }, [callStatus]);

  const initializeCall = async () => {
    try {
      setCallStatus('outgoing');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      localStreamRef.current = stream;
      
      // Setup WebRTC peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      peerConnectionRef.current = peerConnection;
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      };
      
      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        
        if (peerConnection.connectionState === 'connected') {
          setCallStatus('connected');
          toast({
            title: '📞 Połączenie nawiązane',
            description: `Rozmowa z ${contact.name}`
          });
        } else if (peerConnection.connectionState === 'disconnected') {
          handleEndCall();
        }
      };
      
      // Simulate call connection after 3 seconds
      setTimeout(() => {
        setCallStatus('connected');
      }, 3000);
      
    } catch (error) {
      console.error('Error initializing call:', error);
      toast({
        title: 'Błąd połączenia',
        description: 'Nie można nawiązać połączenia głosowego',
        variant: 'destructive'
      });
      onEndCall();
    }
  };

  const acceptCall = async () => {
    if (onAcceptCall) {
      onAcceptCall();
    }
    await initializeCall();
  };

  const declineCall = () => {
    if (onDeclineCall) {
      onDeclineCall();
    }
    onEndCall();
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    cleanup();
    onEndCall();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        toast({
          title: audioTrack.enabled ? '🎤 Mikrofon włączony' : '🔇 Mikrofon wyłączony',
          description: audioTrack.enabled ? 'Rozmówca Cię słyszy' : 'Rozmówca Cię nie słyszy'
        });
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeakerOn ? 0.5 : 1.0;
    }
    
    toast({
      title: isSpeakerOn ? '🔊 Głośnik włączony' : '🔈 Słuchawka włączona',
      description: isSpeakerOn ? 'Dźwięk przez głośnik' : 'Dźwięk przez słuchawkę'
    });
  };

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const startAudioVisualization = () => {
    if (!localStreamRef.current) return;
    
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(localStreamRef.current);
      
      source.connect(analyser);
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error setting up audio visualization:', error);
    }
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;
    setAudioLevel(average);
    
    animationRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const playRingtone = () => {
    // In a real app, you would play an actual ringtone
    console.log('Playing ringtone...');
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 p-8 glass border-white/20 text-center">
        {/* Contact Info */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-4 relative">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {contact.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Audio visualization ring */}
            {callStatus === 'connected' && (
              <div 
                className="absolute inset-0 rounded-full border-4 border-blue-400 animate-pulse"
                style={{
                  transform: `scale(${1 + audioLevel / 500})`,
                  opacity: audioLevel / 255
                }}
              />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{contact.name}</h2>
          
          <div className="text-gray-300">
            {callStatus === 'incoming' && (
              <div className="space-y-2">
                <div className="text-lg">📞 Połączenie przychodzące</div>
                <div className="animate-pulse">Dzwoni...</div>
              </div>
            )}
            {callStatus === 'outgoing' && (
              <div className="space-y-2">
                <div className="text-lg">📱 Łączenie...</div>
                <div className="animate-pulse">Dzwonimy...</div>
              </div>
            )}
            {callStatus === 'connected' && (
              <div className="space-y-2">
                <div className="text-lg">🔊 Połączony</div>
                <div className="text-2xl font-mono">{formatDuration(callDuration)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          {callStatus === 'incoming' ? (
            <>
              <Button
                onClick={declineCall}
                size="lg"
                variant="destructive"
                className="w-16 h-16 rounded-full"
              >
                <PhoneOff className="w-8 h-8" />
              </Button>
              
              <Button
                onClick={acceptCall}
                size="lg"
                className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700"
              >
                <Phone className="w-8 h-8" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={toggleMute}
                size="lg"
                variant={isMuted ? "destructive" : "outline"}
                className="w-12 h-12 rounded-full"
                disabled={callStatus !== 'connected'}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              
              <Button
                onClick={handleEndCall}
                size="lg"
                variant="destructive"
                className="w-16 h-16 rounded-full"
              >
                <PhoneOff className="w-8 h-8" />
              </Button>
              
              <Button
                onClick={toggleSpeaker}
                size="lg"
                variant={isSpeakerOn ? "default" : "outline"}
                className="w-12 h-12 rounded-full"
                disabled={callStatus !== 'connected'}
              >
                {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </Button>
            </>
          )}
        </div>

        {/* Additional Controls */}
        {callStatus === 'connected' && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Ustawienia
            </Button>
          </div>
        )}

        {/* Hidden audio elements */}
        <audio ref={localAudioRef} autoPlay muted />
        <audio ref={remoteAudioRef} autoPlay />
      </Card>
    </div>
  );
};

export default VoiceCall;
