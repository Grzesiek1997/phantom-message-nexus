import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  Brain,
  Zap,
  MessageCircle,
  Lightbulb,
  Code,
  Palette,
  Music,
  Calculator,
  BookOpen,
  Heart,
  Globe,
  Search,
  Star,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AIMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
  type?: "text" | "code" | "suggestion" | "analysis";
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestions?: string[];
  };
}

interface AIBot {
  id: string;
  name: string;
  description: string;
  avatar: string;
  color: string;
  capabilities: string[];
  personality:
    | "helpful"
    | "creative"
    | "analytical"
    | "friendly"
    | "professional";
}

interface AIChatbotSystemProps {
  onSendMessage: (message: string, botId: string) => void;
  messages: AIMessage[];
  isLoading?: boolean;
  className?: string;
}

// Available AI bots
const AI_BOTS: AIBot[] = [
  {
    id: "general",
    name: "SecureAI Assistant",
    description: "Uniwersalny asystent AI do każdej rozmowy",
    avatar: "🤖",
    color: "from-blue-500 to-cyan-600",
    capabilities: ["Rozmowa", "Tłumaczenie", "Pomoc", "Wyjaśnienia"],
    personality: "helpful",
  },
  {
    id: "creative",
    name: "Creative Spark",
    description: "Kreatywny AI do projektowania i inspiracji",
    avatar: "🎨",
    color: "from-purple-500 to-pink-600",
    capabilities: ["Twórczość", "Design", "Pisanie", "Inspiracja"],
    personality: "creative",
  },
  {
    id: "code",
    name: "Code Wizard",
    description: "Ekspert programistyczny i techniczny",
    avatar: "👨‍💻",
    color: "from-green-500 to-emerald-600",
    capabilities: ["Programowanie", "Debugging", "Code Review", "Algorytmy"],
    personality: "analytical",
  },
  {
    id: "analyst",
    name: "Data Analyst",
    description: "Specjalista od analizy danych i statystyk",
    avatar: "📊",
    color: "from-orange-500 to-red-600",
    capabilities: ["Analiza", "Statystyki", "Raporty", "Wizualizacje"],
    personality: "professional",
  },
];

// Quick suggestion buttons
const QUICK_SUGGESTIONS = [
  { icon: Lightbulb, text: "Pomóż mi z pomysłem", category: "creative" },
  { icon: Code, text: "Napisz kod", category: "technical" },
  { icon: Calculator, text: "Oblicz coś", category: "analytical" },
  { icon: BookOpen, text: "Wyjaśnij temat", category: "educational" },
  { icon: Palette, text: "Zaprojektuj coś", category: "creative" },
  { icon: Globe, text: "Przetłumacz tekst", category: "language" },
];

// AI message component
const AIMessageBubble: React.FC<{ message: AIMessage; bot: AIBot }> = ({
  message,
  bot,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "max-w-2xl rounded-2xl p-4 shadow-lg backdrop-blur-sm",
        message.isAI
          ? `bg-gradient-to-r ${bot.color} text-white mr-auto`
          : "bg-white/10 text-white ml-auto border border-white/20",
      )}
    >
      {message.isAI && (
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">{bot.avatar}</span>
          <span className="font-semibold">{bot.name}</span>
          {message.metadata?.confidence && (
            <Badge
              variant="outline"
              className="text-xs border-white/30 text-white/90"
            >
              {Math.round(message.metadata.confidence * 100)}% pewności
            </Badge>
          )}
        </div>
      )}

      <div className="whitespace-pre-wrap">{message.content}</div>

      {message.metadata?.suggestions &&
        message.metadata.suggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm opacity-75">Sugestie:</p>
            {message.metadata.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline"
                size="sm"
                className="mr-2 mb-2 text-xs border-white/30 text-white hover:bg-white/20"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}

      {message.metadata?.sources && isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 p-2 bg-black/20 rounded-lg"
        >
          <p className="text-sm opacity-75 mb-1">Źródła:</p>
          {message.metadata.sources.map((source, index) => (
            <p key={index} className="text-xs opacity-60">
              {source}
            </p>
          ))}
        </motion.div>
      )}

      <div className="text-xs opacity-50 mt-2">
        {message.timestamp.toLocaleTimeString()}
      </div>
    </motion.div>
  );
};

