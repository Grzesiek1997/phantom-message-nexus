
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import SecureAuthForm from '@/components/SecureAuthForm';

interface LoginFormProps {
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { user } = useAuth();

  // Automatyczne przekierowanie jeśli użytkownik jest zalogowany
  React.useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <SecureAuthForm mode={mode} onModeChange={setMode} />
      </div>
    </div>
  );
};

export default LoginForm;
