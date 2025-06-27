import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface SpeechSettings {
  enabled: boolean;
  voiceRecognitionEnabled: boolean;
  textToSpeechEnabled: boolean;
  preferredVoice: string;
  autoPlayVoiceMessages: boolean;
  continuousListening: boolean;
  noiseReduction: boolean;
  punctuationPrediction: boolean;
  speakingRate: number;
  pitch: number;
  volume: number;
}

interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female' | 'neutral';
  quality: 'standard' | 'premium' | 'neural';
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  isFinal: boolean;
  segments?: {
    text: string;
    confidence: number;
    start: number;
    end: number;
  }[];
}

interface SpeechSynthesisResult {
  audioUrl: string;
  duration: number;
  wordTimings?: {
    word: string;
    start: number;
    end: number;
  }[];
}

export function useAdvancedSpeech() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SpeechSettings>({
    enabled: false,
    voiceRecognitionEnabled: false,
    textToSpeechEnabled: false,
    preferredVoice: 'pl-PL-Standard-A',
    autoPlayVoiceMessages: true,
    continuousListening: false,
    noiseReduction: true,
    punctuationPrediction: true,
    speakingRate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  });
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Referencje do obiektów Web API
  const recognitionRef = useRef<any>(null);
  const synthesizerRef = useRef<SpeechSynthesis | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Pobieranie ustawień mowy
  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('speech_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching speech settings:', error);
        return;
      }

      if (data) {
        setSettings({
          enabled: data.enabled,
          voiceRecognitionEnabled: data.voice_recognition_enabled,
          textToSpeechEnabled: data.text_to_speech_enabled,
          preferredVoice: data.preferred_voice,
          autoPlayVoiceMessages: data.auto_play_voice_messages,
          continuousListening: data.continuous_listening,
          noiseReduction: data.noise_reduction,
          punctuationPrediction: data.punctuation_prediction,
          speakingRate: data.speaking_rate,
          pitch: data.pitch,
          volume: data.volume,
        });
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Pobieranie dostępnych głosów
  const fetchAvailableVoices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('available_voices')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching available voices:', error);
        return;
      }

      setAvailableVoices(data.map(voice => ({
        id: voice.id,
        name: voice.name,
        lang: voice.language_code,
        gender: voice.gender,
        quality: voice.quality,
      })));
    } catch (error) {
      console.error('Error in fetchAvailableVoices:', error);
    }
  }, []);

  // Aktualizacja ustawień mowy
  const updateSettings = useCallback(async (newSettings: Partial<SpeechSettings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('speech_settings')
        .upsert({
          user_id: user.id,
          enabled: newSettings.enabled !== undefined ? newSettings.enabled : settings.enabled,
          voice_recognition_enabled: newSettings.voiceRecognitionEnabled !== undefined ? newSettings.voiceRecognitionEnabled : settings.voiceRecognitionEnabled,
          text_to_speech_enabled: newSettings.textToSpeechEnabled !== undefined ? newSettings.textToSpeechEnabled : settings.textToSpeechEnabled,
          preferred_voice: newSettings.preferredVoice !== undefined ? newSettings.preferredVoice : settings.preferredVoice,
          auto_play_voice_messages: newSettings.autoPlayVoiceMessages !== undefined ? newSettings.autoPlayVoiceMessages : settings.autoPlayVoiceMessages,
          continuous_listening: newSettings.continuousListening !== undefined ? newSettings.continuousListening : settings.continuousListening,
          noise_reduction: newSettings.noiseReduction !== undefined ? newSettings.noiseReduction : settings.noiseReduction,
          punctuation_prediction: newSettings.punctuationPrediction !== undefined ? newSettings.punctuationPrediction : settings.punctuationPrediction,
          speaking_rate: newSettings.speakingRate !== undefined ? newSettings.speakingRate : settings.speakingRate,
          pitch: newSettings.pitch !== undefined ? newSettings.pitch : settings.pitch,
          volume: newSettings.volume !== undefined ? newSettings.volume : settings.volume,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating speech settings:', error);
        toast({
          title: 'Błąd',
          description: 'Nie udało się zaktualizować ustawień mowy',
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
        description: 'Ustawienia mowy zostały zaktualizowane',
      });
    } catch (error) {
      console.error('Error in updateSettings:', error);
    }
  }, [user, settings, toast]);

  // Inicjalizacja rozpoznawania mowy
  const initSpeechRecognition = useCallback(() => {
    // Sprawdzanie, czy przeglądarka obsługuje Web Speech API
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      toast({
        title: 'Nieobsługiwana funkcja',
        description: 'Twoja przeglądarka nie obsługuje rozpoznawania mowy',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Tworzenie nowego obiektu rozpoznawania mowy
      const recognition = new SpeechRecognition();
      recognition.continuous = settings.continuousListening;
      recognition.interimResults = true;
      recognition.lang = 'pl-PL'; // Domyślny język

      // Obsługa zdarzeń
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Aktualizacja transkrypcji
        setTranscription(finalTranscript || interimTranscript);

        // Jeśli wynik jest finalny, emitujemy zdarzenie
        if (finalTranscript) {
          const result: TranscriptionResult = {
            text: finalTranscript,
            confidence: event.results[0][0].confidence,
            language: recognition.lang,
            isFinal: true,
          };
          
          // Emitowanie zdarzenia z wynikiem
          const customEvent = new CustomEvent('speechRecognitionResult', { detail: result });
          document.dispatchEvent(customEvent);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast({
            title: 'Brak dostępu do mikrofonu',
            description: 'Nie udzielono dostępu do mikrofonu',
            variant: 'destructive',
          });
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        // Jeśli włączone jest ciągłe nasłuchiwanie, restartujemy rozpoznawanie
        if (settings.continuousListening && isRecording) {
          recognition.start();
        } else {
          setIsRecording(false);
        }
      };

      // Zapisywanie referencji do obiektu rozpoznawania mowy
      recognitionRef.current = recognition;
      return true;
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      return false;
    }
  }, [settings.continuousListening, isRecording, toast]);

  // Inicjalizacja syntezy mowy
  const initSpeechSynthesis = useCallback(() => {
    // Sprawdzanie, czy przeglądarka obsługuje Web Speech API
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      toast({
        title: 'Nieobsługiwana funkcja',
        description: 'Twoja przeglądarka nie obsługuje syntezy mowy',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Zapisywanie referencji do obiektu syntezy mowy
      synthesizerRef.current = window.speechSynthesis;
      return true;
    } catch (error) {
      console.error('Error initializing speech synthesis:', error);
      return false;
    }
  }, [toast]);

  // Rozpoczynanie nagrywania głosu
  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!settings.enabled || !settings.voiceRecognitionEnabled) {
      toast({
        title: 'Funkcja wyłączona',
        description: 'Rozpoznawanie mowy jest wyłączone w ustawieniach',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Inicjalizacja rozpoznawania mowy, jeśli jeszcze nie zostało zainicjalizowane
      if (!recognitionRef.current && !initSpeechRecognition()) {
        return false;
      }

      // Rozpoczynanie nagrywania
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscription('');

      // Inicjalizacja nagrywania audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Tworzenie kontekstu audio dla redukcji szumów
      if (settings.noiseReduction && !audioContextRef.current) {
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        
        // Tworzenie filtra dolnoprzepustowego dla redukcji szumów
        const filter = audioContextRef.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 8000;
        filter.Q.value = 1;
        
        // Tworzenie kompresora dynamiki
        const compressor = audioContextRef.current.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;
        
        // Łączenie węzłów
        source.connect(filter);
        filter.connect(compressor);
        compressor.connect(audioContextRef.current.destination);
      }

      // Tworzenie rejestratora mediów
      const options = { mimeType: 'audio/webm' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      // Obsługa zdarzeń
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Rozpoczynanie nagrywania
      mediaRecorderRef.current.start();

      toast({
        title: 'Nagrywanie rozpoczęte',
        description: 'Mów teraz...',
      });

      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Błąd nagrywania',
        description: 'Nie udało się rozpocząć nagrywania',
        variant: 'destructive',
      });
      return false;
    }
  }, [settings, initSpeechRecognition, toast]);

  // Zatrzymywanie nagrywania głosu
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!isRecording || !recognitionRef.current || !mediaRecorderRef.current) {
      return null;
    }

    try {
      // Zatrzymywanie rozpoznawania mowy
      recognitionRef.current.stop();
      
      // Zatrzymywanie nagrywania audio
      return new Promise<Blob | null>((resolve) => {
        if (!mediaRecorderRef.current) {
          resolve(null);
          return;
        }
        
        mediaRecorderRef.current.onstop = () => {
          // Tworzenie pliku audio z nagranych fragmentów
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];
          
          // Zatrzymywanie strumienia audio
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
          
          setIsRecording(false);
          resolve(audioBlob);
        };
        
        mediaRecorderRef.current.stop();
      });
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      return null;
    }
  }, [isRecording]);

  // Transkrypcja nagrania audio
  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<TranscriptionResult | null> => {
    if (!settings.enabled || !settings.voiceRecognitionEnabled) {
      return null;
    }

    try {
      // Tworzenie formularza z plikiem audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('punctuation', settings.punctuationPrediction.toString());
      
      // Wywołanie funkcji Edge Function do transkrypcji audio
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: formData,
      });

      if (error) {
        console.error('Error transcribing audio:', error);
        toast({
          title: 'Błąd transkrypcji',
          description: 'Nie udało się przetworzyć nagrania na tekst',
          variant: 'destructive',
        });
        return null;
      }

      return {
        text: data.text,
        confidence: data.confidence,
        language: data.language,
        isFinal: true,
        segments: data.segments,
      };
    } catch (error) {
      console.error('Error in transcribeAudio:', error);
      return null;
    }
  }, [settings, toast]);

  // Synteza mowy z tekstu
  const speakText = useCallback(async (text: string, voice?: string): Promise<boolean> => {
    if (!settings.enabled || !settings.textToSpeechEnabled || !text.trim()) {
      return false;
    }

    try {
      // Inicjalizacja syntezy mowy, jeśli jeszcze nie została zainicjalizowana
      if (!synthesizerRef.current && !initSpeechSynthesis()) {
        return false;
      }

      // Zatrzymywanie aktualnie odtwarzanej mowy
      if (isSpeaking) {
        synthesizerRef.current?.cancel();
      }

      // Tworzenie nowej wypowiedzi
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Ustawianie parametrów wypowiedzi
      utterance.rate = settings.speakingRate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;
      
      // Ustawianie głosu
      const voiceId = voice || settings.preferredVoice;
      const voices = synthesizerRef.current?.getVoices() || [];
      const selectedVoice = voices.find(v => v.name === voiceId);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Obsługa zdarzeń
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
      };
      
      // Rozpoczynanie syntezy mowy
      synthesizerRef.current?.speak(utterance);
      return true;
    } catch (error) {
      console.error('Error in speakText:', error);
      return false;
    }
  }, [settings, isSpeaking, initSpeechSynthesis]);

  // Zatrzymywanie syntezy mowy
  const stopSpeaking = useCallback(() => {
    if (!synthesizerRef.current) return;
    
    synthesizerRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  // Generowanie pliku audio z tekstu
  const generateSpeech = useCallback(async (
    text: string,
    voice?: string
  ): Promise<SpeechSynthesisResult | null> => {
    if (!settings.enabled || !settings.textToSpeechEnabled || !text.trim()) {
      return null;
    }

    try {
      // Wywołanie funkcji Edge Function do generowania mowy
      const { data, error } = await supabase.functions.invoke('generate-speech', {
        body: {
          text,
          voice: voice || settings.preferredVoice,
          speakingRate: settings.speakingRate,
          pitch: settings.pitch,
          volume: settings.volume,
        },
      });

      if (error) {
        console.error('Error generating speech:', error);
        toast({
          title: 'Błąd generowania mowy',
          description: 'Nie udało się wygenerować mowy z tekstu',
          variant: 'destructive',
        });
        return null;
      }

      return {
        audioUrl: data.audioUrl,
        duration: data.duration,
        wordTimings: data.wordTimings,
      };
    } catch (error) {
      console.error('Error in generateSpeech:', error);
      return null;
    }
  }, [settings, toast]);

  // Inicjalizacja
  useEffect(() => {
    fetchSettings();
    fetchAvailableVoices();
  }, [fetchSettings, fetchAvailableVoices]);

  // Nasłuchiwanie na zmiany w ustawieniach
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('speech_settings_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'speech_settings',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchSettings]);

  // Czyszczenie zasobów przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      // Zatrzymywanie rozpoznawania mowy
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignorowanie błędów
        }
      }
      
      // Zatrzymywanie syntezy mowy
      if (synthesizerRef.current) {
        synthesizerRef.current.cancel();
      }
      
      // Zatrzymywanie nagrywania audio
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Zamykanie kontekstu audio
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    settings,
    availableVoices,
    isRecording,
    isSpeaking,
    transcription,
    loading,
    updateSettings,
    startRecording,
    stopRecording,
    transcribeAudio,
    speakText,
    stopSpeaking,
    generateSpeech,
  };
}