// Bot selector component
const BotSelector: React.FC<{
  bots: AIBot[];
  selectedBot: string;
  onBotSelect: (botId: string) => void;
}> = ({ bots, selectedBot, onBotSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {bots.map((bot) => (
        <motion.div
          key={bot.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className={cn(
              "p-4 cursor-pointer transition-all duration-200 border-2",
              selectedBot === bot.id
                ? "border-blue-500 bg-blue-500/20"
                : "border-white/10 bg-white/5 hover:border-white/20",
            )}
            onClick={() => onBotSelect(bot.id)}
          >
            <div className="flex items-start space-x-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                  `bg-gradient-to-r ${bot.color}`,
                )}
              >
                {bot.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">
                  {bot.name}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {bot.description}
                </p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {bot.capabilities.slice(0, 2).map((capability) => (
                    <Badge
                      key={capability}
                      variant="outline"
                      className="text-xs border-white/20 text-gray-300"
                    >
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Main AI chatbot system
const AIChatbotSystem: React.FC<AIChatbotSystemProps> = ({
  onSendMessage,
  messages,
  isLoading = false,
  className,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedBot, setSelectedBot] = useState("general");
  const [showBotSelector, setShowBotSelector] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentBot =
    AI_BOTS.find((bot) => bot.id === selectedBot) || AI_BOTS[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      setIsThinking(true);
      const timer = setTimeout(() => setIsThinking(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim(), selectedBot);
      setInputValue("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900",
        className,
      )}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBotSelector(!showBotSelector)}
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                `bg-gradient-to-r ${currentBot.color}`,
              )}
            >
              {currentBot.avatar}
            </div>

            <div className="text-left">
              <h2 className="text-white font-semibold">{currentBot.name}</h2>
              <p className="text-gray-400 text-sm">{currentBot.description}</p>
            </div>
          </motion.button>

          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="border-green-400/50 text-green-400 bg-green-400/10"
            >
              <Zap className="w-3 h-3 mr-1" />
              AI Active
            </Badge>
          </div>
        </div>

        {/* Bot selector */}
        <AnimatePresence>
          {showBotSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-4"
            >
              <BotSelector
                bots={AI_BOTS}
                selectedBot={selectedBot}
                onBotSelect={(botId) => {
                  setSelectedBot(botId);
                  setShowBotSelector(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <AIMessageBubble
              key={message.id}
              message={message}
              bot={currentBot}
            />
          ))}
        </AnimatePresence>

        {/* AI thinking indicator */}
        <AnimatePresence>
          {(isLoading || isThinking) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "max-w-xs rounded-2xl p-4 bg-gradient-to-r text-white mr-auto",
                currentBot.color,
              )}
            >
              <div className="flex items-center space-x-2">
                <span className="text-xl">{currentBot.avatar}</span>
                <span className="font-semibold text-sm">Myślę...</span>
              </div>

              <div className="flex space-x-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-2 h-2 bg-white/60 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-2"
        >
          <p className="text-gray-400 text-sm mb-3">Szybkie sugestie:</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickSuggestion(suggestion.text)}
                className="flex items-center space-x-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
              >
                <suggestion.icon className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm">{suggestion.text}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-sm"
      >
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Napisz do ${currentBot.name}...`}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl pr-12 resize-none"
              disabled={isLoading}
            />

            {/* AI indicator */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Brain className="w-5 h-5 text-blue-400" />
            </motion.div>
          </div>

          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              "rounded-xl px-6 py-3 bg-gradient-to-r text-white font-semibold transition-all duration-200",
              currentBot.color,
              "hover:scale-105 disabled:opacity-50 disabled:scale-100",
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Input hints */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Enter - wyślij, Shift+Enter - nowa linia</span>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3 h-3" />
            <span>Powered by {currentBot.name}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIChatbotSystem;
