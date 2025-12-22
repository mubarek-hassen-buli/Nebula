import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import am from './locales/am.json';
import en from './locales/en.json';
import om from './locales/om.json';

const LANGUAGE_STORAGE_KEY = 'user-language';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      am: { translation: am },
      om: { translation: om },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Load saved language on init
AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((savedLanguage) => {
  if (savedLanguage) {
    i18n.changeLanguage(savedLanguage);
  }
});

// Save language changes
i18n.on('languageChanged', (lng) => {
  AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
});

export default i18n;
