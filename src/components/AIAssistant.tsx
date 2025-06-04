
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles, Brain, Zap } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<Array<{id: string, query: string, response: string}>>([]);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    const currentQuery = query;
    setQuery('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "🤖 Analizuję Twoją wiadomość... Ta konwersacja wydaje się być przyjazna i pozytywna!",
        "💡 Sugeruję odpowiedź: 'Brzmi świetnie! Jestem zainteresowany/a.'",
        "🔒 Bezpieczeństwo: Ta konwersacja jest w pełni zaszyfrowana kwantowo.",
        "😊 Nastrój konwersacji: Pozytywny (85% pewności)",
        "🌍 Sugeruję przetłumaczenie na język angielski dla lepszego zrozumienia.",
        "⚡ Quantum AI: Wykryto wzorce komunikacyjne sugerujące wysokie zaufanie między rozmówcami."
      ];

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      setResponses(prev => [...prev, {
        id: crypto.randomUUID(),
        query: currentQuery,
        response: randomResponse
      }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
      <div className="flex items-center space-x-2 mb-4">
        <Bot className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-purple-300">🤖 AI Assistant</h3>
        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
      </div>

      <div className="space-y-3 max-h-40 overflow-y-auto mb-4">
        {responses.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="text-sm text-gray-400 bg-gray-800/50 p-2 rounded">
              <strong>Ty:</strong> {item.query}
            </div>
            <div className="text-sm text-purple-300 bg-purple-900/20 p-2 rounded">
              <strong>AI:</strong> {item.response}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-center space-x-2 text-purple-400">
            <Brain className="w-4 h-4 animate-pulse" />
            <span className="text-sm">AI myśli...</span>
            <Zap className="w-4 h-4 animate-bounce" />
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zapytaj AI o cokolwiek..."
          onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
          className="bg-gray-800/50 border-purple-500/30"
        />
        <Button 
          onClick={handleQuery}
          disabled={loading || !query.trim()}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuery("Przeanalizuj nastrój tej konwersacji")}
          className="text-xs bg-blue-900/20 border-blue-500/30"
        >
          😊 Analiza nastrojów
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuery("Przetłumacz ostatnią wiadomość")}
          className="text-xs bg-green-900/20 border-green-500/30"
        >
          🌍 Tłumaczenie
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuery("Zasugeruj odpowiedź")}
          className="text-xs bg-yellow-900/20 border-yellow-500/30"
        >
          💡 Smart Reply
        </Button>
      </div>
    </Card>
  );
};

export default AIAssistant;
