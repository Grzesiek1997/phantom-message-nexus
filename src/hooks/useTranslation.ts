
import { useState, useEffect } from 'react';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  pl: {
    // Navigation
    chats: 'Czaty',
    calls: 'Połączenia',
    contacts: 'Kontakty',
    settings: 'Ustawienia',
    
    // Chat Screen
    newChat: 'Nowy czat',
    groupChat: 'Czat grupowy',
    searchChats: 'Szukaj czatów',
    addContacts: 'Dodaj kontakty',
    typing: 'pisze...',
    online: 'online',
    lastSeen: 'ostatnio widzian',
    
    // Calls Screen
    newCall: 'Nowe połączenie',
    voiceCall: 'Połączenie głosowe',
    videoCall: 'Połączenie wideo',
    callHistory: 'Historia połączeń',
    missed: 'nieodebrane',
    incoming: 'przychodzące',
    outgoing: 'wychodzące',
    redial: 'ponowne połączenie',
    
    // Contacts Screen
    inviteFriends: 'Zaproś znajomych',
    addContact: 'Dodaj kontakt',
    myGroups: 'Moje grupy',
    blockedUsers: 'Zablokowani użytkownicy',
    
    // Settings Screen
    profile: 'Profil',
    privacy: 'Prywatność',
    notifications: 'Powiadomienia',
    language: 'Język',
    premium: 'Premium',
    about: 'O aplikacji',
    
    // Premium Features
    premiumZone: 'Strefa Premium',
    unlimitedBackup: 'Nieograniczona kopia zapasowa',
    customThemes: 'Własne motywy',
    prioritySupport: 'Wsparcie priorytetowe',
    advancedEncryption: 'Zaawansowane szyfrowanie'
  },
  en: {
    // Navigation
    chats: 'Chats',
    calls: 'Calls',
    contacts: 'Contacts',
    settings: 'Settings',
    
    // Chat Screen
    newChat: 'New Chat',
    groupChat: 'Group Chat',
    searchChats: 'Search Chats',
    addContacts: 'Add Contacts',
    typing: 'typing...',
    online: 'online',
    lastSeen: 'last seen',
    
    // Calls Screen
    newCall: 'New Call',
    voiceCall: 'Voice Call',
    videoCall: 'Video Call',
    callHistory: 'Call History',
    missed: 'missed',
    incoming: 'incoming',
    outgoing: 'outgoing',
    redial: 'redial',
    
    // Contacts Screen
    inviteFriends: 'Invite Friends',
    addContact: 'Add Contact',
    myGroups: 'My Groups',
    blockedUsers: 'Blocked Users',
    
    // Settings Screen
    profile: 'Profile',
    privacy: 'Privacy',
    notifications: 'Notifications',
    language: 'Language',
    premium: 'Premium',
    about: 'About',
    
    // Premium Features
    premiumZone: 'Premium Zone',
    unlimitedBackup: 'Unlimited Backup',
    customThemes: 'Custom Themes',
    prioritySupport: 'Priority Support',
    advancedEncryption: 'Advanced Encryption'
  },
  de: {
    chats: 'Chats',
    calls: 'Anrufe',
    contacts: 'Kontakte',
    settings: 'Einstellungen',
    newChat: 'Neuer Chat',
    groupChat: 'Gruppenchat'
  },
  fr: {
    chats: 'Discussions',
    calls: 'Appels',
    contacts: 'Contacts',
    settings: 'Paramètres',
    newChat: 'Nouvelle Discussion',
    groupChat: 'Discussion de Groupe'
  },
  es: {
    chats: 'Chats',
    calls: 'Llamadas',
    contacts: 'Contactos',
    settings: 'Configuración',
    newChat: 'Nuevo Chat',
    groupChat: 'Chat Grupal'
  }
};

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('pl');

  useEffect(() => {
    // Auto-detect language with fallback
    const browserLang = navigator.language.split('-')[0];
    const savedLang = localStorage.getItem('app_language');
    
    if (savedLang && translations[savedLang]) {
      setCurrentLanguage(savedLang);
    } else if (translations[browserLang]) {
      setCurrentLanguage(browserLang);
    } else {
      setCurrentLanguage('pl'); // Default fallback
    }
  }, []);

  const changeLanguage = (lang: string) => {
    if (translations[lang]) {
      setCurrentLanguage(lang);
      localStorage.setItem('app_language', lang);
    }
  };

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || translations.pl[key] || key;
  };

  const getAvailableLanguages = () => {
    return [
      { code: 'pl', name: 'Polski', flag: '🇵🇱' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'es', name: 'Español', flag: '🇪🇸' }
    ];
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    getAvailableLanguages
  };
};
