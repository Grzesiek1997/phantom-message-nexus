import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Circle,
  Moon,
  Coffee,
  Briefcase,
  Car,
  Gamepad2,
  Music,
  Dumbbell,
  BookOpen,
  Heart,
  Zap,
  Clock,
  Edit3,
  Check,
  X,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PresenceStatus = "online" | "away" | "busy" | "offline";

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  customStatus?: string;
  statusEmoji?: string;
  lastSeen?: string;
  isTyping?: boolean;
}

interface PresenceIndicatorProps {
  status: PresenceStatus;
  size?: "sm" | "md" | "lg";
  showPulse?: boolean;
  className?: string;
}

interface StatusPickerProps {
  currentStatus: PresenceStatus;
  currentCustomStatus?: string;
  currentEmoji?: string;
  onStatusChange: (
    status: PresenceStatus,
    customStatus?: string,
    emoji?: string,
  ) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface CustomStatusPickerProps {
  onSave: (status: string, emoji: string) => void;
  onCancel: () => void;
  initialStatus?: string;
  initialEmoji?: string;
}

// Predefined status suggestions
const STATUS_SUGGESTIONS = [
  { emoji: "💼", text: "W pracy", status: "busy" as PresenceStatus },
  { emoji: "🏠", text: "W domu", status: "online" as PresenceStatus },
  { emoji: "🌙", text: "Śpię", status: "away" as PresenceStatus },
  { emoji: "☕", text: "Na kawie", status: "away" as PresenceStatus },
  { emoji: "🚗", text: "W drodze", status: "away" as PresenceStatus },
  { emoji: "🎮", text: "Gram", status: "busy" as PresenceStatus },
  { emoji: "🎵", text: "Słucham muzyki", status: "online" as PresenceStatus },
  { emoji: "💪", text: "Na siłowni", status: "busy" as PresenceStatus },
  { emoji: "📚", text: "Uczę się", status: "busy" as PresenceStatus },
  { emoji: "🍕", text: "Jem", status: "away" as PresenceStatus },
  { emoji: "💻", text: "Programuję", status: "busy" as PresenceStatus },
  { emoji: "🎨", text: "Tworzę", status: "busy" as PresenceStatus },
];

const EMOJI_SUGGESTIONS = [
  "😊",
  "😎",
  "🤔",
  "😴",
  "🤖",
  "🔥",
  "⚡",
  "🌟",
  "💖",
  "🎉",
  "🚀",
  "💎",
  "🌈",
  "🦄",
  "🎯",
  "💡",
  "🎪",
  "🌸",
  "🍀",
  "⭐",
];

// Presence indicator component
export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  status,
  size = "md",
  showPulse = true,
  className,
}) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    busy: "bg-red-500",
    offline: "bg-gray-500",
  };

  const pulseColors = {
    online: "bg-green-400",
    away: "bg-yellow-400",
    busy: "bg-red-400",
    offline: "bg-gray-400",
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "rounded-full border-2 border-gray-900",
          sizeClasses[size],
          statusColors[status],
        )}
      />

      {showPulse && status === "online" && (
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "absolute inset-0 rounded-full",
            sizeClasses[size],
            pulseColors[status],
          )}
        />
      )}
    </div>
  );
};

