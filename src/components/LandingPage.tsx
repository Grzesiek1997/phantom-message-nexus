
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Brain, Zap, Globe, Atom, Dna, Volume2, Waves, Eye, MessageCircle, Users, Phone, Video, FileText, Settings, Crown, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const securityFeatures = [
    {
      id: 'quantum',
      icon: <Atom className="w-8 h-8" />,
      title: 'Quantum-Safe Encryption',
      description: 'Post-quantum cryptography with CRYSTALS-Kyber and Dilithium',
      details: 'Protekcja przed komputerami kwantowymi. Algorytmy NIST-certyfikowane na lata 2030+.'
    },
    {
      id: 'neuromorphic',
      icon: <Brain className="w-8 h-8" />,
      title: 'Neuromorphic Security',
      description: 'AI-powered threat detection with spiking neural networks',
      details: 'Sztuczna inteligencja inspirowana mózgiem. Uczenie się zagrożeń w czasie rzeczywistym.'
    },
    {
      id: 'dna',
      icon: <Dna className="w-8 h-8" />,
      title: 'DNA Cryptography',
      description: 'Biological security using genetic algorithms',
      details: 'Kryptografia oparta na sekwencjach DNA. Ewolucyjna adaptacja do zagrożeń.'
    },
    {
      id: 'acoustic',
      icon: <Volume2 className="w-8 h-8" />,
      title: 'Acoustic Security',
      description: 'Ultrasonic key exchange and cymatics authentication',
      details: 'Wymiana kluczy przez fale dźwiękowe. Uwierzytelnianie wzorców akustycznych.'
    },
    {
      id: 'spacetime',
      icon: <Globe className="w-8 h-8" />,
      title: 'Spacetime Encryption',
      description: 'Relativistic security protocols',
      details: 'Szyfrowanie oparte na krzywizną czasoprzestrzeni. Bezpieczeństwo Einsteina.'
    },
    {
      id: 'fluid',
      icon: <Waves className="w-8 h-8" />,
      title: 'Fluid Dynamics Crypto',
      description: 'Chaos theory and turbulence-based security',
      details: 'Kryptografia oparta na dynamice płynów. Chaos jako źródło entropii.'
    }
  ];

  const appFeatures = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Encrypted Messaging',
      description: 'End-to-end encryption z quantum protection'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Group Chats',
      description: 'Secure group conversations with smart contracts'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Voice Calls',
      description: 'Crystal-clear calls with quantum encryption'
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Video Calls',
      description: 'HD video with post-quantum security'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'File Sharing',
      description: 'Secure file transfer with DNA verification'
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Disappearing Messages',
      description: 'Self-destructing messages with quantum proof'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-6">
            SecureChat <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Quantum</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Najbezpieczniejszy komunikator na świecie. Używamy technologii 2030+ do ochrony Twoich danych przed komputerami kwantowymi, AI i przyszłymi zagrożeniami.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Crown className="w-5 h-5 mr-2" />
              Rozpocznij Bezpieczną Komunikację
            </Button>
            <Button 
              variant="outline"
              className="px-8 py-4 text-lg border-white/20 text-white hover:bg-white/10"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Zobacz Demo
            </Button>
          </div>
        </div>

        {/* Security Features Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            🛡️ Rewolucyjne Zabezpieczenia
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature) => (
              <Card 
                key={feature.id}
                className={`glass border-white/20 cursor-pointer transition-all duration-300 ${
                  activeFeature === feature.id ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-102'
                }`}
                onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                {activeFeature === feature.id && (
                  <CardContent>
                    <p className="text-gray-200 text-sm">
                      {feature.details}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* App Features */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            📱 Funkcje Komunikatora
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appFeatures.map((feature, index) => (
              <Card key={index} className="glass border-white/20">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            📊 Liczby, które mówią same za siebie
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="glass border-white/20 text-center">
              <CardHeader>
                <div className="text-4xl font-bold text-blue-400">99.999%</div>
                <div className="text-white">Quantum Safety</div>
              </CardHeader>
            </Card>
            <Card className="glass border-white/20 text-center">
              <CardHeader>
                <div className="text-4xl font-bold text-purple-400">2030+</div>
                <div className="text-white">Future Proof</div>
              </CardHeader>
            </Card>
            <Card className="glass border-white/20 text-center">
              <CardHeader>
                <div className="text-4xl font-bold text-green-400">256-bit</div>
                <div className="text-white">Post-Quantum</div>
              </CardHeader>
            </Card>
            <Card className="glass border-white/20 text-center">
              <CardHeader>
                <div className="text-4xl font-bold text-yellow-400">0ms</div>
                <div className="text-white">AI Response</div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Comparison */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            🥇 Dlaczego SecureChat Quantum?
          </h2>
          <Card className="glass border-white/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-4">Signal</h3>
                  <div className="text-gray-300">
                    <div>✅ End-to-end encryption</div>
                    <div>❌ Quantum vulnerable</div>
                    <div>❌ No AI protection</div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-4">WhatsApp</h3>
                  <div className="text-gray-300">
                    <div>✅ Popular</div>
                    <div>❌ Meta tracking</div>
                    <div>❌ Quantum vulnerable</div>
                  </div>
                </div>
                <div className="text-center border-2 border-blue-500 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">SecureChat Quantum</h3>
                  <div className="text-gray-300">
                    <div>✅ Post-quantum encryption</div>
                    <div>✅ AI-powered security</div>
                    <div>✅ DNA cryptography</div>
                    <div>✅ Zero-knowledge auth</div>
                    <div>✅ Neuromorphic protection</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="glass border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold text-white mb-4">
                Gotowy na przyszłość bezpieczeństwa?
              </h3>
              <p className="text-gray-300 mb-6">
                Dołącz do rewolucji w bezpiecznej komunikacji. Chroń swoje dane przed zagrożeniami przyszłości już dziś.
              </p>
              <Button 
                onClick={onGetStarted}
                className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Lock className="w-5 h-5 mr-2" />
                Zacznij Teraz - Bezpłatnie
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
