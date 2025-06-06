
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Send, Trash2, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onSendVoiceMessage: (audioBlob: Blob, duration: number) => void;
  onClose: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSendVoiceMessage, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Setup audio analysis for waveform
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start waveform animation
      updateWaveform();
      
      toast({
        title: '🎤 Nagrywanie rozpoczęte',
        description: 'Mów do mikrofonu...'
      });
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Błąd mikrofonu',
        description: 'Nie można uzyskać dostępu do mikrofonu',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  };

  const updateWaveform = () => {
    if (!analyserRef.current || !isRecording) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Process audio data for waveform visualization
    const samples = Array.from(dataArray).slice(0, 20);
    const normalizedSamples = samples.map(sample => (sample / 255) * 100);
    
    setWaveform(prev => [...prev.slice(-50), ...normalizedSamples].slice(-50));
    
    animationRef.current = requestAnimationFrame(updateWaveform);
  };

  const playRecording = () => {
    if (!audioUrl) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onloadedmetadata = () => {
      audio.play();
      setIsPlaying(true);
    };
    
    audio.onended = () => {
      setIsPlaying(false);
    };
    
    audio.onerror = () => {
      setIsPlaying(false);
      toast({
        title: 'Błąd odtwarzania',
        description: 'Nie można odtworzyć nagrania',
        variant: 'destructive'
      });
    };
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    setWaveform([]);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const sendRecording = () => {
    if (audioBlob) {
      onSendVoiceMessage(audioBlob, recordingTime);
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 glass border-white/20">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">🎤 Wiadomość Głosowa</h3>
          <p className="text-gray-300 text-sm">Nagraj swoją wiadomość</p>
        </div>

        {/* Waveform Visualization */}
        <div className="h-20 bg-gray-800 rounded-lg mb-6 p-2 flex items-end justify-center space-x-1">
          {waveform.length > 0 ? (
            waveform.map((amplitude, index) => (
              <div
                key={index}
                className="bg-blue-500 rounded-t transition-all duration-100"
                style={{
                  height: `${Math.max(amplitude, 2)}%`,
                  width: '3px',
                  opacity: isRecording ? (1 - index / waveform.length * 0.5) : 1
                }}
              />
            ))
          ) : (
            <div className="text-gray-400 text-sm">Waveform pojawi się podczas nagrywania</div>
          )}
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <div className="text-2xl font-mono text-white mb-2">
            {formatTime(recordingTime)}
          </div>
          {isRecording && (
            <div className="flex items-center justify-center text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
              Nagrywanie...
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          {!audioBlob ? (
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="lg"
              className={`w-16 h-16 rounded-full ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={isPlaying ? pauseRecording : playRecording}
                size="lg"
                className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </Button>
              
              <Button
                onClick={deleteRecording}
                size="lg"
                variant="destructive"
                className="w-12 h-12 rounded-full"
              >
                <Trash2 className="w-6 h-6" />
              </Button>
              
              <Button
                onClick={sendRecording}
                size="lg"
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-400 mb-4">
          {!audioBlob ? (
            !isRecording ? (
              'Naciśnij mikrofon aby rozpocząć nagrywanie'
            ) : (
              'Naciśnij ponownie aby zakończyć nagrywanie'
            )
          ) : (
            'Odsłuchaj, usuń lub wyślij swoją wiadomość'
          )}
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full text-gray-300 hover:text-white"
        >
          Zamknij
        </Button>
      </Card>
    </div>
  );
};

export default VoiceRecorder;
