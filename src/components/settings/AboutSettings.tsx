
import React from 'react';
import { Info, Shield, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutSettings: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Info className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">O aplikacji</h2>
      </div>

      <div className="space-y-4">
        {/* App Info */}
        <div className="p-4 bg-white/5 rounded-lg text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">🛡️</span>
          </div>
          <h3 className="text-white font-bold text-xl mb-2">SecureChat Quantum</h3>
          <p className="text-gray-400 text-sm mb-4">
            Bezpieczny komunikator z szyfrowaniem end-to-end
          </p>
          <div className="text-blue-400 text-sm">
            Wersja 1.0.0
          </div>
        </div>

        {/* Features */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h3 className="text-white font-medium mb-3">Funkcje aplikacji</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Szyfrowanie end-to-end</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Wiadomości znikające</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Weryfikacja dwuetapowa</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Połączenia głosowe i wideo</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-between border-white/20 text-white hover:bg-white/10"
          >
            <span>Polityka prywatności</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-between border-white/20 text-white hover:bg-white/10"
          >
            <span>Warunki użytkowania</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-between border-white/20 text-white hover:bg-white/10"
          >
            <span>Centrum pomocy</span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-gray-400 text-xs flex items-center justify-center space-x-1">
            <span>Stworzone z</span>
            <Heart className="w-3 h-3 text-red-400" />
            <span>dla bezpiecznej komunikacji</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSettings;
