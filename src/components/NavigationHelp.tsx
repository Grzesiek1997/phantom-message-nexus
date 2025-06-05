
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, ArrowLeft, ArrowRight, Search, MessageCircle, Shield, Settings, Users, X, ChevronDown, ChevronUp } from 'lucide-react';

interface NavigationHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationHelp: React.FC<NavigationHelpProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('navigation');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const helpSections = {
    navigation: {
      title: '🧭 Nawigacja po Aplikacji',
      items: [
        {
          id: 'tabs',
          title: 'Zakładki Główne',
          content: 'Użyj zakładek u góry: Chat, Security, Quantum, Neural, Swarm, Vault. Każda zawiera inne funkcje bezpieczeństwa.'
        },
        {
          id: 'back',
          title: 'Powrót',
          content: 'Przycisk "Powrót" (←) w lewym górnym rogu przenosi Cię z powrotem do poprzedniego widoku.'
        },
        {
          id: 'sidebar',
          title: 'Panel Boczny',
          content: 'Lista konwersacji po lewej stronie. Kliknij na konwersację aby ją otworzyć.'
        }
      ]
    },
    messaging: {
      title: '💬 Funkcje Komunikacji',
      items: [
        {
          id: 'send',
          title: 'Wysyłanie Wiadomości',
          content: 'Wpisz wiadomość w pole na dole i naciśnij Enter lub przycisk wysyłania.'
        },
        {
          id: 'reply',
          title: 'Odpowiadanie',
          content: 'Kliknij dwukrotnie na wiadomość aby na nią odpowiedzieć.'
        },
        {
          id: 'calls',
          title: 'Połączenia',
          content: 'Ikona telefonu = połączenie głosowe, ikona kamery = rozmowa wideo.'
        },
        {
          id: 'files',
          title: 'Pliki',
          content: 'Ikona spinacza pozwala na wysyłanie plików i zdjęć.'
        }
      ]
    },
    security: {
      title: '🛡️ Funkcje Bezpieczeństwa',
      items: [
        {
          id: 'quantum',
          title: 'Quantum Encryption',
          content: 'Wszystkie wiadomości są szyfrowane technologią quantum-safe, odporną na komputery kwantowe.'
        },
        {
          id: 'disappearing',
          title: 'Znikające Wiadomości',
          content: 'Wiadomości automatycznie usuwają się po 24 godzinach dla maksymalnej prywatności.'
        },
        {
          id: 'secret',
          title: 'Tajne Czaty',
          content: 'Utwórz czat z dodatkowym szyfrowaniem i zaawansowanymi funkcjami prywatności.'
        }
      ]
    },
    settings: {
      title: '⚙️ Ustawienia i Konfiguracja',
      items: [
        {
          id: 'profile',
          title: 'Profil Użytkownika',
          content: 'Edytuj swoje dane, zdjęcie profilowe i ustawienia prywatności.'
        },
        {
          id: 'notifications',
          title: 'Powiadomienia',
          content: 'Skonfiguruj kiedy i jak chcesz otrzymywać powiadomienia.'
        },
        {
          id: 'security-settings',
          title: 'Ustawienia Bezpieczeństwa',
          content: 'Zarządzaj poziomami szyfrowania, uwierzytelnianiem dwuskładnikowym i kluczami.'
        }
      ]
    }
  };

  const shortcuts = [
    { key: 'Ctrl + Enter', action: 'Wyślij wiadomość' },
    { key: 'Ctrl + N', action: 'Nowa konwersacja' },
    { key: 'Ctrl + F', action: 'Wyszukaj' },
    { key: 'Esc', action: 'Zamknij modalne okno' },
    { key: 'Tab', action: 'Przełącz zakładki' }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="glass border-white/20 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <HelpCircle className="w-6 h-6" />
                Centrum Pomocy SecureChat
              </CardTitle>
              <CardDescription className="text-gray-300">
                Przewodnik po aplikacji i funkcjach bezpieczeństwa
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-white/10 p-4 overflow-y-auto">
            <h3 className="text-white font-semibold mb-4">Kategorie Pomocy</h3>
            <div className="space-y-2">
              {Object.entries(helpSections).map(([key, section]) => (
                <Button
                  key={key}
                  variant={activeSection === key ? 'default' : 'ghost'}
                  className={`w-full justify-start text-left ${
                    activeSection === key 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setActiveSection(key)}
                >
                  {section.title}
                </Button>
              ))}
              
              <div className="mt-6 pt-4 border-t border-white/10">
                <h4 className="text-white font-medium mb-3">Skróty Klawiszowe</h4>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <kbd className="bg-gray-700 text-white px-2 py-1 rounded">
                        {shortcut.key}
                      </kbd>
                      <span className="text-gray-400">{shortcut.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">
                {helpSections[activeSection as keyof typeof helpSections].title}
              </h2>
              
              {helpSections[activeSection as keyof typeof helpSections].items.map((item) => (
                <Card key={item.id} className="glass border-white/20">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                      {expandedItem === item.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                  {expandedItem === item.id && (
                    <CardContent>
                      <p className="text-gray-300 leading-relaxed">{item.content}</p>
                    </CardContent>
                  )}
                </Card>
              ))}

              {/* Quick Actions */}
              {activeSection === 'navigation' && (
                <Card className="glass border-white/20 mt-8">
                  <CardHeader>
                    <CardTitle className="text-white">🚀 Szybkie Akcje</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="bg-blue-900/20 border-blue-500/30 text-blue-300 hover:bg-blue-800/30"
                        onClick={() => setActiveSection('messaging')}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Jak wysyłać wiadomości
                      </Button>
                      <Button 
                        variant="outline" 
                        className="bg-green-900/20 border-green-500/30 text-green-300 hover:bg-green-800/30"
                        onClick={() => setActiveSection('security')}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Funkcje bezpieczeństwa
                      </Button>
                      <Button 
                        variant="outline" 
                        className="bg-purple-900/20 border-purple-500/30 text-purple-300 hover:bg-purple-800/30"
                        onClick={() => setActiveSection('settings')}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Ustawienia aplikacji
                      </Button>
                      <Button 
                        variant="outline" 
                        className="bg-orange-900/20 border-orange-500/30 text-orange-300 hover:bg-orange-800/30"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Zarządzanie kontaktami
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-4 bg-black/20">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>💡 Wskazówka: Użyj Ctrl + H aby szybko otworzyć pomoc</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                📖 Dokumentacja
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                🎥 Video Tutorial
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                💬 Kontakt z Support
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NavigationHelp;
