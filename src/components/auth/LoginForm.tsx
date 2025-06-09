
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginFormHeader from './LoginFormHeader';
import LoginTab from './LoginTab';
import RegisterTab from './RegisterTab';

interface LoginFormProps {
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md glass border-white/20">
        <LoginFormHeader onClose={onClose} />

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Logowanie</TabsTrigger>
              <TabsTrigger value="register">Rejestracja</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginTab onClose={onClose} />
            </TabsContent>

            <TabsContent value="register">
              <RegisterTab onClose={onClose} />
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t border-gray-600">
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-gray-300 hover:text-white"
            >
              Zamknij
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
