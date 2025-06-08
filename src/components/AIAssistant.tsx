
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, X, Sparkles, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `👋 Cześć! Jestem AI Asystentem SecureChat.

🔧 **Aby mnie uruchomić, potrzebujesz klucza API Gemini:**

1. Przejdź do: https://makersuite.google.com/app/apikey
2. Zaloguj się kontem Google
3. Kliknij "Create API Key"
4. Skopiuj wygenerowany klucz
5. Wklej go poniżej i naciśnij "Zapisz"

Po skonfigurowaniu będę mógł Ci pomóc z:
🔒 Bezpieczeństwem i prywatnością
💬 Zarządzaniem czatami  
⚙️ Ustawieniami aplikacji
🤔 Odpowiedziami na pytania`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { toast } = useToast();

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Błąd',
        description: 'Wprowadź klucz API',
        variant: 'destructive'
      });
      return;
    }

    // Save API key to localStorage for this user
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setIsConfigured(true);
    
    const configMessage: Message = {
      id: Date.now().toString(),
      content: '✅ Klucz API został zapisany! Teraz jestem gotowy do pomocy. W czym mogę Ci pomóc?',
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, configMessage]);
    setApiKey('');
    
    toast({
      title: 'Sukces',
      description: 'AI Asystent został skonfigurowany',
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!isConfigured) {
      toast({
        title: 'Błąd',
        description: 'Najpierw skonfiguruj klucz API Gemini',
        variant: 'destructive'
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response (replace with actual Gemini API call)
    setTimeout(() => {
      const responses = [
        'Dziękuję za pytanie! SecureChat używa zaawansowanego szyfrowania kwantowego end-to-end, co oznacza, że tylko Ty i odbiorca możecie odczytać wiadomości.',
        'Mogę pomóc Ci skonfigurować automatyczne usuwanie wiadomości. Przejdź do ustawień bezpieczeństwa w menu głównym.',
        'Aby dodać nowy kontakt, kliknij przycisk "+" w górnej części listy czatów, a następnie wyszukaj użytkownika po nazwie.',
        'SecureChat automatycznie szyfruje wszystkie Twoje dane lokalnie przed wysłaniem ich na serwer. Twoja prywatność jest naszym priorytetem!',
        'Czy chcesz włączyć tryb ukryty? W tym trybie wszystkie wiadomości znikają po 5 minutach automatycznie.'
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  React.useEffect(() => {
    // Check if API key is already saved
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setIsConfigured(true);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold">AI Asystent</DialogTitle>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {!isConfigured && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
            <h3 className="text-blue-300 font-semibold mb-2">🔧 Konfiguracja API</h3>
            <p className="text-sm text-gray-300 mb-3">
              Wprowadź swój klucz API Gemini:
            </p>
            <div className="flex space-x-2 mb-2">
              <Input
                type="password"
                placeholder="Wklej klucz API Gemini..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-gray-800 border-gray-600 text-white"
              />
              <Button
                onClick={handleSaveApiKey}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Zapisz
              </Button>
            </div>
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Pobierz klucz API Gemini
            </a>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800/50 rounded-lg">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-purple-600/80 text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-purple-600/80 text-white px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center space-x-2 pt-4">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isConfigured ? "Zadaj pytanie AI Asystentowi..." : "Najpierw skonfiguruj klucz API"}
            className="flex-1 bg-gray-800 border-gray-600 text-white"
            disabled={isTyping || !isConfigured}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping || !isConfigured}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-gray-400 text-center pt-2">
          🤖 AI Asystent • Bezpieczny i prywatny
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistant;
