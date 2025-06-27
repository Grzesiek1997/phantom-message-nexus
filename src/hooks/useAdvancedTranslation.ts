import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface TranslationSettings {
  enabled: boolean;
  autoTranslate: boolean;
  preferredLanguage: string;
  showOriginalText: boolean;
  translateAttachments: boolean;
  translateVoiceMessages: boolean;
  useAI: boolean;
  cacheTranslations: boolean;
}

interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  available: boolean;
}

interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  translationId?: string;
  translatedAt: Date;
}

export function useAdvancedTranslation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<TranslationSettings>({
    enabled: false,
    autoTranslate: false,
    preferredLanguage: 'pl',
    showOriginalText: true,
    translateAttachments: false,
    translateVoiceMessages: false,
    useAI: true,
    cacheTranslations: true,
  });
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>([]);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);

  // Pobieranie ustawień tłumaczenia
  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('translation_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching translation settings:', error);
        return;
      }

      if (data) {
        setSettings({
          enabled: data.enabled,
          autoTranslate: data.auto_translate,
          preferredLanguage: data.preferred_language,
          showOriginalText: data.show_original_text,
          translateAttachments: data.translate_attachments,
          translateVoiceMessages: data.translate_voice_messages,
          useAI: data.use_ai,
          cacheTranslations: data.cache_translations,
        });
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Pobieranie obsługiwanych języków
  const fetchSupportedLanguages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('supported_languages')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching supported languages:', error);
        return;
      }

      setSupportedLanguages(data.map(lang => ({
        code: lang.code,
        name: lang.name,
        nativeName: lang.native_name,
        available: lang.available,
      })));
    } catch (error) {
      console.error('Error in fetchSupportedLanguages:', error);
    }
  }, []);

  // Aktualizacja ustawień tłumaczenia
  const updateSettings = useCallback(async (newSettings: Partial<TranslationSettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('translation_settings')
        .upsert({
          user_id: user.id,
          enabled: newSettings.enabled !== undefined ? newSettings.enabled : settings.enabled,
          auto_translate: newSettings.autoTranslate !== undefined ? newSettings.autoTranslate : settings.autoTranslate,
          preferred_language: newSettings.preferredLanguage !== undefined ? newSettings.preferredLanguage : settings.preferredLanguage,
          show_original_text: newSettings.showOriginalText !== undefined ? newSettings.showOriginalText : settings.showOriginalText,
          translate_attachments: newSettings.translateAttachments !== undefined ? newSettings.translateAttachments : settings.translateAttachments,
          translate_voice_messages: newSettings.translateVoiceMessages !== undefined ? newSettings.translateVoiceMessages : settings.translateVoiceMessages,
          use_ai: newSettings.useAI !== undefined ? newSettings.useAI : settings.useAI,
          cache_translations: newSettings.cacheTranslations !== undefined ? newSettings.cacheTranslations : settings.cacheTranslations,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating translation settings:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się zaktualizować ustawień tłumaczenia',
          variant: 'destructive',
        });
        return;
      }

      setSettings(prev => ({
        ...prev,
        ...newSettings,
      }));

      toast({
        title: 'Sukces',
        description: 'Ustawienia tłumaczenia zostały zaktualizowane',
      });
    } catch (error) {
      console.error('Error in updateSettings:', error);
    }
  }, [user, settings, toast]);

  // Wykrywanie języka tekstu
  const detectLanguage = useCallback(async (text: string): Promise<string> => {
    try {
      // Sprawdzanie, czy tłumaczenie jest w cache
      const { data: cachedDetection, error: cacheError } = await supabase
        .from('language_detections')
        .select('detected_language')
        .eq('text_hash', hashText(text))
        .maybeSingle();

      if (!cacheError && cachedDetection) {
        return cachedDetection.detected_language;
      }

      // Wywołanie funkcji Edge Function do wykrywania języka
      const { data, error } = await supabase.functions.invoke('detect-language', {
        body: { text },
      });

      if (error) {
        console.error('Error detecting language:', error);
        return 'unknown';
      }

      // Zapisywanie wykrytego języka w cache
      if (settings.cacheTranslations) {
        await supabase
          .from('language_detections')
          .insert({
            text_hash: hashText(text),
            text_sample: text.substring(0, 100),
            detected_language: data.language,
            confidence: data.confidence,
            created_at: new Date().toISOString(),
          });
      }

      return data.language;
    } catch (error) {
      console.error('Error in detectLanguage:', error);
      return 'unknown';
    }
  }, [settings.cacheTranslations]);

  // Tłumaczenie tekstu
  const translateText = useCallback(async (
    text: string,
    targetLanguage?: string,
    sourceLanguage?: string
  ): Promise<TranslationResult | null> => {
    if (!user || !settings.enabled || !text.trim()) return null;

    try {
      setTranslating(true);
      const target = targetLanguage || settings.preferredLanguage;
      
      // Jeśli nie podano języka źródłowego, wykrywamy go
      const source = sourceLanguage || await detectLanguage(text);
      
      // Jeśli tekst jest już w docelowym języku, zwracamy go bez tłumaczenia
      if (source === target) {
        return {
          originalText: text,
          translatedText: text,
          sourceLanguage: source,
          targetLanguage: target,
          confidence: 1.0,
          translatedAt: new Date(),
        };
      }

      // Sprawdzanie, czy tłumaczenie jest w cache
      if (settings.cacheTranslations) {
        const { data: cachedTranslation, error: cacheError } = await supabase
          .from('translations')
          .select('*')
          .eq('text_hash', hashText(text))
          .eq('source_language', source)
          .eq('target_language', target)
          .maybeSingle();

        if (!cacheError && cachedTranslation) {
          return {
            originalText: text,
            translatedText: cachedTranslation.translated_text,
            sourceLanguage: cachedTranslation.source_language,
            targetLanguage: cachedTranslation.target_language,
            confidence: cachedTranslation.confidence,
            translationId: cachedTranslation.id,
            translatedAt: new Date(cachedTranslation.created_at),
          };
        }
      }

      // Wywołanie funkcji Edge Function do tłumaczenia
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: {
          text,
          source,
          target,
          useAI: settings.useAI,
        },
      });

      if (error) {
        console.error('Error translating text:', error);
        toast({
          title: 'Błąd tłumaczenia',
          description: 'Nie udało się przetłumaczyć tekstu',
          variant: 'destructive',
        });
        return null;
      }

      // Zapisywanie tłumaczenia w cache
      let translationId;
      if (settings.cacheTranslations) {
        const { data: savedTranslation, error: saveError } = await supabase
          .from('translations')
          .insert({
            user_id: user.id,
            original_text: text,
            translated_text: data.translatedText,
            text_hash: hashText(text),
            source_language: source,
            target_language: target,
            confidence: data.confidence || 0.8,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!saveError) {
          translationId = savedTranslation.id;
        }
      }

      return {
        originalText: text,
        translatedText: data.translatedText,
        sourceLanguage: source,
        targetLanguage: target,
        confidence: data.confidence || 0.8,
        translationId,
        translatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error in translateText:', error);
      return null;
    } finally {
      setTranslating(false);
    }
  }, [user, settings, detectLanguage, toast]);

  // Tłumaczenie wiadomości głosowej
  const translateVoiceMessage = useCallback(async (
    audioUrl: string,
    targetLanguage?: string
  ): Promise<TranslationResult | null> => {
    if (!user || !settings.enabled || !settings.translateVoiceMessages) return null;

    try {
      setTranslating(true);
      const target = targetLanguage || settings.preferredLanguage;

      // Wywołanie funkcji Edge Function do transkrypcji i tłumaczenia audio
      const { data, error } = await supabase.functions.invoke('translate-voice', {
        body: {
          audioUrl,
          targetLanguage: target,
        },
      });

      if (error) {
        console.error('Error translating voice message:', error);
        toast({
          title: 'Błąd tłumaczenia',
          description: 'Nie udało się przetłumaczyć wiadomości głosowej',
          variant: 'destructive',
        });
        return null;
      }

      return {
        originalText: data.transcription,
        translatedText: data.translatedText,
        sourceLanguage: data.detectedLanguage,
        targetLanguage: target,
        confidence: data.confidence || 0.7,
        translatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error in translateVoiceMessage:', error);
      return null;
    } finally {
      setTranslating(false);
    }
  }, [user, settings, toast]);

  // Tłumaczenie tekstu z obrazu
  const translateImageText = useCallback(async (
    imageUrl: string,
    targetLanguage?: string
  ): Promise<TranslationResult | null> => {
    if (!user || !settings.enabled || !settings.translateAttachments) return null;

    try {
      setTranslating(true);
      const target = targetLanguage || settings.preferredLanguage;

      // Wywołanie funkcji Edge Function do OCR i tłumaczenia
      const { data, error } = await supabase.functions.invoke('translate-image', {
        body: {
          imageUrl,
          targetLanguage: target,
        },
      });

      if (error) {
        console.error('Error translating image text:', error);
        toast({
          title: 'Błąd tłumaczenia',
          description: 'Nie udało się przetłumaczyć tekstu z obrazu',
          variant: 'destructive',
        });
        return null;
      }

      return {
        originalText: data.extractedText,
        translatedText: data.translatedText,
        sourceLanguage: data.detectedLanguage,
        targetLanguage: target,
        confidence: data.confidence || 0.6,
        translatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error in translateImageText:', error);
      return null;
    } finally {
      setTranslating(false);
    }
  }, [user, settings, toast]);

  // Funkcja pomocnicza do hashowania tekstu
  const hashText = (text: string): string => {
    // Proste hashowanie dla celów demonstracyjnych
    // W rzeczywistej aplikacji użylibyśmy bardziej zaawansowanego algorytmu
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Konwersja do 32-bitowej liczby całkowitej
    }
    return hash.toString(16);
  };

  // Inicjalizacja
  useEffect(() => {
    fetchSettings();
    fetchSupportedLanguages();
  }, [fetchSettings, fetchSupportedLanguages]);

  // Nasłuchiwanie na zmiany w ustawieniach
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('translation_settings_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'translation_settings',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchSettings]);

  return {
    settings,
    supportedLanguages,
    loading,
    translating,
    updateSettings,
    detectLanguage,
    translateText,
    translateVoiceMessage,
    translateImageText,
  };
}