// Custom status picker
const CustomStatusPicker: React.FC<CustomStatusPickerProps> = ({
  onSave,
  onCancel,
  initialStatus = "",
  initialEmoji = "😊",
}) => {
  const [statusText, setStatusText] = useState(initialStatus);
  const [selectedEmoji, setSelectedEmoji] = useState(initialEmoji);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="p-4 bg-gray-800 rounded-lg border border-white/20"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{selectedEmoji}</span>
          <Input
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
            placeholder="Twój status..."
            className="flex-1 bg-gray-700 border-gray-600 text-white"
            maxLength={50}
          />
        </div>

        {/* Emoji picker */}
        <div className="grid grid-cols-10 gap-1">
          {EMOJI_SUGGESTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedEmoji(emoji)}
              className={cn(
                "p-2 rounded hover:bg-gray-700 transition-colors",
                selectedEmoji === emoji && "bg-blue-600",
              )}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button onClick={onCancel} variant="ghost" size="sm">
            <X className="w-4 h-4 mr-1" />
            Anuluj
          </Button>
          <Button
            onClick={() => onSave(statusText, selectedEmoji)}
            size="sm"
            disabled={!statusText.trim()}
          >
            <Check className="w-4 h-4 mr-1" />
            Zapisz
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Status picker component
const StatusPicker: React.FC<StatusPickerProps> = ({
  currentStatus,
  currentCustomStatus,
  currentEmoji,
  onStatusChange,
  isOpen,
  onClose,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const statusOptions = [
    {
      status: "online" as PresenceStatus,
      label: "Dostępny",
      icon: Circle,
      color: "text-green-500",
    },
    {
      status: "away" as PresenceStatus,
      label: "Zaraz wracam",
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      status: "busy" as PresenceStatus,
      label: "Zajęty",
      icon: Circle,
      color: "text-red-500",
    },
    {
      status: "offline" as PresenceStatus,
      label: "Offline",
      icon: Circle,
      color: "text-gray-500",
    },
  ];

  const handleStatusSelect = (status: PresenceStatus) => {
    onStatusChange(status);
    if (status !== "online" || !currentCustomStatus) {
      onClose();
    }
  };

  const handleCustomStatusSave = (statusText: string, emoji: string) => {
    onStatusChange(currentStatus, statusText, emoji);
    setShowCustomPicker(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-xl border border-white/20 shadow-2xl backdrop-blur-sm min-w-[280px] z-50"
    >
      <div className="p-4">
        {!showCustomPicker ? (
          <>
            {/* Status options */}
            <div className="space-y-2 mb-4">
              {statusOptions.map(({ status, label, icon: Icon, color }) => (
                <button
                  key={status}
                  onClick={() => handleStatusSelect(status)}
                  className={cn(
                    "w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors",
                    currentStatus === status && "bg-white/20",
                  )}
                >
                  <Icon className={cn("w-4 h-4", color)} />
                  <span className="text-white">{label}</span>
                  {currentStatus === status && (
                    <Check className="w-4 h-4 text-green-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {/* Current custom status */}
            {currentCustomStatus && (
              <div className="p-2 bg-blue-600/20 rounded-lg mb-4 border border-blue-500/30">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{currentEmoji || "😊"}</span>
                  <span className="text-white text-sm">
                    {currentCustomStatus}
                  </span>
                </div>
              </div>
            )}

            {/* Quick status suggestions */}
            <div className="space-y-1 mb-4">
              <h4 className="text-gray-400 text-xs uppercase tracking-wide">
                Szybkie statusy
              </h4>
              {STATUS_SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() =>
                    onStatusChange(
                      suggestion.status,
                      suggestion.text,
                      suggestion.emoji,
                    )
                  }
                  className="w-full flex items-center space-x-2 p-2 rounded hover:bg-white/10 transition-colors"
                >
                  <span className="text-lg">{suggestion.emoji}</span>
                  <span className="text-white text-sm">{suggestion.text}</span>
                </button>
              ))}
            </div>

            {/* Custom status button */}
            <Button
              onClick={() => setShowCustomPicker(true)}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Własny status
            </Button>
          </>
        ) : (
          <CustomStatusPicker
            onSave={handleCustomStatusSave}
            onCancel={() => setShowCustomPicker(false)}
            initialStatus={currentCustomStatus}
            initialEmoji={currentEmoji}
          />
        )}
      </div>
    </motion.div>
  );
};

// Enhanced presence display component
export const EnhancedPresenceDisplay: React.FC<{
  presence: UserPresence;
  showLastSeen?: boolean;
  className?: string;
}> = ({ presence, showLastSeen = true, className }) => {
  const formatLastSeen = (lastSeen: string) => {
    const diff = Date.now() - new Date(lastSeen).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Przed chwilą";
    if (minutes < 60) return `${minutes}m temu`;
    if (hours < 24) return `${hours}h temu`;
    return `${days}d temu`;
  };

  const getStatusText = () => {
    if (presence.customStatus) {
      return presence.customStatus;
    }

    switch (presence.status) {
      case "online":
        return "Dostępny";
      case "away":
        return "Zaraz wracam";
      case "busy":
        return "Zajęty";
      case "offline":
        return "Offline";
      default:
        return "Nieznany";
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <PresenceIndicator status={presence.status} />

      <div className="flex items-center space-x-1">
        {presence.statusEmoji && (
          <span className="text-sm">{presence.statusEmoji}</span>
        )}

        <span className="text-sm text-gray-300">{getStatusText()}</span>

        {presence.status === "offline" && showLastSeen && presence.lastSeen && (
          <span className="text-xs text-gray-500">
            • {formatLastSeen(presence.lastSeen)}
          </span>
        )}
      </div>

      {presence.isTyping && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="flex items-center space-x-1"
        >
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-1 h-1 bg-blue-400 rounded-full"
              />
            ))}
          </div>
          <span className="text-xs text-blue-400">pisze...</span>
        </motion.div>
      )}
    </div>
  );
};

// Main presence system component
export const EnhancedPresenceSystem: React.FC<{
  currentPresence: UserPresence;
  onPresenceChange: (
    status: PresenceStatus,
    customStatus?: string,
    emoji?: string,
  ) => void;
}> = ({ currentPresence, onPresenceChange }) => {
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowStatusPicker(!showStatusPicker)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <PresenceIndicator status={currentPresence.status} size="lg" />

        <div className="flex items-center space-x-1">
          {currentPresence.statusEmoji && (
            <span className="text-lg">{currentPresence.statusEmoji}</span>
          )}
          <span className="text-white text-sm">
            {currentPresence.customStatus || "Ustaw status"}
          </span>
        </div>
      </motion.button>

      <AnimatePresence>
        {showStatusPicker && (
          <StatusPicker
            currentStatus={currentPresence.status}
            currentCustomStatus={currentPresence.customStatus}
            currentEmoji={currentPresence.statusEmoji}
            onStatusChange={onPresenceChange}
            isOpen={showStatusPicker}
            onClose={() => setShowStatusPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedPresenceSystem;
