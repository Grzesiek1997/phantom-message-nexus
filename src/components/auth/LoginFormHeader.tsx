
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';

interface LoginFormHeaderProps {
  onClose: () => void;
}

const LoginFormHeader: React.FC<LoginFormHeaderProps> = ({ onClose }) => {
  return (
    <CardHeader className="text-center">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div className="w-8" />
      </div>
      <CardTitle className="text-white text-2xl">SecureChat Quantum</CardTitle>
      <CardDescription className="text-gray-300">
        Najbezpieczniejszy komunikator na świecie
      </CardDescription>
    </CardHeader>
  );
};

export default LoginFormHeader;
