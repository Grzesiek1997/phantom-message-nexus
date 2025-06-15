
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, MessageCircle, Users, Lock, Zap, Globe } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">🛡️</span>
            </div>
            <h1 className="text-xl font-bold">SecureChat Quantum - Make Gibek</h1>
          </div>
          <Button 
            onClick={onGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2"
          >
            Zaloguj się
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Bezpieczna komunikacja przyszłości
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            SecureChat Quantum to zaawansowana platforma komunikacyjna z szyfrowaniem end-to-end, 
            reakcjami na wiadomości, statusami użytkowników i wieloma innymi funkcjami.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg"
            >
              Rozpocznij teraz
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              Dowiedz się więcej
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Dlaczego SecureChat Quantum?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Szyfrowanie End-to-End</h3>
                <p className="text-gray-300">
                  Wszystkie wiadomości są szyfrowane za pomocą zaawansowanych algorytmów kwantowych
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Reakcje na wiadomości</h3>
                <p className="text-gray-300">
                  Wyrażaj emocje za pomocą reakcji emoji na wiadomości znajomych
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Statusy użytkowników</h3>
                <p className="text-gray-300">
                  Zobacz kto jest online, zajęty, nieobecny lub offline w czasie rzeczywistym
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Wiadomości tymczasowe</h3>
                <p className="text-gray-300">
                  Wysyłaj wiadomości, które automatycznie się usuwają po określonym czasie
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Komunikacja w czasie rzeczywistym</h3>
                <p className="text-gray-300">
                  Natychmiastowe dostarczanie wiadomości dzięki technologii WebSocket
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <Globe className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Czaty grupowe</h3>
                <p className="text-gray-300">
                  Twórz grupy, zarządzaj członkami i prowadź rozmowy z wieloma osobami
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Gotowy na bezpieczną komunikację?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Dołącz do tysięcy użytkowników, którzy już korzystają z SecureChat Quantum
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg"
          >
            Rozpocznij za darmo
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🛡️</span>
            </div>
            <span className="text-lg font-semibold">SecureChat Quantum - Make Gibek</span>
          </div>
          <p className="text-gray-400">
            © 2024 SecureChat Quantum - Make Gibek. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
