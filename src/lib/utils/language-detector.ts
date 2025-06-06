
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' }
];

export class LanguageDetector {
  private static readonly STORAGE_KEY = 'securechat_language';
  private static readonly DEFAULT_LANGUAGE = 'en';

  // Detect user's preferred language
  static detectUserLanguage(): string {
    // 1. Check localStorage first
    const storedLanguage = localStorage.getItem(this.STORAGE_KEY);
    if (storedLanguage && this.isSupported(storedLanguage)) {
      console.log('🌍 Language from storage:', storedLanguage);
      return storedLanguage;
    }

    // 2. Check browser language
    const browserLanguages = navigator.languages || [navigator.language];
    
    for (const browserLang of browserLanguages) {
      const langCode = browserLang.split('-')[0].toLowerCase();
      if (this.isSupported(langCode)) {
        console.log('🌍 Language from browser:', langCode);
        this.setLanguage(langCode);
        return langCode;
      }
    }

    // 3. Check timezone-based detection
    const timezoneLang = this.detectByTimezone();
    if (timezoneLang) {
      console.log('🌍 Language from timezone:', timezoneLang);
      this.setLanguage(timezoneLang);
      return timezoneLang;
    }

    // 4. Fallback to default
    console.log('🌍 Using default language:', this.DEFAULT_LANGUAGE);
    this.setLanguage(this.DEFAULT_LANGUAGE);
    return this.DEFAULT_LANGUAGE;
  }

  // Detect language by timezone
  private static detectByTimezone(): string | null {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const timezoneLanguageMap: Record<string, string> = {
        'Europe/Warsaw': 'pl',
        'Europe/Berlin': 'de',
        'Europe/Paris': 'fr',
        'Europe/Madrid': 'es',
        'Europe/Rome': 'it',
        'Europe/Stockholm': 'sv',
        'Europe/Amsterdam': 'nl',
        'Europe/Moscow': 'ru',
        'Asia/Shanghai': 'zh',
        'Asia/Tokyo': 'ja',
        'Asia/Seoul': 'ko',
        'Asia/Kolkata': 'hi',
        'America/New_York': 'en',
        'America/Los_Angeles': 'en',
        'America/Sao_Paulo': 'pt'
      };

      return timezoneLanguageMap[timezone] || null;
    } catch {
      return null;
    }
  }

  // Check if language is supported
  static isSupported(langCode: string): boolean {
    return SUPPORTED_LANGUAGES.some(lang => lang.code === langCode);
  }

  // Get language info
  static getLanguageInfo(langCode: string): Language | null {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === langCode) || null;
  }

  // Set current language
  static setLanguage(langCode: string): void {
    if (this.isSupported(langCode)) {
      localStorage.setItem(this.STORAGE_KEY, langCode);
      
      // Update document language and direction
      document.documentElement.lang = langCode;
      const langInfo = this.getLanguageInfo(langCode);
      document.documentElement.dir = langInfo?.rtl ? 'rtl' : 'ltr';
      
      console.log('🌍 Language set to:', langCode);
    }
  }

  // Get current language
  static getCurrentLanguage(): string {
    return localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_LANGUAGE;
  }

  // Get supported languages list
  static getSupportedLanguages(): Language[] {
    return SUPPORTED_LANGUAGES;
  }

  // Auto-detect user's writing language from text input
  static async detectFromText(text: string): Promise<string | null> {
    try {
      // Simple character-based detection
      const patterns = {
        'zh': /[\u4e00-\u9fff]/,
        'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
        'ko': /[\uac00-\ud7af]/,
        'ar': /[\u0600-\u06ff]/,
        'ru': /[\u0400-\u04ff]/,
        'hi': /[\u0900-\u097f]/
      };

      for (const [lang, pattern] of Object.entries(patterns)) {
        if (pattern.test(text) && this.isSupported(lang)) {
          return lang;
        }
      }

      return null;
    } catch {
      return null;
    }
  }
}

// Initialize language detection
export const initializeLanguageDetection = () => {
  const detectedLanguage = LanguageDetector.detectUserLanguage();
  console.log('🌍 Language Detection Initialized:', detectedLanguage);
  return detectedLanguage;
};
