
import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnlineVisible, setIsOnlineVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('user_id', user.id)
        .eq('setting_key', 'online_visibility')
        .maybeSingle();

      if (data) {
        setIsOnlineVisible(data.setting_value === 'true');
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const handleToggleOnlineVisibility = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const newValue = !isOnlineVisible;
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_key: 'online_visibility',
          setting_value: newValue.toString()
        });

      if (error) {
        throw error;
      }

      setIsOnlineVisible(newValue);
      toast({
        title: 'Ustawienia zapisane',
        description: `Widoczność online została ${newValue ? 'włączona' : 'wyłączona'}`
      });
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować ustawień',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-green-400" />
        <h2 className="text-xl font-bold text-white">Prywatność</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-3">
            {isOnlineVisible ? (
              <Eye className="w-5 h-5 text-green-400" />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <h3 className="text-white font-medium">Widoczność online</h3>
              <p className="text-gray-400 text-sm">
                Pozwól innym widzieć, kiedy jesteś online
              </p>
            </div>
          </div>
          <Button
            onClick={handleToggleOnlineVisibility}
            disabled={saving}
            variant={isOnlineVisible ? "default" : "outline"}
            className={
              isOnlineVisible
                ? "bg-green-600 hover:bg-green-700"
                : "border-gray-500 text-gray-400 hover:bg-white/10"
            }
          >
            {isOnlineVisible ? 'Włączone' : 'Wyłączone'}
          </Button>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <h3 className="text-white font-medium mb-2">Kto może Cię znaleźć</h3>
          <p className="text-gray-400 text-sm mb-3">
            Wybierz, kto może znaleźć Cię po nazwie użytkownika
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start border-white/20 text-white hover:bg-white/10"
            >
              Wszyscy
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-white/20 text-white hover:bg-white/10"
            >
              Tylko znajomi
            </Button>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <h3 className="text-white font-medium mb-2">Blokowane kontakty</h3>
          <p className="text-gray-400 text-sm mb-3">
            Zarządzaj listą zablokowanych użytkowników
          </p>
          <Button
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500/10"
          >
            Zarządzaj blokadami
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
