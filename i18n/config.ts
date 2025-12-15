import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { translations } from './translations';

const resources = Object.keys(translations).reduce(
  (acc, lang) => ({
    ...acc,
    [lang]: { translation: translations[lang] },
  }),
  {}
);

const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
