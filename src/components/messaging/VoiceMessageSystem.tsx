import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  Download,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface VoiceMessageSystemProps {
  onSendVoiceMessage: (audioBlob: Blob, duration: number) => void;
  className?: string;
}

interface VoiceMessageProps {
  audioUrl: string;
  duration: number;
  timestamp: string;
  isOwn?: boolean;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

// Waveform visualization component
const WaveformVisualizer: React.FC<{
  isRecording: boolean;
  audioData?: number[];
  isPlaying?: boolean;
  progress?: number;
}> = ({ isRecording, audioData = [], isPlaying = false, progress = 0 }) => {
  const [bars, setBars] = useState<number[]>(new Array(32).fill(0));

  // Simulate audio levels during recording
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setBars((prev) => prev.map(() => Math.random() * 100));
      }, 100);
      return () => clearInterval(interval);
    } else if (!isPlaying) {
      setBars(new Array(32).fill(0));
    }
  }, [isRecording, isPlaying]);

  // Use provided audio data or simulated data
  const displayBars = audioData.length > 0 ? audioData : bars;

  return (
    <div className="flex items-center justify-center space-x-1 h-12 px-4">
      {displayBars.map((height, index) => (
        <motion.div
          key={index}
          animate={{
            height: `${Math.max(4, height)}%`,
            backgroundColor: isRecording
              ? ["#ef4444", "#f97316", "#eab308", "#22c55e"][
                  Math.floor(height / 25)
                ]
              : isPlaying && progress > index / displayBars.length
                ? "#3b82f6"
                : "#64748b",
          }}
          transition={{ duration: 0.1 }}
          className="w-1 bg-gray-500 rounded-full min-h-[4px]"
        />
      ))}
    </div>
  );
};

// Voice message bubble component
export const VoiceMessageBubble: React.FC<VoiceMessageProps> = ({
  audioUrl,
  duration,
  timestamp,
  isOwn = false,
  isPlaying = false,
  onPlay,
  onPause,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const handleSeek = (value: number[]) => {
    const time = (value[0] / 100) * duration;
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "max-w-sm p-4 rounded-2xl shadow-lg backdrop-blur-sm",
        isOwn
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto"
          : "bg-white/10 text-white mr-auto border border-white/20",
      )}
    >
      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <Button
          onClick={handlePlayPause}
          size="icon"
          className={cn(
            "w-12 h-12 rounded-full flex-shrink-0",
            isOwn
              ? "bg-white/20 hover:bg-white/30 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white",
          )}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          {/* Waveform */}
          <div className="mb-2">
            <WaveformVisualizer
              isRecording={false}
              isPlaying={isPlaying}
              progress={progress / 100}
            />
          </div>

          {/* Progress Slider */}
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={1}
            className="mb-2"
          />

          {/* Time and Controls */}
          <div className="flex items-center justify-between text-xs">
            <span className="opacity-75">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleMute}
                size="icon"
                variant="ghost"
                className="w-6 h-6 text-current opacity-75 hover:opacity-100"
              >
                {isMuted ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </Button>

              <span className="opacity-50 text-xs">{timestamp}</span>
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onEnded={() => onPause?.()}
        volume={isMuted ? 0 : volume}
      />
    </motion.div>
  );
};

// Main voice message system
const VoiceMessageSystem: React.FC<VoiceMessageSystemProps> = ({
  onSendVoiceMessage,
  className,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 0.1);
      }, 100);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 0.1);
      }, 100);
    }
  };

  const playPreview = () => {
    if (audioBlob && audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pausePreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const sendVoiceMessage = () => {
    if (audioBlob) {
      onSendVoiceMessage(audioBlob, duration);
      resetRecording();
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setDuration(0);
    setIsRecording(false);
    setIsPaused(false);
    setIsPlaying(false);

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("p-4 space-y-4", className)}>
      {/* Recording Interface */}
      <motion.div
        animate={{
          height: isRecording || audioBlob ? "auto" : 0,
          opacity: isRecording || audioBlob ? 1 : 0,
        }}
        className="overflow-hidden bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10"
      >
        <div className="p-6">
          {/* Waveform Visualizer */}
          <div className="mb-4">
            <WaveformVisualizer isRecording={isRecording && !isPaused} />
          </div>

          {/* Duration and Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-white">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-lg">{formatTime(duration)}</span>
              {isRecording && (
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
              )}
            </div>

            <div className="text-sm text-gray-400">
              {isRecording
                ? isPaused
                  ? "Wstrzymano"
                  : "Nagrywanie..."
                : audioBlob
                  ? "Gotowe do wysłania"
                  : "Kliknij aby rozpocząć"}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white w-16 h-16 rounded-full"
                size="icon"
              >
                <Mic className="w-6 h-6" />
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  variant="outline"
                  size="icon"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {isPaused ? (
                    <Play className="w-4 h-4" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  onClick={stopRecording}
                  className="bg-gray-600 hover:bg-gray-700 text-white w-12 h-12 rounded-full"
                  size="icon"
                >
                  <Square className="w-4 h-4" />
                </Button>

                <Button
                  onClick={resetRecording}
                  variant="outline"
                  size="icon"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}

            {audioBlob && !isRecording && (
              <>
                <Button
                  onClick={isPlaying ? pausePreview : playPreview}
                  variant="outline"
                  size="icon"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  onClick={sendVoiceMessage}
                  className="bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-full"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>

                <Button
                  onClick={resetRecording}
                  variant="outline"
                  size="icon"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Record Button */}
      {!isRecording && !audioBlob && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex justify-center"
        >
          <Button
            onClick={startRecording}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-full shadow-lg"
          >
            <Mic className="w-5 h-5 mr-2" />
            Nagraj wiadomość głosową
          </Button>
        </motion.div>
      )}

      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

export default VoiceMessageSystem;
