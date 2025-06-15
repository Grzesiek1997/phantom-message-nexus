
import React, { useState } from 'react';
import { User, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [username, setUsername] = useState(user?.user_metadata?.username || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          username: username
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          username: username
        }
      });

      if (authError) {
        throw authError;
      }

      toast({
        title: 'Profil zaktualizowany',
        description: 'Twoje dane zostały pomyślnie zapisane'
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się zaktualizować profilu',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <User className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Profil</h2>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-2xl">
            {displayName?.charAt(0) || username?.charAt(0) || '?'}
          </span>
        </div>
        <Button
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <Camera className="w-4 h-4 mr-2" />
          Zmień zdjęcie
        </Button>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nazwa wyświetlana
          </label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Twoja nazwa wyświetlana"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nazwa użytkownika
          </label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Twoja nazwa użytkownika"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;
