import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGE_KEY = 'app_language';
const LANGUAGE_SELECTED_KEY = 'app_language_selected';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState<boolean>(false);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const [stored, selected] = await Promise.all([
          AsyncStorage.getItem(LANGUAGE_KEY),
          AsyncStorage.getItem(LANGUAGE_SELECTED_KEY),
        ]);
        
        if (stored) {
          await i18n.changeLanguage(stored);
        }
        
        setHasSelectedLanguage(selected === 'true');
        console.log('[LanguageProvider] loaded', { stored, selected });
      } catch (e) {
        console.log('[LanguageProvider] loadLanguage error', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, [i18n]);

  const changeLanguage = async (lang: string, markAsSelected: boolean = false) => {
    try {
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      
      if (markAsSelected) {
        await AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
        setHasSelectedLanguage(true);
      }
      
      console.log('[LanguageProvider] changed to', lang);
    } catch (e) {
      console.log('[LanguageProvider] changeLanguage error', e);
    }
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    isLoading,
    hasSelectedLanguage,
  };
});
