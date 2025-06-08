import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Brain, Zap, Globe, Atom, Dna, Volume2, Waves, Eye, MessageCircle, Users, Phone, Video, FileText, Settings, Crown, Sparkles, ArrowRight, CheckCircle, Star, Award, Verified } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

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
      {/* Hero Section with Prominent CTA */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-6">
            SecureChat <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Quantum</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Najbezpieczniejszy komunikator na świecie. Używamy technologii 2030+ do ochrony Twoich danych przed komputerami kwantowymi, AI i przyszłymi zagrożeniami.
          </p>
          
          {/* Prominent Auth Buttons */}
          <div className="flex flex-col items-center gap-6 mb-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Crown className="w-6 h-6 mr-3" />
                Załóż Bezpieczne Konto
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Bezpłatne konto</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Quantum encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Zero-knowledge</span>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-16">
            <div className="flex items-center gap-2 text-gray-300">
              <Award className="w-6 h-6 text-yellow-400" />
              <span className="font-semibold">NIST Certified</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Verified className="w-6 h-6 text-blue-400" />
              <span className="font-semibold">ISO 27001</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Star className="w-6 h-6 text-purple-400" />
              <span className="font-semibold">Quantum Safe</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Shield className="w-6 h-6 text-green-400" />
              <span className="font-semibold">Zero Trust</span>
            </div>
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

        {/* Additional Features */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            🚀 Zaawansowane Funkcje Bezpieczeństwa
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass border-white/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">Zero-Trust Architecture</CardTitle>
                    <CardDescription className="text-gray-300">
                      Każde połączenie weryfikowane
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            <Card className="glass border-white/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">AI Threat Detection</CardTitle>
                    <CardDescription className="text-gray-300">
                      Uczenie maszynowe w obronie
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            <Card className="glass border-white/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg text-white">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">Hardware Security</CardTitle>
                    <CardDescription className="text-gray-300">
                      WebAuthn, TPM, Secure Enclaves
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            <Card className="glass border-white/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg text-white">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">Blockchain Audit</CardTitle>
                    <CardDescription className="text-gray-300">
                      Niezmienne logi bezpieczeństwa
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <Card className="glass border-white/20 max-w-4xl mx-auto">
            <CardContent className="p-12">
              <h3 className="text-4xl font-bold text-white mb-6">
                🛡️ Przyszłość Bezpiecznej Komunikacji Zaczyna Się Tutaj
              </h3>
              <p className="text-xl text-gray-300 mb-8">
                Dołącz do elit cyberbezpieczeństwa. Chroń swoje dane technologią 2030+ już dziś.
              </p>
              <div className="flex flex-col items-center gap-6">
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="px-16 py-6 text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Crown className="w-8 h-8 mr-4" />
                  Rozpocznij Quantum Security
                  <Sparkles className="w-8 h-8 ml-4" />
                </Button>
                
                <div className="text-sm text-gray-400 max-w-2xl">
                  Klikając "Rozpocznij" akceptujesz nasze{' '}
                  <button 
                    onClick={() => setShowTerms(true)}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Warunki Użytkowania
                  </button>
                  {' '}i{' '}
                  <button 
                    onClick={() => setShowPrivacy(true)}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Politykę Prywatności
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="glass border-white/20 max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Warunki Użytkowania SecureChat Quantum</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p className="text-sm">
                <strong>1. Akceptacja Warunków</strong><br/>
                Korzystając z SecureChat Quantum, akceptujesz niniejsze warunki oraz zobowiązujesz się do przestrzegania najwyższych standardów cyberbezpieczeństwa.
              </p>
              <p className="text-sm">
                <strong>2. Quantum Security Standards</strong><br/>
                Nasza aplikacja wykorzystuje post-quantum cryptography zgodną z standardami NIST. Użytkownik zobowiązuje się do ochrony swoich kluczy kwantowych.
              </p>
              <p className="text-sm">
                <strong>3. Zero-Knowledge Policy</strong><br/>
                SecureChat działa w modelu zero-knowledge. Nie mamy dostępu do Twoich wiadomości, kluczy ani metadanych.
              </p>
              <p className="text-sm">
                <strong>4. Odpowiedzialność Użytkownika</strong><br/>
                Użytkownik jest odpowiedzialny za bezpieczne przechowywanie swoich kluczy prywatnych i danych biometrycznych.
              </p>
              <Button 
                onClick={() => setShowTerms(false)}
                className="mt-6 bg-blue-600 hover:bg-blue-700"
              >
                Zamknij
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="glass border-white/20 max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Polityka Prywatności</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p className="text-sm">
                <strong>1. Quantum Privacy</strong><br/>
                Wykorzystujemy quantum-safe encryption i zero-knowledge architecture dla maksymalnej prywatności.
              </p>
              <p className="text-sm">
                <strong>2. Dane Osobowe</strong><br/>
                Zbieramy minimum danych: email do uwierzytelnienia. Wszystkie inne dane są szyfrowane lokalnie.
              </p>
              <p className="text-sm">
                <strong>3. Metadane</strong><br/>
                Metadane komunikacji są chronione przez advanced obfuscation i temporal encryption.
              </p>
              <p className="text-sm">
                <strong>4. AI i Machine Learning</strong><br/>
                Nasze AI działa na zasadach differential privacy i federated learning.
              </p>
              <Button 
                onClick={() => setShowPrivacy(false)}
                className="mt-6 bg-blue-600 hover:bg-blue-700"
              >
                Zamknij
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
